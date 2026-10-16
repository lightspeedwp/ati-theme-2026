/**
 * Dev-vs-live content comparison and classification.
 *
 * Takes two `extractPage()` results for the same path and returns a list of
 * differences, each classed:
 *
 *   MISSING_ON_DEV  Live shows it, dev does not. The category that matters: it
 *                   is how a theme/binding bug looks (a wrapper hiding a row, a
 *                   section that never renders). FAILS the run unless the
 *                   difference is listed in fixtures/known-pending.js.
 *   CONTENT_DRIFT   Both show it but the text differs, or a long list is
 *                   partial. Probably stale dev content (live has been edited
 *                   since the last sync); a resync happens before deploy.
 *                   Warning only.
 *   EXTRA_ON_DEV    Dev shows something live does not. Informational.
 *   KNOWN_PENDING   A MISSING_ON_DEV that fixtures/known-pending.js accounts
 *                   for. Reported, does not fail.
 *   STALE           The page itself differs by environment (live 404 or
 *                   redirect, or a live-only related item that does not exist
 *                   on dev). Warning only.
 *
 * What is NOT compared: appearance (the rebuild is a deliberate redesign) and
 * markup.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { pendingReason } = require( '../fixtures/known-pending.js' );

const CLASSES = [
	'MISSING_ON_DEV',
	'KNOWN_PENDING',
	'CONTENT_DRIFT',
	'STALE',
	'EXTRA_ON_DEV',
];

const LIST_FACTS = [ 'location', 'styles', 'friendly', 'interests', 'languages' ];

/**
 * @param {string} text Normalised text.
 * @return {Map<string, number>} Word-bigram counts.
 */
function bigrams( text ) {
	const words = text.split( ' ' ).filter( Boolean );
	const map = new Map();

	for ( let i = 0; i < words.length - 1; i++ ) {
		const key = `${ words[ i ] } ${ words[ i + 1 ] }`;
		map.set( key, ( map.get( key ) || 0 ) + 1 );
	}

	return map;
}

/**
 * Sørensen–Dice similarity of two normalised strings on word bigrams, 0–1.
 *
 * @param {string} a Normalised text.
 * @param {string} b Normalised text.
 * @return {number} Similarity.
 */
function dice( a, b ) {
	if ( a === b ) {
		return 1;
	}

	const left = bigrams( a );
	const right = bigrams( b );
	const total = [ ...left.values() ].reduce( ( s, n ) => s + n, 0 ) +
		[ ...right.values() ].reduce( ( s, n ) => s + n, 0 );

	if ( ! total ) {
		return a && b && ( a.includes( b ) || b.includes( a ) ) ? 1 : 0;
	}

	let shared = 0;

	for ( const [ key, count ] of left ) {
		shared += Math.min( count, right.get( key ) || 0 );
	}

	return ( 2 * shared ) / total;
}

/**
 * Same normalisation the extractor uses, for text that arrives here raw.
 *
 * @param {string} text Raw text.
 * @return {string} Normalised text.
 */
function norm( text ) {
	return String( text || '' )
		.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /[^a-z0-9]+/g, ' ' )
		.trim();
}

/**
 * @param {string} value Fact value.
 * @return {Set<string>} Comma/“and”-separated items, normalised.
 */
function items( value ) {
	return new Set(
		String( value )
			.split( /,|;|\band\b|&/i )
			.map( norm )
			.filter( Boolean )
	);
}

/**
 * Does a card on one side correspond to a card on the other? Ids first (a DB
 * clone keeps them), then slug.
 *
 * @param {Object} a Card.
 * @param {Object} b Card.
 * @return {boolean} Same post.
 */
function sameCard( a, b ) {
	return (
		a.type === b.type &&
		( ( a.id && b.id && a.id === b.id ) || ( a.slug && a.slug === b.slug ) )
	);
}

/**
 * @param {Object} input Comparison input.
 * @param {string} input.type    Page type (tour, accommodation, destination, review, special, team, post, page, archive, term, home).
 * @param {Object} input.live    `extractPage()` of live.
 * @param {Object} input.dev     `extractPage()` of dev.
 * @param {Object} input.devIndex `{ [type]: { slugs:Set, ids:Set } }` of what exists on dev.
 * @param {boolean} [input.listing] Archive/listing page: card sets are paged and ordered differently, so only per-card fields are compared.
 * @return {{diffs: Object[], similarity: number}} Differences and the body-text similarity.
 */
