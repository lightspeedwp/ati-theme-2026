/**
 * Console errors, broken images and broken internal links on the key pages:
 * the front page plus one page of every template type.
 *
 * Links are checked with plain GETs through the request API (no navigation, no
 * writes); a capped, de-duplicated sample per page keeps the load on dev
 * reasonable.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { devHeaders } = require( '../utils/helpers.js' );
const { brokenImages, scrollThrough } = require( '../utils/page-contract.js' );

const LINK_LIMIT = parseInt( process.env.ATI_LINK_LIMIT || '40', 10 );

const KEY_PAGES = [
	[ 'front page', () => '/' ],
	[ 'tour archive', () => '/tours/' ],
	[ 'accommodation archive', () => '/accommodation/' ],
	[ 'destination archive', () => '/destinations/' ],
	[ 'single tour', ( r ) => r.post( 'tour' ) ],
	[ 'single accommodation', ( r ) => r.post( 'accommodation' ) ],
	[ 'single country', ( r ) => r.post( 'country' ) ],
	[ 'single region', ( r ) => r.post( 'region' ) ],
	[ 'single review', ( r ) => r.post( 'review' ) ],
	[ 'single special', ( r ) => r.post( 'special' ) ],
	[ 'single team member', ( r ) => r.post( 'team' ) ],
	[ 'single post', ( r ) => r.post( 'post' ) ],
	[ 'travel style archive', ( r ) => r.term( 'travel-style' ) ],
	[ 'search results', () => '/?s=safari' ],
];

test.describe( 'Console errors, images and links on key pages', () => {
	for ( const [ name, resolve ] of KEY_PAGES ) {
		test( `${ name }: no console errors or uncaught exceptions`, async ( { visit, consoleGuard, routes } ) => {
			const path = resolve( routes );

			test.skip( ! path, `no published ${ name }` );

			await visit( path );
			await consoleGuard.assertClean( path );
		} );

		test( `${ name }: images load`, async ( { page, visit, routes } ) => {
			const path = resolve( routes );

			test.skip( ! path, `no published ${ name }` );

			await visit( path );
			await scrollThrough( page );
			expect( await brokenImages( page ), 'images that failed to load' ).toEqual( [] );
		} );

		test( `${ name }: internal links in the page body resolve`, async ( { page, request, visit, routes } ) => {
			const path = resolve( routes );

			test.skip( ! path, `no published ${ name }` );

			await visit( path );

			const links = await page.locator( 'main a[href]' ).evaluateAll( ( nodes, origin ) =>
				[ ...new Set(
					nodes
						.map( ( a ) => a.href )
						.filter( ( href ) => href.startsWith( origin ) )
						.map( ( href ) => href.split( '#' )[ 0 ] )
						.filter( ( href ) => href && ! /\.(jpe?g|png|gif|webp|svg|pdf)$/i.test( href ) )
				) ],
				new URL( page.url() ).origin
			);

			const broken = [];

			for ( const href of links.slice( 0, LINK_LIMIT ) ) {
				const response = await request.get( href, {
					maxRedirects: 5,
					headers: devHeaders(),
				} );

				if ( 400 <= response.status() ) {
					broken.push( `${ href } → ${ response.status() }` );
				}
			}

			expect( broken, `broken internal links on ${ path }:\n  ${ broken.join( '\n  ' ) }` ).toEqual( [] );
		} );
	}
} );
