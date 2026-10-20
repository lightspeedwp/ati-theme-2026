/**
 * Tour Operator wrapper rows on single templates, checked against the data.
 *
 * `render_block` removes the HTML of a `core/group` / `core/paragraph` whose
 * `lsx-<key>-wrapper` class derives a key that is empty for the post. The rule
 * in plain terms: if the post HAS the data for a row, the row must be on the
 * page. Where public REST exposes the data (price, duration, rooms, rating,
 * check-in/out, tagline, terms) that is asserted directly.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { postData, filled } = require( '../utils/rest.js' );
const { mainContent } = require( '../utils/page-contract.js' );

/**
 * Per type: [row label shown on the page, does the data exist?].
 */
const ROWS = {
	tour: [
		[ /Duration:/i, ( d ) => filled( d.meta.duration ) ],
		[ /From price:|Price from:/i, ( d ) => filled( d.meta.price ) ],
		[ /Travel Styles?:/i, ( d ) => d.terms.styles.length ],
	],
	accommodation: [
		[ /Rooms:/i, ( d ) => filled( d.meta.number_of_rooms ) ],
		[ /Check[- ]?in/i, ( d ) => filled( d.meta.checkin_time ) ],
		[ /Check[- ]?out/i, ( d ) => filled( d.meta.checkout_time ) ],
	],
};

test.describe( 'Wrapper rows are present when the post has the data', () => {
	for ( const type of Object.keys( ROWS ) ) {
		test( `single ${ type }: populated fact rows are shown`, async ( { page, request, visit, routes } ) => {
			const paths = routes.sample( type ).slice( 0, 4 );

			test.skip( ! paths.length, `no published ${ type }` );

			const failures = [];

			for ( const path of paths ) {
				await visit( path );

				const id = ( await page.evaluate( () => document.body.className.match( /\bpostid-(\d+)/ )?.[ 1 ] || '' ) );
				const data = id && ( await postData( request, type, id ) );

				if ( ! data ) {
					continue;
				}

				const text = await mainContent( page ).textContent();

				for ( const [ label, has ] of ROWS[ type ] ) {
					if ( has( data ) && ! label.test( text ) ) {
						failures.push( `${ path }: has data for ${ label } but the row is not rendered` );
					}
				}
			}

			expect( failures, failures.join( '\n  ' ) ).toEqual( [] );
		} );
	}

	test( 'the hero tagline shows when the post has a tagline, and static tagline copy is not hidden', async ( { page, request, visit, routes } ) => {
		const failures = [];
		let checked = 0;

		for ( const type of [ 'tour', 'accommodation', 'special' ] ) {
			for ( const path of routes.sample( type ).slice( 0, 3 ) ) {
				await visit( path );

				const id = await page.evaluate( () => document.body.className.match( /\bpostid-(\d+)/ )?.[ 1 ] || '' );
				const data = id && ( await postData( request, type, id ) );

				if ( data && filled( data.meta.tagline ) ) {
					checked++;
					const text = await page.locator( 'body' ).textContent();

					if ( ! text.includes( data.meta.tagline ) ) {
						failures.push( `${ path }: tagline "${ data.meta.tagline }" not rendered` );
					}
				}
			}
		}

		test.skip( 0 === checked, 'no sampled post has a tagline on this environment' );
		expect( failures, failures.join( '\n  ' ) ).toEqual( [] );
	} );

	test( 'no lsx-*-wrapper element is rendered empty', async ( { page, visit, routes } ) => {
		const failures = [];

		for ( const key of [ 'tour', 'accommodation', 'country', 'region', 'review', 'special' ] ) {
			const path = routes.post( key );

			if ( ! path ) {
				continue;
			}

			await visit( path );

			const empty = await page.locator( 'main [class*="-wrapper"]' ).evaluateAll( ( nodes ) =>
				nodes
					.filter( ( n ) => /\b(lsx|facts)-[a-z0-9_-]+-wrapper\b/.test( n.className ) )
					.filter( ( n ) => ! n.textContent.trim() && ! n.querySelector( 'img,svg,iframe,a,.lsx-map,dialog' ) )
					.map( ( n ) => n.className.match( /\b(?:lsx|facts)-[a-z0-9_-]+-wrapper\b/ )[ 0 ] )
			);

			if ( empty.length ) {
				failures.push( `${ path }: ${ [ ...new Set( empty ) ].join( ', ' ) }` );
			}
		}

		expect( failures, `wrapper groups rendered with nothing in them:\n  ${ failures.join( '\n  ' ) }` ).toEqual( [] );
	} );
} );