function compare( { type, live, dev, devIndex = {}, listing = false } ) {
	const diffs = [];
	const add = ( cls, field, label, liveValue, devValue, detail = '' ) => {
		let finalClass = cls;
		let reason = null;

		if ( 'MISSING_ON_DEV' === cls ) {
			reason = pendingReason( type, field );

			if ( reason ) {
				finalClass = 'KNOWN_PENDING';
			}
		}

		diffs.push( {
			cls: finalClass,
			field,
			label,
			live: liveValue,
			dev: devValue,
			detail: reason ? `${ detail } [pending: ${ reason }]`.trim() : detail,
		} );
	};
	const short = ( text, max = 110 ) => {
		const value = String( text ?? '' );

		return value.length > max ? `${ value.slice( 0, max ) }…` : value;
	};

	// Heading.
	if ( live.h1 && ! dev.h1 ) {
		add( 'MISSING_ON_DEV', 'h1', 'Page heading (h1)', live.h1, '' );
	} else if ( live.h1 && norm( live.h1 ) !== norm( dev.h1 ) ) {
		add( 'CONTENT_DRIFT', 'h1', 'Page heading (h1)', live.h1, dev.h1 );
	}

	// Facts.
	for ( const key of new Set( [ ...Object.keys( live.facts ), ...Object.keys( dev.facts ) ] ) ) {
		const l = live.facts[ key ];
		const d = dev.facts[ key ];
		const label = `Fact: ${ key }`;

		if ( l && ! d ) {
			add( 'MISSING_ON_DEV', `fact.${ key }`, label, l, '' );
		} else if ( ! l && d ) {
			add( 'EXTRA_ON_DEV', `fact.${ key }`, label, '', d );
		} else if ( l && d ) {
			if ( LIST_FACTS.includes( key ) ) {
				const left = items( l );
				const right = items( d );
				const lost = [ ...left ].filter( ( x ) => ! right.has( x ) );
				const gained = [ ...right ].filter( ( x ) => ! left.has( x ) );

				if ( lost.length ) {
					add( 'CONTENT_DRIFT', `fact.${ key }`, label, l, d, `not on dev: ${ lost.join( ', ' ) }` );
				} else if ( gained.length ) {
					add( 'EXTRA_ON_DEV', `fact.${ key }`, label, l, d, `extra on dev: ${ gained.join( ', ' ) }` );
				}
			} else if ( 'price' === key ) {
				if ( l.replace( /\D/g, '' ) !== d.replace( /\D/g, '' ) ) {
					add( 'CONTENT_DRIFT', `fact.${ key }`, label, l, d );
				}
			} else if ( norm( l ) !== norm( d ) && ! norm( d ).includes( norm( l ) ) ) {
				add( 'CONTENT_DRIFT', `fact.${ key }`, label, l, d );
			}
		}
	}

	if ( ! listing ) {
		// Itinerary.
		if ( live.itinerary.days.length && ! dev.itinerary.days.length ) {
			add( 'MISSING_ON_DEV', 'itinerary', 'Itinerary days', `${ live.itinerary.days.length } days`, '0' );
		} else if ( live.itinerary.days.length !== dev.itinerary.days.length && dev.itinerary.days.length ) {
			add( 'CONTENT_DRIFT', 'itinerary', 'Itinerary days', `${ live.itinerary.days.length } days`, `${ dev.itinerary.days.length } days` );
		}

		// Units / rooms.
		if ( live.units.count && ! dev.units.count ) {
			add( 'MISSING_ON_DEV', 'units', 'Rooms / units', String( live.units.count ), '0' );
		} else if ( live.units.count !== dev.units.count && dev.units.count ) {
			add( 'CONTENT_DRIFT', 'units', 'Rooms / units', String( live.units.count ), String( dev.units.count ) );
		}

		// Gallery (tolerant: lazy loading and sizes make exact counts noisy).
		if ( live.gallery.count && ! dev.gallery.count ) {
			add( 'MISSING_ON_DEV', 'gallery', 'Gallery images', String( live.gallery.count ), '0' );
		} else if ( live.gallery.count >= 4 && dev.gallery.count < live.gallery.count * 0.5 ) {
			add( 'CONTENT_DRIFT', 'gallery', 'Gallery images', String( live.gallery.count ), String( dev.gallery.count ) );
		}

		if ( live.map && ! dev.map ) {
			add( 'MISSING_ON_DEV', 'map', 'Map', 'present', 'absent' );
		} else if ( ! live.map && dev.map ) {
			add( 'EXTRA_ON_DEV', 'map', 'Map', 'absent', 'present' );
		}

		if ( live.enquiry && ! dev.enquiry ) {
			add( 'MISSING_ON_DEV', 'enquiry', 'Enquiry form / button', 'present', 'absent' );
		}

		// Related items, per post type: the SET of linked posts.
		const types = new Set( [ ...live.cards, ...dev.cards ].map( ( c ) => c.type ).filter( Boolean ) );

		for ( const cardType of types ) {
			const l = live.cards.filter( ( c ) => c.type === cardType );
			const d = dev.cards.filter( ( c ) => c.type === cardType );
			const lost = l.filter( ( c ) => ! d.some( ( x ) => sameCard( c, x ) ) );
			const gained = d.filter( ( c ) => ! l.some( ( x ) => sameCard( c, x ) ) );
			const name = ( c ) => c.slug || c.title;

			if ( l.length && ! d.length ) {
				add( 'MISSING_ON_DEV', `related.${ cardType }`, `Related ${ cardType } list`, `${ l.length } items`, '0', l.slice( 0, 4 ).map( name ).join( ', ' ) );
			} else if ( lost.length ) {
				const index = devIndex[ cardType ];
				const onDev = lost.filter( ( c ) => index && ( index.slugs.has( c.slug ) || index.ids.has( c.id ) ) );
				const gone = lost.filter( ( c ) => ! onDev.includes( c ) );

				if ( onDev.length ) {
					// Exists on dev but is not connected/shown there: connection data or binding.
					add( 'CONTENT_DRIFT', `related.${ cardType }`, `Related ${ cardType } set`, `${ l.length } items`, `${ d.length } items`, `live links to ${ onDev.map( name ).join( ', ' ) } — post exists on dev but is not in the list` );
				}

				if ( gone.length ) {
					add( 'STALE', `related.${ cardType }`, `Related ${ cardType } set`, `${ l.length } items`, `${ d.length } items`, `only on live (not on dev yet): ${ gone.map( name ).join( ', ' ) }` );
				}
			}

			if ( gained.length && ! lost.length ) {
				add( 'EXTRA_ON_DEV', `related.${ cardType }`, `Related ${ cardType } set`, `${ l.length } items`, `${ d.length } items`, `extra on dev: ${ gained.map( name ).join( ', ' ) }` );
			}
		}
	}

	// Per-card meta rows: the SET of fields each card shows.
	const byField = new Map();

	for ( const liveCard of live.cards ) {
		const devCard = dev.cards.find( ( c ) => sameCard( liveCard, c ) );

		if ( ! devCard ) {
			continue;
		}

		for ( const key of new Set( [ ...Object.keys( liveCard.fields ), ...Object.keys( devCard.fields ) ] ) ) {
			const inLive = key in liveCard.fields;
			const inDev = key in devCard.fields;

			if ( inLive === inDev ) {
				continue;
			}

			const field = `card.${ liveCard.type }.${ key }`;
			const cls = inLive ? 'MISSING_ON_DEV' : 'EXTRA_ON_DEV';

			if ( ! byField.has( `${ cls }|${ field }` ) ) {
				byField.set( `${ cls }|${ field }`, { cls, field, key, type: liveCard.type, cards: [] } );
			}

			byField.get( `${ cls }|${ field }` ).cards.push( `${ liveCard.slug || liveCard.title }${ inLive ? ` (“${ short( liveCard.fields[ key ], 28 ) }”)` : '' }` );
		}
	}

	for ( const group of byField.values() ) {
		add(
			group.cls,
			group.field,
			`${ group.type } card row: ${ group.key }`,
			'MISSING_ON_DEV' === group.cls ? 'shown' : 'not shown',
			'MISSING_ON_DEV' === group.cls ? 'not shown' : 'shown',
			`${ group.cards.length } card(s): ${ group.cards.slice( 0, 4 ).join(', ') }${ 4 < group.cards.length ? ', …' : '' }`
		);
	}

	// Body text.
	let similarity = 1;

	if ( live.paragraphs.length ) {
		const devText = ` ${ dev.text } `;
		const devParas = dev.paragraphs.map( norm );
		const missing = [];
		const changed = [];

		for ( const paragraph of live.paragraphs ) {
			const key = norm( paragraph );

			if ( devText.includes( ` ${ key } ` ) || devText.includes( ` ${ key.slice( 0, 80 ) }` ) ) {
				continue;
			}

			const best = devParas.reduce( ( max, p ) => Math.max( max, dice( key, p ) ), 0 );

			if ( 0.8 <= best ) {
				continue;
			}

			( 0.4 <= best ? changed : missing ).push( paragraph );
		}

		similarity = dice(
			norm( live.paragraphs.join( ' ' ) ),
			norm( dev.paragraphs.join( ' ' ) )
		);

		const lostShare = ( missing.length + changed.length ) / live.paragraphs.length;

		if (
			2 <= live.paragraphs.length &&
			0.6 <= missing.length / live.paragraphs.length &&
			dev.bodyLength < live.bodyLength * 0.4
		) {
			add( 'MISSING_ON_DEV', 'body', 'Body text', `${ live.paragraphs.length } paragraphs, ${ live.bodyLength } chars`, `${ dev.paragraphs.length } paragraphs, ${ dev.bodyLength } chars`, `missing: “${ short( missing[ 0 ] ) }”` );
		} else {
			if ( changed.length ) {
				add( 'CONTENT_DRIFT', 'body', 'Body text edited', `${ changed.length } paragraph(s)`, '', `e.g. live: “${ short( changed[ 0 ] ) }”` );
			}

			if ( missing.length ) {
				add( 'CONTENT_DRIFT', 'body', 'Body paragraphs not on dev', `${ missing.length } of ${ live.paragraphs.length }`, '', `e.g. “${ short( missing[ 0 ] ) }”` );
			}
		}

		void lostShare;
	}

	return { diffs, similarity };
}

/**
 * @param {Object[]} diffs Diffs.
 * @return {Object<string, number>} Count per class.
 */
function tally( diffs ) {
	const counts = Object.fromEntries( CLASSES.map( ( c ) => [ c, 0 ] ) );

	for ( const diff of diffs ) {
		counts[ diff.cls ]++;
	}

	return counts;
}

module.exports = { compare, tally, dice, norm, CLASSES };
