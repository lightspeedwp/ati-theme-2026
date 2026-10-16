/**
 * The contract every front-end page in this theme must satisfy, plus the
 * shared page-level assertions (broken images, overflow, landmarks).
 *
 * Kept in one place deliberately: thirty templates asserting the same things
 * inline is thirty places to update, and the later ones get a weaker check.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { expect } = require( '@playwright/test' );

/**
 * A rendered query-loop item.
 */
const POST_ITEM = '.wp-block-post, .wp-block-post-template > li';

/**
 * The main landmark. Result counts must be scoped through this: the header's
 * mega menus contain their own query loops, so a page-wide count of
 * `.wp-block-post` is not a count of results.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {import('@playwright/test').Locator} The main landmark.
 */
function mainContent( page ) {
	return page.locator( 'main, [role="main"]' ).first();
}

/**
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {import('@playwright/test').Locator} Query-loop items inside main.
 */
function results( page ) {
	return mainContent( page ).locator( POST_ITEM );
}

/**
 * Assert the structural invariants of a rendered block-theme page.
 *
 * ATI's header is a template part made of patterns, so it renders as a
 * `div.wp-block-template-part` containing `<header>` elements rather than a
 * `header.wp-block-template-part`; the contract therefore looks for `<header>`
 * and `<footer>` elements inside `.wp-site-blocks`.
 *
 * @param {import('@playwright/test').Page} page               Page under test.
 * @param {Object}                          [options]          Options.
 * @param {boolean}                         [options.expectH1] Require exactly one h1.
 */
async function assertPageContract( page, options = {} ) {
	const { expectH1 = true } = options;

	await expect(
		page.locator( '.wp-site-blocks' ),
		'block theme wrapper missing — template did not resolve'
	).toHaveCount( 1 );

	await expect(
		page.locator( '.wp-site-blocks header' ).first(),
		'no <header> in the site blocks — header template part missing'
	).toBeAttached();

	await expect(
		page.locator( '.wp-site-blocks > footer, .wp-site-blocks footer' ).first(),
		'no <footer> in the site blocks — footer template part missing'
	).toBeAttached();

	await expect(
		page.locator( 'main, [role="main"]' ),
		'expected exactly one main landmark'
	).toHaveCount( 1 );

	const title = await page.title();
	expect( title.trim(), 'empty <title>' ).not.toBe( '' );

	if ( expectH1 ) {
		await expect(
			page.locator( 'h1:visible' ),
			'expected exactly one visible h1 (two usually means a hero and a post-title both claiming it)'
		).toHaveCount( 1 );
	}
}

/**
 * Scroll the page top to bottom so lazy-loaded images request their source.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 */
async function scrollThrough( page ) {
	await page.evaluate( async () => {
		const step = Math.max( 400, window.innerHeight - 100 );

		for ( let y = 0; y < document.body.scrollHeight; y += step ) {
			window.scrollTo( 0, y );
			await new Promise( ( resolve ) => setTimeout( resolve, 60 ) );
		}

		window.scrollTo( 0, 0 );
	} );
	await page.waitForLoadState( 'networkidle', { timeout: 8000 } ).catch( () => {} );
}

/**
 * Images that failed to load: complete, with no natural width, and a real
 * source. Run after `scrollThrough()` so lazy images have had their turn.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {Promise<string[]>} Broken image descriptions.
 */
async function brokenImages( page ) {
	return page.evaluate( () =>
		Array.from( document.images )
			.filter( ( img ) => {
				const src = img.currentSrc || img.getAttribute( 'src' ) || '';

				if ( ! src || src.startsWith( 'data:' ) ) {
					return false;
				}

				// Hidden (display:none) images — e.g. the unused mobile/desktop
				// variant — are never fetched, so they are not broken.
				if ( ! img.offsetParent && 'fixed' !== getComputedStyle( img ).position ) {
					return false;
				}

				return img.complete && 0 === img.naturalWidth;
			} )
			.map( ( img ) => ( img.currentSrc || img.src ).slice( 0, 140 ) )
	);
}

/**
 * Horizontal overflow of the document.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {Promise<{scrollWidth: number, clientWidth: number}>} Widths.
 */
async function documentWidths( page ) {
	return page.evaluate( () => ( {
		scrollWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
	} ) );
}

/**
 * Elements that poke past the right edge of the viewport, for a useful
 * overflow message.
 *
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {Promise<string[]>} Up to 5 offenders.
 */
async function overflowCulprits( page ) {
	return page.evaluate( () => {
		const width = document.documentElement.clientWidth;

		return Array.from( document.querySelectorAll( 'body *' ) )
			.filter( ( el ) => {
				const rect = el.getBoundingClientRect();
				return rect.width > 0 && rect.right > width + 1;
			} )
			.slice( 0, 5 )
			.map(
				( el ) =>
					`<${ el.tagName.toLowerCase() } class="${ String( el.className ).slice( 0, 60 ) }"> right=${ Math.round(
						el.getBoundingClientRect().right
					) }`
			);
	} );
}

/**
 * Assert the heading hierarchy has no skipped levels (h2 → h4).
 *
 * @param {import('@playwright/test').Page} page Page under test.
 */
async function assertHeadingHierarchy( page ) {
	const levels = await page
		.locator( 'main h1, main h2, main h3, main h4, main h5, main h6' )
		.evaluateAll( ( nodes ) =>
			nodes.map( ( node ) => ( {
				level: Number( node.tagName.slice( 1 ) ),
				text: ( node.textContent || '' ).trim().slice( 0, 60 ),
			} ) )
		);

	const skips = [];
	let previous = 0;

	for ( const heading of levels ) {
		if ( previous && heading.level > previous + 1 ) {
			skips.push( `h${ previous } → h${ heading.level } at "${ heading.text }"` );
		}

		previous = heading.level;
	}

	expect( skips, `skipped heading levels: ${ skips.join( '; ' ) }` ).toEqual( [] );
}

/**
 * Links with an empty or placeholder href — the symptom of a binding that
 * failed to resolve a permalink, or a `#` left in a pattern.
 *
 * @param {import('@playwright/test').Page} page  Page under test.
 * @param {string}                          scope Selector to scan within.
 * @return {Promise<string[]>} Offending link descriptions.
 */
async function placeholderLinks( page, scope = 'body' ) {
	return page.locator( `${ scope } a[href]` ).evaluateAll( ( nodes ) =>
		nodes
			.filter( ( node ) => {
				const href = ( node.getAttribute( 'href' ) || '' ).trim();

				if ( '' !== href && '#' !== href ) {
					return false;
				}

				// Modal / toggle triggers legitimately use `#` plus JS.
				return ! (
					node.hasAttribute( 'data-toggle' ) ||
					node.hasAttribute( 'data-target' ) ||
					node.hasAttribute( 'aria-controls' ) ||
					node.hasAttribute( 'role' )
				);
			} )
			.map( ( node ) =>
				`${ ( node.textContent || node.getAttribute( 'aria-label' ) || node.outerHTML )
					.trim()
					.replace( /\s+/g, ' ' )
					.slice( 0, 50 ) } [${ node.closest( 'footer' ) ? 'footer' : node.closest( 'header' ) ? 'header' : 'main' }]`
			)
	);
}

module.exports = {
	assertPageContract,
	assertHeadingHierarchy,
	brokenImages,
	scrollThrough,
	documentWidths,
	overflowCulprits,
	placeholderLinks,
	mainContent,
	results,
	POST_ITEM,
};
