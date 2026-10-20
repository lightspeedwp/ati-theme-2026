/**
 * Content extraction for dev-vs-live parity and for rendered-data checks.
 *
 * `extractPage` is serialised by Playwright and run INSIDE a browser, so it
 * must be completely self-contained: no closures, no `require`, no outer
 * helpers. Call it as
 *
 *     page.evaluate( extractPage, { html, side } )   // parse an HTML string (DOMParser — no scripts run)
 *     page.evaluate( extractPage, { html: null, side: 'dev' } )  // read the live document
 *
 * It reads *content*, not markup: the two sites share almost no class names
 * (old LSX/Bootstrap theme vs. block theme), so everything is keyed on text
 * labels ("Duration:", "Rooms:") and on a handful of structural hooks each side
 * is known to have. Both the dev and live selectors are listed inline so a
 * markup change on either side is a one-line fix here.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

/**
 * @param {{html: (string|null), side: ('dev'|'live')}} input Document source and which site it came from.
 * @return {Object} The page's content contract.
 */
function extractPage( { html, side } ) {
	const doc =
		null === html
			? document
			: new DOMParser().parseFromString( html, 'text/html' );

	const $ = ( selector, root = doc ) => root.querySelector( selector );
	const $$ = ( selector, root = doc ) => Array.from( root.querySelectorAll( selector ) );
	const clean = ( text ) =>
		String( text || '' )
			.replace( /[ ​]/g, ' ' )
			.replace( /\s+/g, ' ' )
			.trim();
	const norm = ( text ) =>
		clean( text )
			.toLowerCase()
			.replace( /&/g, ' and ' )
			.replace( /[^a-z0-9]+/g, ' ' )
			.trim();

	/**
	 * Canonical field labels. Both sites print labelled facts ("Duration: 11"),
	 * with different casing, plurals and wording ("Travel Style" / "Travel
	 * Styles" / "Style"; "From price" / "Price from"; "Destinations" / "Location").
	 */
	const LABELS = [
		[ 'price', /^(from )?price( from)?$|^from$/ ],
		[ 'duration', /^duration$/ ],
		[ 'styles', /^(travel )?styles?$/ ],
		[ 'type', /^(accommodation )?type$/ ],
		[ 'location', /^(location|destinations?|country|region|regions)$/ ],
		[ 'rooms', /^(number of )?rooms$/ ],
		[ 'rating', /^rating$/ ],
		[ 'departs', /^departs from$/ ],
		[ 'ends', /^ends in$/ ],
		[ 'friendly', /^(friendly|suggested visitor types?)$/ ],
		[ 'interests', /^special interests?$/ ],
		[ 'languages', /^(spoken )?languages?$/ ],
		[ 'validity', /^(booking )?validity$|^valid (from|until|to)$|^booking valid.*$/ ],
		[ 'checkin', /^check[ -]?in( time)?$/ ],
		[ 'checkout', /^check[ -]?out( time)?$/ ],
		[ 'childage', /^minimum child age$/ ],
		[ 'supplement', /^single supplement$/ ],
		[ 'expert', /^your travel expert$/ ],
		[ 'date', /^date travell?ed$/ ],
	];
	const canonical = ( label ) => {
		const key = norm( label );
		const hit = LABELS.find( ( [ , pattern ] ) => pattern.test( key ) );

		return hit ? hit[ 0 ] : null;
	};

	/**
	 * Printed labels, longest first so "Travel Styles" wins over "Style".
	 */
	const PRINTED = [
		'From price',
		'Price from',
		'Duration',
		'Departs from',
		'Ends in',
		'Destinations',
		'Destination',
		'Location',
		'Travel Styles',
		'Travel Style',
		'Style',
		'Accommodation Type',
		'Type',
		'Number of rooms',
		'Rooms',
		'Rating',
		'Booking validity',
		'Valid from',
		'Valid until',
		'Check in time',
		'Check out time',
		'Check-in',
		'Check-out',
		'Friendly',
		'Suggested visitor types',
		'Special Interests',
		'Spoken Languages',
		'Minimum child age',
		'Single supplement',
		'Your travel expert',
		'Date travelled',
		'Date traveled',
	].sort( ( a, b ) => b.length - a.length );
	const LABEL_SCAN = new RegExp(
		`(?<![A-Za-z])(${ PRINTED.map( ( l ) => l.replace( /[-\s]/g, '[-\\s]' ) ).join( '|' ) })\\s*:\\s*`,
		'gi'
	);

	/**
	 * Text with a line break at every block boundary (DOMParser documents have
	 * no layout, so `innerText` is not available).
	 */
	const BLOCK = /^(address|article|aside|blockquote|br|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tr|ul)$/i;
	const linesOf = ( root ) => {
		let out = '';
		const walk = ( node ) => {
			if ( 3 === node.nodeType ) {
				out += node.nodeValue;

				return;
			}

			if ( 1 !== node.nodeType ) {
				return;
			}

			const tag = node.tagName;

			if ( /^(script|style|noscript|template|svg|iframe|select|option|button)$/i.test( tag ) ) {
				return;
			}

			const block = BLOCK.test( tag );

			if ( block ) {
				out += '\n';
			}

			node.childNodes.forEach( walk );

			if ( block ) {
				out += '\n';
			}
		};

		walk( root );

		return out
			.split( '\n' )
			.map( clean )
			.filter( Boolean );
	};

	const slugOf = ( href ) => {
		try {
			return new URL( href, 'https://x.invalid' ).pathname
				.split( '/' )
				.filter( Boolean )
				.pop() || '';
		} catch {
			return '';
		}
	};
	const pathOf = ( href ) => {
		try {
			return new URL( href, 'https://x.invalid' ).pathname.replace( /\/?$/, '/' );
		} catch {
			return '';
		}
	};

	/**
	 * Page identity.
	 */
	const h1El = $( 'h1.page-title' ) || $( 'main h1, #main h1' ) || $( 'h1' );
	const h1 = clean( h1El ? h1El.textContent : '' );

	const root =
		$( 'main#main' ) ||
		$( 'main' ) ||
		$( '#primary' ) ||
		$( '#content' ) ||
		doc.body;

	/**
	 * The page's own cards (related lists, archive grids).
	 *
	 * live: `article.post-ID.<type>.type-lsx-to-<type>` inside `.lsx-to-widget-*`
	 * dev:  `li.wp-block-post` inside `.wp-block-post-template`
	 */
	const TYPE_WORDS = 'tour|accommodation|destination|review|special|team|post|page';
	const typeOf = ( el ) => {
		const match = String( el.className ).match(
			new RegExp( `\\btype-(?:lsx-to-)?(${ TYPE_WORDS })\\b` )
		);

		return match ? match[ 1 ] : '';
	};
	const idOf = ( el ) => {
		const match = String( el.className ).match( /\bpost-(\d+)\b/ );

		return match ? match[ 1 ] : '';
	};

	const selfMatch = String( ( $( 'body' ) || {} ).className || '' ).match( /\b(?:postid|page-id|term)-(\d+)\b/ );
	const selfId = selfMatch ? selfMatch[ 1 ] : '';

	/**
	 * live: widget cards are `.lsx-to-widget-item-wrap article`; archive grids
	 *       and slider clones repeat, so cards are de-duplicated by type:id.
	 *       The page's own entry (`article.post-<selfId>`) and the per-day
	 *       accommodation entries inside the itinerary are not cards.
	 * dev:  `li.wp-block-post` inside a post-template.
	 */
	const itineraryHost = $$( '[id]', root ).find( ( el ) => 'itinerary' === el.id.toLowerCase() ) || null;
	const cardNodes = (
		'live' === side
			? $$( 'article[class*="type-"]', root ).filter(
					( el ) =>
						idOf( el ) &&
						idOf( el ) !== selfId &&
						! ( itineraryHost && itineraryHost.contains( el ) ) &&
						! el.closest( '.lsx-map, .map-data' )
				)
			: $$( 'li.wp-block-post', root ).filter( ( el ) => idOf( el ) !== selfId )
	).filter( ( el, index, all ) => {
		const key = `${ typeOf( el ) }:${ idOf( el ) }`;

		return all.findIndex( ( other ) => `${ typeOf( other ) }:${ idOf( other ) }` === key ) === index;
	} );

	const cardFields = ( card ) => {
		const fields = {};
		const add = ( label, value ) => {
			const key = canonical( label );
			const text = clean( value );

			if ( key && text && ! ( key in fields ) ) {
				fields[ key ] = text;
			}
		};

		if ( 'live' === side ) {
			$$( '.lsx-to-meta-data', card ).forEach( ( span ) => {
				const keyEl = $( '.lsx-to-meta-data-key', span );

				if ( keyEl ) {
					const label = clean( keyEl.textContent ).replace( /:$/, '' );
					add( label, clean( span.textContent ).slice( clean( keyEl.textContent ).length ) );
				}
			} );
		} else {
			// Block-theme rows: a post-terms block (prefix span carries the
			// label) or a bound paragraph whose prefix reads "Rooms: 8".
			$$( '.wp-block-post-terms', card ).forEach( ( terms ) => {
				const prefix = $( '.wp-block-post-terms__prefix', terms );

				if ( prefix ) {
					add(
						clean( prefix.textContent ).replace( /:$/, '' ),
						clean( terms.textContent ).slice( clean( prefix.textContent ).length )
					);
				}
			} );

			$$( 'p', card )
				.filter( ( p ) => ! p.closest( '.wp-block-post-excerpt' ) )
				.forEach( ( p ) => {
					const match = clean( p.textContent ).match( /^([A-Za-z][A-Za-z ]{1,26}):\s*(.+)$/ );

					if ( match ) {
						add( match[ 1 ], match[ 2 ] );
					}
				} );
		}

		return fields;
	};

	const cards = cardNodes.map( ( card ) => {
		const type = typeOf( card );
		const links = $$( 'a[href]', card )
			.map( ( a ) => a.getAttribute( 'href' ) )
			.filter( ( href ) => href && ! href.startsWith( '#' ) && ! /^(mailto|tel):/.test( href ) );
		const own = links.find( ( href ) => pathOf( href ).startsWith( `/${ type }/` ) ) || '';
		const titleEl = $( 'h2, h3, h4, h5, .wp-block-post-title, .lsx-to-widget-title', card );

		return {
			type,
			id: idOf( card ),
			slug: slugOf( own ),
			path: pathOf( own ),
			title: clean( titleEl ? titleEl.textContent : '' ),
			fields: cardFields( card ),
		};
	} );

	/**
	 * A cleaned clone for text/facts: no chrome, no cards, no dialogs.
	 */
	const stripSelectors = [
		'script,style,template,svg,iframe,header,footer,nav,dialog,button,select',
		'.lsx-to-widget-item-wrap,.wp-block-post-template,.lsx-to-widget-items,li.wp-block-post',
		'[class*="modal"],[id*="modal"],.lsx-to-sr-only,.screen-reader-text',
		'.breadcrumbs,.yoast-breadcrumbs,[class*="breadcrumb"]',
		'form,.gform_wrapper,.envira-gallery-wrap,.lsx-map,.map-data',
	].join( ',' );

	const factRoot = root.cloneNode( true );
	$$( stripSelectors, factRoot ).forEach( ( el ) => el.remove() );

	// Itinerary and unit days carry their own "Location:/Type:" lines — keep
	// them out of the page-level facts.
	const byId = ( ...ids ) =>
		$$( '[id]', root ).find( ( el ) => ids.includes( el.id.toLowerCase() ) ) || null;
	const itineraryEl = byId( 'itinerary' ) || $( '.lsx-itinerary-wrapper', root );
	const unitsEl =
		byId( 'units', 'rooms', 'tents', 'chalets', 'suites', 'villas', 'lodges', 'cabins', 'apartments' ) ||
		$( '.lsx-units-wrapper, .rooms-wrapper', root );
	const galleryEl = byId( 'gallery' ) || $( '.lsx-gallery-wrapper', root );
	const mapEl =
		byId( 'map', 'tour-map', 'accommodation-map', 'destination-map', 'location' ) ||
		$( '.lsx-map, .lsx-map-preview, [class*="lsx-to-map"]', root ) ||
		$( 'iframe[src*="google.com/maps"], iframe[src*="wetu"]', doc );

	const factNodes = factRoot.cloneNode( true );
	[ itineraryEl, unitsEl, galleryEl ].forEach( ( el ) => {
		if ( el && el.id ) {
			const twin = $$( '[id]', factNodes ).find( ( n ) => n.id === el.id );

			if ( twin ) {
				twin.remove();
			}
		}
	} );
	$$( '.lsx-itinerary-wrapper,.lsx-units-wrapper,.rooms-wrapper,.lsx-gallery-wrapper', factNodes ).forEach( ( el ) => el.remove() );

	/**
	 * Facts: "Label: value" pairs, several to a line on live (spans run
	 * together: "Duration: 11Departs from: Victoria Falls").
	 */
	const facts = {};
	const factLines = linesOf( factNodes );

	if ( 'live' === side ) {
		// Live's spans run together in text ("Duration: 11Departs from: …"), so
		// read them as the elements they are.
		$$( '.lsx-to-meta-data', factNodes ).forEach( ( span ) => {
			const keyEl = $( '.lsx-to-meta-data-key', span );
			const key = keyEl ? canonical( clean( keyEl.textContent ).replace( /:$/, '' ) ) : null;
			const value = keyEl ? clean( span.textContent ).slice( clean( keyEl.textContent ).length ) : '';

			if ( key && clean( value ) && ! ( key in facts ) ) {
				facts[ key ] = clean( value );
			}
		} );
	}

	factLines.forEach( ( line ) => {
		const marks = 'live' === side ? [] : [ ...line.matchAll( LABEL_SCAN ) ];

		marks.forEach( ( mark, index ) => {
			const key = canonical( mark[ 1 ] );
			const start = mark.index + mark[ 0 ].length;
			const end = index + 1 < marks.length ? marks[ index + 1 ].index : line.length;
			let value = clean( line.slice( start, end ) );

			// A bound value in its own element sits on the following line(s):
			// "Date travelled:" / "January 1, 1970" / "–" / "January 1, 1970".
			if ( ! value && index + 1 === marks.length ) {
				const at = factLines.indexOf( line );
				const tail = [];

				for ( const next of factLines.slice( at + 1, at + 4 ) ) {
					LABEL_SCAN.lastIndex = 0;

					if ( LABEL_SCAN.test( next ) ) {
						break;
					}

					tail.push( next );
				}

				value = clean( tail.join( ' ' ) );
			}

			if ( key && value && ! ( key in facts ) ) {
				facts[ key ] = value;
			}
		} );

		// "Your travel expert:" is followed by the name on the NEXT line on live.
		if ( /^your travel expert:?$/i.test( line ) ) {
			const next = factLines[ factLines.indexOf( line ) + 1 ];

			if ( next && ! ( 'expert' in facts ) ) {
				facts.expert = next;
			}
		}
	} );

	/**
	 * Body paragraphs: substantive prose inside the cleaned clone, minus lines
	 * that are really label/value facts.
	 */
	const paragraphs = [];
	const seen = new Set();

	$$( 'p, li, blockquote, h2, h3, h4', factRoot ).forEach( ( el ) => {
		// Leaf-most only: a `li` holding a `p` would count twice.
		if ( $( 'p, li, blockquote', el ) ) {
			return;
		}

		const text = clean( el.textContent );
		LABEL_SCAN.lastIndex = 0;
		const isFact = LABEL_SCAN.test( text ) && 160 > text.length;
		const key = norm( text );

		if ( 40 > text.length || isFact || seen.has( key ) ) {
			return;
		}

		seen.add( key );
		paragraphs.push( text );
	} );

	/**
	 * Itinerary: distinct "Day N" lines.
	 */
	const days = [];

	if ( itineraryEl ) {
		linesOf( itineraryEl ).forEach( ( line ) => {
			const match = line.match( /^Day\s+(\d+)(?:\s*[-–]\s*(\d+))?\b/i );

			if ( match && ! days.includes( match[ 1 ] ) ) {
				days.push( match[ 1 ] );
			}
		} );
	}

	/**
	 * Units: live prints each as `article.rooms-content`; dev as a
	 * `.lsx-unit-image` inside `.lsx-units-wrapper`.
	 */
	let units = 0;

	if ( unitsEl ) {
		units =
			$$( 'article.rooms-content', unitsEl ).length ||
			$$( '.lsx-unit-image', unitsEl ).length ||
			$$( 'h3, h4, h5', unitsEl ).length;
	}

	/**
	 * Gallery: distinct images, size suffix stripped so `-360x168` and the
	 * original count once. Reads <noscript> too (live lazy-loads behind it).
	 */
	const galleryImages = new Set();

	if ( galleryEl ) {
		$$( 'img, a[href]', galleryEl ).forEach( ( el ) => {
			const src = el.getAttribute( 'data-src' ) || el.getAttribute( 'src' ) || el.getAttribute( 'href' ) || '';

			if ( /\.(jpe?g|png|webp|gif)(\?|$)/i.test( src ) ) {
				galleryImages.add( src.replace( /-\d+x\d+(?=\.)/, '' ) );
			}
		} );
	}

	const headings = $$( 'h2', root )
		.filter( ( h ) => ! h.closest( 'header,footer,nav,.lsx-to-widget-item-wrap,li.wp-block-post' ) )
		.map( ( h ) => norm( h.textContent ) )
		.filter( Boolean );

	const enquiry =
		!! $( '.gform_wrapper, form[id^="gform_"]', doc ) ||
		!! $( 'a[href*="modal-enquiry"], [data-target*="enquiry" i], a[href*="tour-enquiry"], [aria-controls*="enquiry" i]', doc ) ||
		$$( 'a, button', root ).some( ( el ) => /\benquir/i.test( el.textContent ) );

	return {
		side,
		title: clean( doc.title ).replace( /\s*[|–-]\s*ATI Holidays.*$/i, '' ),
		h1,
		facts,
		paragraphs,
		text: norm( linesOf( doc.body ).join( ' ' ) ),
		cards,
		itinerary: { present: !! itineraryEl, days },
		units: { present: !! unitsEl, count: units },
		gallery: { present: !! galleryEl, count: galleryImages.size },
		map: !! mapEl,
		enquiry,
		headings,
		bodyLength: norm( paragraphs.join( ' ' ) ).length,
	};
}

module.exports = { extractPage };
