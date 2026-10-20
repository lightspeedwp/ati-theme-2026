/**
 * Card rows: a card shows a meta row whenever the post has the data for it.
 *
 * This is the rendered half of the wrapper/binding rule (the static half is
 * tests/unit/theme/to-wrappers.test.js). Tour Operator removes a
 * `lsx-<key>-wrapper` row when the key it derives from the class is empty, so a
 * wrapper class that does not match the field inside it hides the row on every
 * post where the class's own field happens to be empty. Known instance:
 * `patterns/ati-accommodation-card.php`, whose "Travel Style Row" is wrapped in
 * `lsx-duration-wrapper` (accommodations have no duration).
 *
 * For every card on a sample of pages, the expected rows come from public REST
 * (meta + terms) and must all be present. Dev only; nothing is written.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { extractPage } = require( '../utils/extract.js' );
const { postData, filled } = require( '../utils/rest.js' );

/**
 * Rows a card must show when the data exists: [label, test(data)].
 */
const EXPECTED = {
	accommodation: [
		[ 'styles', ( d ) => d.terms.styles.length ],
		[ 'type', ( d ) => d.terms.type.length ],
		[ 'rooms', ( d ) => filled( d.meta.number_of_rooms ) ],
		[ 'price', ( d ) => filled( d.meta.price ) && 'none' !== d.meta.price_type ],
	],
	tour: [
		[ 'duration', ( d ) => filled( d.meta.duration ) ],
		[ 'price', ( d ) => filled( d.meta.price ) ],
		[ 'styles', ( d ) => d.terms.styles.length ],
	],
};

/**
 * Pages whose cards are worth scanning, as [route key, label].
 */
const SOURCES = [
	[ 'review', 'single review' ],
	[ 'tour', 'single tour' ],
	[ 'accommodation', 'single accommodation' ],
	[ 'region', 'single region' ],
	[ 'country', 'single country' ],
];

test.describe( 'Card meta rows are shown when the data exists', () => {
	for ( const [ key, label ] of SOURCES ) {
		test( `${ label }: every accommodation and tour card shows its populated rows`, async ( { page, request, visit, routes } ) => {
			const paths = routes.sample( key ).slice( 0, 2 );

			test.skip( ! paths.length, `no published ${ key }` );

			const failures = [];
			let inspected = 0;

			for ( const path of paths ) {
				await visit( path );

				const { cards } = await page.evaluate( extractPage, { html: null, side: 'dev' } );
				const seen = new Set();

				for ( const card of cards.filter( ( c ) => EXPECTED[ c.type ] ) ) {
					const id = `${ card.type }:${ card.id }`;

					if ( seen.has( id ) ) {
						continue;
					}

					seen.add( id );

					const data = await postData( request, card.type, card.id );

					if ( ! data ) {
						continue;
					}

					inspected++;

					const missing = EXPECTED[ card.type ]
						.filter( ( [ field, has ] ) => has( data ) && ! ( field in card.fields ) )
						.map( ( [ field ] ) => field );

					if ( missing.length ) {
						failures.push( `${ path } → ${ card.type } "${ card.slug || card.title }" (#${ card.id }) is missing: ${ missing.join( ', ' ) }` );
					}
				}
			}

			test.skip( 0 === inspected, 'no accommodation or tour cards on the sampled pages' );

			expect(
				failures,
				'Cards missing a row their post has data for — a lsx-*-wrapper class that does not match the field inside it ' +
					'(Tour Operator hides the row), or a binding that is not resolving:\n  ' +
					failures.join( '\n  ' )
			).toEqual( [] );
		} );
	}
} );
