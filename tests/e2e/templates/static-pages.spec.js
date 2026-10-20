/**
 * Every published static page, enumerated from `/wp-json/wp/v2/pages` at the
 * start of the run, smoke-tested individually: 200, no PHP warnings or fatal
 * text, header / footer / main landmarks, no broken images, no console errors,
 * no horizontal overflow on a phone.
 *
 * Pages on custom templates (`page-impact`, `page-our-story`, `page-no-title`)
 * and the legacy PHP template (`/sitemap/`) are covered here too; their
 * dedicated assertions live in static-routes.spec.js.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );
const {
	assertPageContract,
	brokenImages,
	scrollThrough,
	documentWidths,
	overflowCulprits,
	placeholderLinks,
} = require( '../utils/page-contract.js' );

const PAGES = readResolvedRoutes().pages;

test.describe( 'Static pages', () => {
	test( 'the REST sweep found the published pages', () => {
		expect( PAGES.length, 'no published pages enumerated' ).toBeGreaterThan( 0 );
	} );

	for ( const entry of PAGES ) {
		const label = `${ entry.title } (${ entry.path })${ entry.template ? ` [${ entry.template }]` : '' }`;

		test( `${ label } renders cleanly @responsive`, async ( { page, visit, consoleGuard } ) => {
			await visit( entry.path );
			await assertPageContract( page, { expectH1: false } );

			const h1s = await page.locator( 'h1:visible' ).count();

			expect( h1s, 'more than one visible h1' ).toBeLessThanOrEqual( 1 );

			if ( ! /no-title/.test( entry.template ) && '/' !== entry.path ) {
				expect( h1s, 'a titled page should have a visible h1' ).toBe( 1 );
			}

			expect(
				await placeholderLinks( page, 'main' ),
				'links with an empty or "#" href inside <main>'
			).toEqual( [] );

			consoleGuard.assertClean( entry.path );
		} );

		test( `${ label } has no broken images`, async ( { page, visit } ) => {
			await visit( entry.path );
			await scrollThrough( page );

			expect( await brokenImages( page ), 'images that failed to load' ).toEqual( [] );
		} );

		test( `${ label } does not scroll horizontally on a phone`, async ( { page, visit } ) => {
			await page.setViewportSize( { width: 375, height: 667 } );
			await visit( entry.path );

			const { scrollWidth, clientWidth } = await documentWidths( page );

			expect(
				scrollWidth,
				`${ entry.path } is ${ scrollWidth }px wide in a ${ clientWidth }px viewport. ${ ( await overflowCulprits( page ) ).join( ' | ' ) }`
			).toBeLessThanOrEqual( clientWidth + 1 );
		} );
	}
} );
