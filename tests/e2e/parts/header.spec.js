/**
 * Header template part: top bar, main header, logo, search, contact details.
 *
 * ATI's header is two patterns (`top-header`, `main-header`), each rendering a
 * `<header>`, inside a plain `div.wp-block-template-part`.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

test.describe( 'Header', () => {
	test.beforeEach( async ( { visit, page } ) => {
		await visit( '/' );
		await acceptCookies( page );
	} );

	test( 'renders the top bar and main header @responsive @smoke', async ( { page } ) => {
		const headers = page.locator( '.wp-site-blocks header' );

		expect( await headers.count(), 'expected the top-header and main-header patterns' ).toBeGreaterThanOrEqual( 2 );

		for ( const header of await headers.all() ) {
			await expect( header ).toBeVisible();
		}
	} );

	test( 'the logo is shown and links home @responsive', async ( { page } ) => {
		const logo = page.locator( 'header .wp-block-site-logo' ).first();

		await expect( logo ).toBeVisible();
		await expect( logo.locator( 'a' ) ).toHaveAttribute( 'href', /^(https?:\/\/[^/]+)?\/$/ );
		await expect( logo.locator( 'img' ) ).toHaveAttribute( 'src', /\S/ );

		const loaded = await logo
			.locator( 'img' )
			.evaluate( ( img ) => img.complete && 0 < img.naturalWidth );

		expect( loaded, 'the logo image did not load' ).toBe( true );
	} );

	test( 'the top bar carries working phone and email links', async ( { page } ) => {
		const tel = page.locator( 'header a[href^="tel:"]' );
		const mail = page.locator( 'header a[href^="mailto:"]' );

		expect( await tel.count() + await mail.count(), 'no phone or email link in the header' ).toBeGreaterThan( 0 );

		for ( const link of await tel.all() ) {
			await expect( link ).toHaveAttribute( 'href', /^tel:\+?[\d\s()-]{6,}$/ );
		}
	} );

	test( 'the currency switcher lists the currencies', async ( { page } ) => {
		const switcher = page.locator( 'header nav.is-style-currency-switcher' ).first();

		test.skip( 0 === ( await switcher.count() ), 'no currency switcher in the header' );

		const items = await switcher.locator( 'a' ).allTextContents();

		expect( items.map( ( t ) => t.trim() ).filter( Boolean ).length ).toBeGreaterThanOrEqual( 2 );
	} );

	test( 'header links have destinations', async ( { page } ) => {
		const bad = await page.locator( 'header a[href]' ).evaluateAll( ( links ) =>
			links
				.filter( ( a ) => {
					const href = ( a.getAttribute( 'href' ) || '' ).trim();

					return ( '' === href || '#' === href ) && ! a.hasAttribute( 'aria-controls' ) && ! a.closest( '[hidden]' );
				} )
				.map( ( a ) => ( a.textContent || a.getAttribute( 'aria-label' ) || '' ).trim().slice( 0, 40 ) )
		);

		expect( bad, `header links with no destination: ${ bad.join( '; ' ) }` ).toEqual( [] );
	} );

	test( 'search: the toggle reveals an input and Enter performs a GET search @responsive', async ( { page, isMobile } ) => {
		test.skip( isMobile, 'the header search is hidden on small screens by design (blockVisibility)' );

		const search = page.locator( 'header .wp-block-search' ).first();
		await expect( search ).toBeVisible();

		const input = search.locator( 'input[type="search"]' );
		await search.locator( 'button[type="submit"], .wp-block-search__button' ).first().click();
		await expect( input ).toBeVisible();

		await input.fill( 'safari' );
		await Promise.all( [ page.waitForURL( /[?&]s=safari/ ), input.press( 'Enter' ) ] );

		await expect( page.locator( 'main' ) ).toBeVisible();
	} );
} );
