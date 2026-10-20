/**
 * Search results, empty search, and the 404 template.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { devHeaders } = require( '../utils/helpers.js' );
const { SYNTHETIC_ROUTES } = require( '../fixtures/routes.js' );
const { assertPageContract, results, mainContent } = require( '../utils/page-contract.js' );

test.describe( 'Search and 404', () => {
	for ( const route of SYNTHETIC_ROUTES ) {
		test( `${ route.name } (${ route.template }) renders @responsive`, async ( { page, visit } ) => {
			await visit( route.path, { expectStatus: route.expectStatus || 200 } );
			await assertPageContract( page, { expectH1: true } );
		} );
	}

	test( 'a search for a real term returns results inside main', async ( { page, visit } ) => {
		await visit( '/?s=safari' );
		await expect( results( page ), 'search for "safari" returned no results' ).not.toHaveCount( 0 );
	} );

	test( 'a search with no matches says so, and lists nothing', async ( { page, visit } ) => {
		await visit( '/?s=zzzznotarealquery' );
		await expect( results( page ) ).toHaveCount( 0 );
		await expect( mainContent( page ) ).toContainText( /no results|nothing|not found|try (a )?different|no posts/i );
	} );

	test( 'the 404 page offers a way back (home link or search)', async ( { page, visit } ) => {
		await visit( '/this-page-does-not-exist-ati-e2e/', { expectStatus: 404 } );

		const way = mainContent( page ).locator( 'a[href="/"], a[href$="/"], form[role="search"], .wp-block-search' );

		expect( await way.count(), 'the 404 template offers no link home and no search' ).toBeGreaterThan( 0 );
	} );

	test( 'unknown CPT slugs 404 rather than 500', async ( { request } ) => {
		const response = await request.get( '/tour/this-tour-does-not-exist-ati-e2e/', {
			headers: devHeaders(),
		} );

		expect( response.status() ).toBe( 404 );
	} );
} );
