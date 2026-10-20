/**
 * Every route that exists by construction renders its template.
 *
 * The suite's floor: if one of these goes red, something is broken for every
 * visitor, not for an edge case.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { devHeaders } = require( '../utils/helpers.js' );
const { STATIC_ROUTES, REDIRECTING_ARCHIVES } = require( '../fixtures/routes.js' );
const { assertPageContract, results } = require( '../utils/page-contract.js' );

test.describe( 'Static routes', () => {
	for ( const route of STATIC_ROUTES ) {
		test( `${ route.name } (${ route.template }) renders @responsive${ route.smoke ? ' @smoke' : '' }`, async ( { page, visit } ) => {
			await visit( route.path );
			await assertPageContract( page, { expectH1: ! /no-title/.test( route.template ) } );
		} );
	}

	/**
	 * The archives are the templates most likely to be silently empty: the
	 * query block is easy to mis-scope to the wrong post type and the page still
	 * returns 200 while showing nothing.
	 */
	for ( const archive of STATIC_ROUTES.filter( ( r ) => r.results ) ) {
		test( `${ archive.name } lists results`, async ( { page, visit } ) => {
			await visit( archive.path );

			await expect(
				results( page ),
				`${ archive.path } rendered no results inside <main> — check the query block's post type`
			).not.toHaveCount( 0 );
		} );
	}

	/**
	 * `/tour/` and `/destination/` (the CPT archive bases) redirect site-wide,
	 * by design. A 301 is expected; anything else is a change worth knowing.
	 */
	for ( const archive of REDIRECTING_ARCHIVES ) {
		test( `${ archive } redirects (by design)`, async ( { request } ) => {
			const response = await request.get( archive, {
				maxRedirects: 0,
				headers: devHeaders(),
			} );

			expect( [ 301, 302 ], `${ archive } answered ${ response.status() }` ).toContain( response.status() );
			expect( response.headers().location, 'redirect has no Location' ).toBeTruthy();
		} );
	}

	test( 'front page has no placeholder links in the page body', async ( { page, visit } ) => {
		await visit( '/' );

		const bad = await page.locator( 'main a[href]' ).evaluateAll( ( nodes ) =>
			nodes
				.filter( ( a ) => '' === ( a.getAttribute( 'href' ) || '' ).trim() || '#' === ( a.getAttribute( 'href' ) || '' ).trim() )
				.filter( ( a ) => ! a.hasAttribute( 'aria-controls' ) && ! a.hasAttribute( 'data-toggle' ) && ! a.hasAttribute( 'role' ) )
				.map( ( a ) => ( a.textContent || '' ).trim().slice( 0, 40 ) )
		);

		expect( bad, `placeholder links on the front page: ${ bad.join( '; ' ) }` ).toEqual( [] );
	} );
} );
