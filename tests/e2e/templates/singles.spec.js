/**
 * Single templates: one spread sample per post type (`ATI_SAMPLE`, default 5),
 * resolved from the REST API.
 *
 * Every sample must satisfy the page contract; each type then has its own
 * structural expectations. Tour Operator hides rows whose data is empty, so
 * type checks are phrased as "if the data exists, it is shown" where the data
 * is available through REST, and as presence checks otherwise.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { RESOLVED_ROUTES } = require( '../fixtures/routes.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );
const { assertPageContract, brokenImages, scrollThrough, mainContent } = require( '../utils/page-contract.js' );

const ROUTES = readResolvedRoutes();

test.describe( 'Single templates', () => {
	for ( const route of RESOLVED_ROUTES ) {
		const paths = ROUTES.samples[ route.key ] || [];

		if ( ! paths.length ) {
			test( `${ route.name } (${ route.template }) renders`, () => {
				test.skip( true, `no published ${ route.key } on this environment` );
			} );
			continue;
		}

		paths.forEach( ( path, index ) => {
			test( `${ route.name } #${ index + 1 } ${ path } (${ route.template }) renders${ 0 === index && route.smoke ? ' @smoke' : '' }${ 0 === index ? ' @responsive' : '' }`, async ( { page, visit } ) => {
				await visit( path );
				await assertPageContract( page );
			} );
		} );

		test( `${ route.name } (${ route.template }) has no broken images`, async ( { page, visit } ) => {
			await visit( paths[ 0 ] );
			await scrollThrough( page );
			expect( await brokenImages( page ), 'images that failed to load' ).toEqual( [] );
		} );
	}

	test( 'tour: shows price, duration and an itinerary', async ( { page, visit, routes } ) => {
		const target = routes.post( 'tour' );
		test.skip( ! target, 'no published tour' );

		await visit( target );

		const main = mainContent( page );

		await expect( main ).toContainText( /Duration:\s*\d+/i );
		await expect( main ).toContainText( /From price:|Price from:/i );
		await expect( main.locator( 'text=/^Day\\s+\\d+/' ).first(), 'no itinerary days rendered' ).toBeAttached();
	} );

	test( 'tour: the sticky section menu links to anchors that exist', async ( { page, visit, routes } ) => {
		const target = routes.post( 'tour' );
		test.skip( ! target, 'no published tour' );

		await visit( target );

		const missing = await page.locator( 'nav.lsx-to-sticky-menu-nav a[href^="#"]' ).evaluateAll( ( links ) =>
			links
				.map( ( a ) => a.getAttribute( 'href' ).slice( 1 ) )
				.filter( ( id ) => id && ! document.getElementById( id ) )
		);

		expect( missing, `section-menu anchors with no target: ${ missing.join( ', ' ) }` ).toEqual( [] );
	} );

	test( 'tour: offers an enquiry route', async ( { page, visit, routes } ) => {
		const target = routes.post( 'tour' );
		test.skip( ! target, 'no published tour' );

		await visit( target );

		const enquire = mainContent( page ).locator( 'a[href="#to-modal-modal-enquiry"], .gform_wrapper, a[href*="enquiry"]' );

		expect( await enquire.count(), `${ target } offers no way to enquire` ).toBeGreaterThan( 0 );
	} );

	test( 'country: lists its regions', async ( { page, visit, routes } ) => {
		const target = routes.post( 'country' );
		test.skip( ! target, 'no published country' );

		await visit( target );
		await expect( mainContent( page ).locator( '.lsx-regions-query-wrapper, .facts-regions-query-wrapper, [class*="regions"]' ).first() ).toBeAttached();
	} );

	test( 'review: shows the reviewer, the review body and connected items', async ( { page, visit, routes } ) => {
		const target = routes.post( 'review' );
		test.skip( ! target, 'no published review' );

		await visit( target );

		const text = ( await mainContent( page ).innerText() ).replace( /\s+/g, ' ' );

		expect( text.length, 'the review body is empty' ).toBeGreaterThan( 200 );
	} );

	test( 'review: the travel dates are not the Unix epoch', async ( { page, visit, routes } ) => {
		const target = routes.post( 'review' );
		test.skip( ! target, 'no published review' );

		await visit( target );

		await expect(
			mainContent( page ),
			'a date binding resolved to 1 January 1970 (empty timestamp formatted as a date)'
		).not.toContainText( /January 1, 1970|1970-01-01|01 Jan 1970/ );
	} );

	for ( const key of [ 'country', 'region', 'tour', 'accommodation' ] ) {
		test( `${ key }: the fast facts show a travel expert above Enquire`, async ( { page, visit } ) => {
			const path = ( ROUTES.samples[ key ] || [] )[ 0 ];
			test.skip( ! path, `no published ${ key }` );

			await visit( path );

			// The connected team member, or the "ATI Holidays" fallback when none is
			// connected (as on live); never the Enquire button on its own.
			const card = page.locator( '.wp-block-ati-team-contact-card' ).first();

			await expect( card, 'no travel expert card in the fast facts' ).toBeVisible();
			await expect( card.locator( '.lsx-to-contact-prefix' ) ).toHaveText( /your travel expert/i );
			await expect( card.locator( '.lsx-to-contact-name' ) ).not.toBeEmpty();
			await expect( card.locator( '.lsx-to-contact-thumb img' ), 'the travel expert card has no image' ).toBeVisible();
		} );
	}

	test( 'team member: shows contact details', async ( { page, visit, routes } ) => {
		const target = routes.post( 'team' );
		test.skip( ! target, 'no published team member' );

		await visit( target );

		// The name is the hero's h1, which sits above <main> like every single template's.
		await expect( page.locator( 'h1' ) ).toBeVisible();
		expect(
			await mainContent( page ).locator( 'a[href^="tel:"], a[href^="mailto:"]' ).count(),
			'a team member page with no phone or email'
		).toBeGreaterThan( 0 );
	} );
} );
