/**
 * Mega menus (desktop) and the responsive menu (mobile).
 *
 * The mega menus come from Ollie Menu Designer and the responsive container
 * from core's navigation block; both are driven by the Interactivity API, so
 * the assertions are on the state they expose (`aria-expanded`, visibility,
 * focus) — also what a keyboard or screen-reader user depends on.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { devHeaders } = require( '../utils/helpers.js' );
const { acceptCookies, parkPointer } = require( '../utils/helpers.js' );

const MEGA_TOGGLE = '.wp-block-ollie-mega-menu__toggle';

/**
 * @param {import('@playwright/test').Locator} toggle A mega-menu toggle.
 * @return {import('@playwright/test').Locator} Its `li`, the thing a visitor points at.
 */
function rowOf( toggle ) {
	return toggle.locator(
		'xpath=ancestor::li[contains(concat(" ", @class, " "), " wp-block-ollie-mega-menu ")][1]'
	);
}

test.describe( 'Mega menu (desktop)', () => {
	test.beforeEach( async ( { visit, page, isMobile } ) => {
		test.skip( isMobile || 1100 > ( page.viewportSize()?.width || 1280 ), 'desktop navigation only' );
		await visit( '/' );
		await acceptCookies( page );
		await parkPointer( page );
	} );

	test( 'the header has mega-menu toggles, each pointing at a dropdown that exists', async ( { page } ) => {
		const toggles = page.locator( MEGA_TOGGLE );
		const count = await toggles.count();

		expect( count, 'no mega menu toggles found in the header' ).toBeGreaterThan( 0 );

		for ( let i = 0; i < count; i++ ) {
			const id = await toggles.nth( i ).getAttribute( 'aria-controls' );

			expect( id, `toggle ${ i } has no aria-controls` ).toBeTruthy();
			await expect( page.locator( `[id="${ id }"]` ), `dropdown #${ id } is not in the DOM` ).toBeAttached();
		}
	} );

	test( 'every toggle opens its dropdown on hover and closes when the pointer leaves', async ( { page } ) => {
		const toggles = page.locator( MEGA_TOGGLE );

		for ( let i = 0; i < ( await toggles.count() ); i++ ) {
			const toggle = toggles.nth( i );
			const id = await toggle.getAttribute( 'aria-controls' );
			const label = ( await rowOf( toggle ).locator( '.wp-block-navigation-item__label' ).first().innerText() ).trim();

			await rowOf( toggle ).hover();
			await expect( toggle, `"${ label }" did not report itself expanded on hover` ).toHaveAttribute( 'aria-expanded', 'true' );
			await expect( page.locator( `[id="${ id }"]` ), `"${ label }" dropdown did not become visible` ).toBeVisible();
			expect(
				await page.locator( `[id="${ id }"] a[href]` ).count(),
				`"${ label }" dropdown has no links`
			).toBeGreaterThan( 0 );

			await parkPointer( page );
			await expect( toggle, `"${ label }" stayed open after the pointer left` ).toHaveAttribute( 'aria-expanded', 'false' );
		}
	} );

	test( 'a toggle opens from the keyboard and closes on Escape', async ( { page } ) => {
		const toggle = page.locator( MEGA_TOGGLE ).first();

		await toggle.focus();

		const openedOnFocus = await expect( toggle )
			.toHaveAttribute( 'aria-expanded', 'true', { timeout: 750 } )
			.then( () => true, () => false );

		if ( ! openedOnFocus ) {
			await page.keyboard.press( 'Enter' );
		}

		await expect( toggle, 'did not open from the keyboard (focus, then Enter)' ).toHaveAttribute( 'aria-expanded', 'true' );
		await page.keyboard.press( 'Escape' );
		await expect( toggle, 'stayed open after Escape' ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	test( 'hovering a second menu closes the first', async ( { page } ) => {
		const toggles = page.locator( MEGA_TOGGLE );

		test.skip( 2 > ( await toggles.count() ), 'fewer than two mega menus' );

		await rowOf( toggles.nth( 0 ) ).hover();
		await expect( toggles.nth( 0 ) ).toHaveAttribute( 'aria-expanded', 'true' );
		await rowOf( toggles.nth( 1 ) ).hover();
		await expect( toggles.nth( 0 ), 'two mega menus were open at once' ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	test( 'the mega menus link to pages that exist', async ( { page, request } ) => {
		const hrefs = await page.locator( 'header .wp-block-navigation a[href]' ).evaluateAll( ( links ) =>
			[ ...new Set( links.map( ( a ) => a.href ).filter( ( h ) => h.startsWith( location.origin ) && ! h.includes( '#' ) ) ) ]
		);

		// Around 60 full page renders on dev: allow for them, and fetch four at a
		// time (the suite's politeness cap) rather than one after another.
		test.setTimeout( 3 * 60 * 1000 );

		const broken = [];
		const targets = hrefs.slice( 0, 60 );

		for ( let i = 0; i < targets.length; i += 4 ) {
			await Promise.all(
				targets.slice( i, i + 4 ).map( async ( href ) => {
					const response = await request.get( href, { maxRedirects: 5, headers: devHeaders(), timeout: 45 * 1000 } );

					if ( 400 <= response.status() ) {
						broken.push( `${ href } → ${ response.status() }` );
					}
				} )
			);
		}

		expect( broken, `navigation links that do not resolve:\n  ${ broken.join( '\n  ' ) }` ).toEqual( [] );
	} );
} );

test.describe( 'Mobile menu', () => {
	test.use( { viewport: { width: 375, height: 667 } } );

	test.beforeEach( async ( { visit, page } ) => {
		await visit( '/' );
		await acceptCookies( page );
	} );

	test( 'the open button is visible and the menu is closed @responsive', async ( { page } ) => {
		await expect( page.locator( '.wp-block-navigation__responsive-container-open' ).first() ).toBeVisible();
		await expect( page.locator( '.wp-block-navigation__responsive-container.is-menu-open' ) ).toHaveCount( 0 );
	} );

	test( 'opens as a dialog with navigation links, and closes @responsive', async ( { page } ) => {
		const open = page.locator( '.wp-block-navigation__responsive-container-open' ).first();

		await open.click();

		const container = page.locator( '.wp-block-navigation__responsive-container.is-menu-open' ).first();

		await expect( container, 'the mobile menu did not open' ).toBeVisible();
		expect(
			await container.locator( 'a[href]' ).count(),
			'the open mobile menu has no links'
		).toBeGreaterThan( 3 );

		await container.locator( '.wp-block-navigation__responsive-container-close' ).first().click();
		await expect( container, 'the mobile menu did not close' ).toBeHidden();
	} );

	test( 'Escape closes the open menu', async ( { page } ) => {
		await page.locator( '.wp-block-navigation__responsive-container-open' ).first().click();

		const container = page.locator( '.wp-block-navigation__responsive-container.is-menu-open' ).first();
		await expect( container ).toBeVisible();

		await page.keyboard.press( 'Escape' );
		await expect( container, 'Escape did not close the mobile menu' ).toBeHidden();
	} );

	test( 'the desktop mega menu toggles are not shown on a phone', async ( { page } ) => {
		for ( const toggle of await page.locator( MEGA_TOGGLE ).all() ) {
			await expect( toggle ).toBeHidden();
		}
	} );
} );
