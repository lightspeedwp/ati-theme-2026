/**
 * Header template part: top bar, main header, logo, search, contact details.
 *
 * ATI's header is two patterns: `top-header` (a `div.ati-top-header` bar with
 * phone, email and currency) and `main-header` (the page's single `<header>`
 * banner landmark, with logo, navigation and search).
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

/**
 * The whole header area: the top bar plus the banner landmark.
 */
const HEADER = ':is(header, .ati-top-header)';

test.describe( 'Header', () => {
	test.beforeEach( async ( { visit, page } ) => {
		await visit( '/' );
		await acceptCookies( page );
	} );

	test( 'renders the top bar and main header @responsive @smoke', async ( { page } ) => {
		await expect( page.locator( '.wp-site-blocks .ati-top-header' ), 'the top-header bar is missing' ).toBeVisible();
		await expect( page.locator( '.wp-site-blocks header' ), 'expected exactly one <header> (main-header)' ).toHaveCount( 1 );
		await expect( page.locator( '.wp-site-blocks header' ) ).toBeVisible();
	} );

	test( 'the logo is shown and links home @responsive', async ( { page } ) => {
		const logo = page.locator( `${ HEADER } .wp-block-site-logo` ).first();

		await expect( logo ).toBeVisible();
		await expect( logo.locator( 'a' ) ).toHaveAttribute( 'href', /^(https?:\/\/[^/]+)?\/$/ );
		await expect( logo.locator( 'img' ) ).toHaveAttribute( 'src', /\S/ );

		const loaded = await logo
			.locator( 'img' )
			.evaluate( ( img ) => img.complete && 0 < img.naturalWidth );

		expect( loaded, 'the logo image did not load' ).toBe( true );
	} );

	test( 'the top bar carries working phone and email links', async ( { page } ) => {
		const tel = page.locator( `${ HEADER } a[href^="tel:"]` );
		const mail = page.locator( `${ HEADER } a[href^="mailto:"]` );

		expect( await tel.count() + await mail.count(), 'no phone or email link in the header' ).toBeGreaterThan( 0 );

		for ( const link of await tel.all() ) {
			await expect( link ).toHaveAttribute( 'href', /^tel:\+?[\d\s()-]{6,}$/ );
		}
	} );

	test( 'the currency switcher lists the currencies', async ( { page } ) => {
		const switcher = page.locator( `${ HEADER } nav.is-style-currency-switcher` ).first();

		test.skip( 0 === ( await switcher.count() ), 'no currency switcher in the header' );

		const items = await switcher.locator( 'a' ).allTextContents();

		expect( items.map( ( t ) => t.trim() ).filter( Boolean ).length ).toBeGreaterThanOrEqual( 2 );
	} );

	test( 'header links have destinations', async ( { page } ) => {
		const bad = await page.locator( `${ HEADER } a[href]` ).evaluateAll( ( links ) =>
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

		const search = page.locator( 'header .wp-block-search.is-style-header-search' ).first();
		await expect( search ).toBeVisible();

		const input = search.locator( 'input[type="search"]' );
		await search.locator( 'button[type="submit"], .wp-block-search__button' ).first().click();
		await expect( input ).toBeVisible();

		await input.fill( 'safari' );
		await Promise.all( [ page.waitForURL( /[?&]s=safari/ ), input.press( 'Enter' ) ] );

		await expect( page.locator( 'main' ) ).toBeVisible();
	} );
} );
