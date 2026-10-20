/* global DOMParser -- extractChrome() runs inside the browser (page.evaluate). */

/**
 * Site chrome (header menus, top bar, footer) for dev-vs-live parity.
 *
 * Content parity compares page bodies; the menus and footer are the same on
 * every page, so they are compared once, here. This is where artefacts like an
 * empty mega menu or travel-style cards that all link to one destination show.
 *
 * `extractChrome` is serialised by Playwright and run INSIDE a browser on an
 * HTML string, so it must be self-contained (no closures or requires):
 *
 *     page.evaluate( extractChrome, { html, side } )
 *
 * Live is the old LSX/Bootstrap theme (WordPress menus: #menu-main-menu,
 * .top-menu, #menu-quick-links …); dev is the block theme (core/navigation,
 * Ollie mega menus, .ati-top-header, footer). Both selector sets are inline.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { pendingReason } = require( '../fixtures/known-pending.js' );
const {
	intentionalReason,
} = require( '../fixtures/intentional-differences.js' );

/**
 * @param {{html: string, side: ('dev'|'live')}} input Document and which site it came from.
 * @return {Object} Menus, top-bar contacts, footer links and social profiles.
 */
function extractChrome( { html, side } ) {
	const doc = new DOMParser().parseFromString( html, 'text/html' );
	const $$ = ( selector, root = doc ) =>
		Array.from( root.querySelectorAll( selector ) );
	const clean = ( text ) =>
		String( text || '' )
			.replace( /\s+/g, ' ' )
			.trim();
	const pathOf = ( href ) => {
		try {
			const url = new URL( href, 'https://example.invalid' );
			return url.pathname.replace( /\/?$/, '/' ) + url.hash;
		} catch {
			return href || '';
		}
	};
	const linksIn = ( root, skip = null ) =>
		$$( 'a[href]', root )
			.filter(
				( a ) =>
					a !== skip &&
					! /^(#|javascript:)/.test( a.getAttribute( 'href' ) )
			)
			.map( ( a ) => ( {
				text: clean( a.textContent ),
				path: pathOf( a.getAttribute( 'href' ) ),
			} ) )
			.filter( ( link ) => link.text || '/' !== link.path );

	const menu = [];
	let topBar = [];
	let footer = [];
	let social = [];

	if ( 'live' === side ) {
		$$( '#menu-main-menu > li' ).forEach( ( li ) => {
			const top = li.querySelector( ':scope > a' );
			menu.push( {
				label: clean( top ? top.textContent : '' ),
				links: linksIn( li, top ),
			} );
		} );
		topBar = $$(
			'.top-menu a[href^="tel:"], .top-menu a[href^="mailto:"], header a[href^="tel:"], header a[href^="mailto:"]'
		).map( ( a ) => a.getAttribute( 'href' ) );
		footer = $$(
			'#menu-quick-links a, #menu-footer-contact a, #menu-footer-menu a'
		).map( ( a ) => clean( a.textContent ) );
		social = $$(
			'#menu-social-menu a, footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="twitter.com"], footer a[href*="x.com"], footer a[href*="linkedin.com"], footer a[href*="youtube.com"]'
		).map( ( a ) => a.getAttribute( 'href' ) );
	} else {
		const nav =
			doc.querySelector(
				'header .wp-block-navigation.is-style-header-nav'
			) || doc.querySelector( 'header .wp-block-navigation' );

		// The menu's own list: mega-menu dropdowns hold navigation blocks of
		// their own, whose items are dropdown links, not top-level items.
		const list =
			nav &&
			$$( '.wp-block-navigation__container', nav ).find(
				( ul ) =>
					! ul.closest(
						'.wp-block-ollie-mega-menu__menu-container, [id$="-dropdown"]'
					)
			);

		if ( list ) {
			$$( ':scope > li', list ).forEach( ( li ) => {
				const label = li.querySelector(
					'.wp-block-navigation-item__label, .wp-block-ollie-mega-menu__toggle, a'
				);
				const top = li.querySelector( ':scope > a' );
				menu.push( {
					label: clean( label ? label.textContent : '' ),
					links: linksIn( li, top ),
				} );
			} );
		}
		topBar = $$(
			'.ati-top-header a[href^="tel:"], .ati-top-header a[href^="mailto:"], header a[href^="tel:"], header a[href^="mailto:"]'
		).map( ( a ) => a.getAttribute( 'href' ) );
		footer = $$( 'footer a[href]' )
			.filter( ( a ) => ! a.closest( '.wp-block-social-links' ) )
			.map( ( a ) => clean( a.textContent ) );
		social = $$(
			'footer .wp-block-social-links a, footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="twitter.com"], footer a[href*="x.com"], footer a[href*="linkedin.com"], footer a[href*="youtube.com"]'
		).map( ( a ) => a.getAttribute( 'href' ) );
	}

	const unique = ( list ) => [ ...new Set( list.filter( Boolean ) ) ];

	return {
		side,
		menu: menu.filter( ( item ) => item.label ),
		topBar: unique( topBar ),
		footer: unique( footer ),
		social: unique( social ),
	};
}

/**
 * @param {string} text Text.
 * @return {string} Lower-case letters and digits only, for matching labels.
 */
function key( text ) {
	return String( text || '' )
		.toLowerCase()
		.replace( /&amp;/g, '&' )
		.replace( /[^a-z0-9]+/g, '' );
}

/**
 * Normalise a tel:/mailto: href for comparison.
 *
 * @param {string} href Href.
 * @return {string} Digits of a phone number, or the lower-cased address.
 */
function contactKey( href ) {
	const value = decodeURIComponent( String( href ) );

	return value.startsWith( 'tel:' )
		? 'tel:' +
				value
					.replace( /\(0\)/g, '' )
					.replace( /\D/g, '' )
					.replace( /^0+/, '' )
		: value.toLowerCase().trim();
}

/**
 * @param {string} href A social profile URL.
 * @return {string} Its network and handle, e.g. "instagram.com/atiholidays".
 */
function socialKey( href ) {
	try {
		const url = new URL( href );
		return `${ url.hostname.replace( /^www\./, '' ).replace( /^twitter\.com$/, 'x.com' ) }${ url.pathname.replace( /\/$/, '' ).toLowerCase() }`;
	} catch {
		return String( href );
	}
}

/**
 * Compare live's chrome with dev's.
 *
 * @param {Object} live `extractChrome()` of live.
 * @param {Object} dev  `extractChrome()` of dev.
 * @return {Object[]} Differences, classed as in utils/compare.js.
 */
function compareChrome( live, dev ) {
	const diffs = [];
	const add = ( cls, field, label, liveValue, devValue, detail = '' ) => {
		let finalClass = cls;
		let reason = null;
		let tag = '';

		if ( 'MISSING_ON_DEV' === cls ) {
			reason = pendingReason( 'chrome', field );
			tag = reason ? 'pending' : '';
			finalClass = reason ? 'KNOWN_PENDING' : cls;

			if ( ! reason ) {
				reason = intentionalReason( 'chrome', field, liveValue );
				tag = reason ? 'intentional' : '';
				finalClass = reason ? 'INTENTIONAL' : cls;
			}
		}

		diffs.push( {
			cls: finalClass,
			field,
			label,
			live: liveValue,
			dev: devValue,
			detail: reason
				? `${ detail } [${ tag }: ${ reason }]`.trim()
				: detail,
		} );
	};

	// Menus: every top-level item, and every link in its dropdown.
	for ( const item of live.menu ) {
		const match = dev.menu.find(
			( d ) => key( d.label ) === key( item.label )
		);

		if ( ! match ) {
			add(
				'MISSING_ON_DEV',
				'chrome.menu',
				`Main menu item "${ item.label }"`,
				item.label,
				''
			);
			continue;
		}

		if ( item.links.length && ! match.links.length ) {
			add(
				'MISSING_ON_DEV',
				`chrome.menu.${ key( item.label ) }`,
				`"${ item.label }" dropdown`,
				`${ item.links.length } links`,
				'empty',
				'the dropdown renders with nothing in it'
			);
			continue;
		}

		for ( const link of item.links ) {
			const found = match.links.find(
				( d ) =>
					( link.text && key( d.text ) === key( link.text ) ) ||
					( ! link.text && d.path === link.path )
			);

			if ( ! found ) {
				add(
					'MISSING_ON_DEV',
					`chrome.menu.${ key( item.label ) }`,
					`"${ item.label }" dropdown link`,
					link.text || link.path,
					'',
					`live links to ${ link.path }`
				);
			} else if ( link.text && found.path !== link.path ) {
				// Same label, different target: how "every travel style links to Zimbabwe" looks.
				add(
					'MISSING_ON_DEV',
					`chrome.menu.${ key( item.label ) }.href`,
					`"${ item.label }" → "${ link.text }" link target`,
					link.path,
					found.path,
					'same item, different destination'
				);
			}
		}
	}

	for ( const item of dev.menu ) {
		if (
			! live.menu.some( ( l ) => key( l.label ) === key( item.label ) )
		) {
			add(
				'EXTRA_ON_DEV',
				'chrome.menu',
				`Main menu item "${ item.label }"`,
				'',
				item.label
			);
		}
	}

	// Top bar: phone numbers and email addresses.
	const devContacts = new Set( dev.topBar.map( contactKey ) );
	for ( const href of live.topBar ) {
		if ( ! devContacts.has( contactKey( href ) ) ) {
			add(
				'MISSING_ON_DEV',
				'chrome.topbar',
				'Top bar contact',
				href.replace( /^(tel|mailto):/, '' ),
				''
			);
		}
	}

	// Footer links, by label.
	const devFooter = new Set( dev.footer.map( key ) );
	for ( const label of live.footer ) {
		if ( ! devFooter.has( key( label ) ) ) {
			add( 'MISSING_ON_DEV', 'chrome.footer', 'Footer link', label, '' );
		}
	}

	// Social profiles.
	const devSocial = new Set( dev.social.map( socialKey ) );
	for ( const href of live.social ) {
		if ( ! devSocial.has( socialKey( href ) ) ) {
			add(
				'MISSING_ON_DEV',
				'chrome.social',
				'Social profile',
				socialKey( href ),
				''
			);
		}
	}

	return diffs;
}

module.exports = { extractChrome, compareChrome };
