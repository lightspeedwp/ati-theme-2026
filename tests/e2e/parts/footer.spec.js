/**
 * Footer template part: newsletter, menus, social links, copyright.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { brokenImages, scrollThrough } = require( '../utils/page-contract.js' );

test.describe( 'Footer', () => {
	test.beforeEach( async ( { visit } ) => {
		await visit( '/' );
	} );

	test( 'renders with content @responsive @smoke', async ( { page } ) => {
		const footer = page.locator( '.wp-site-blocks > footer' );

		await expect( footer ).toBeVisible();
		expect( ( await footer.innerText() ).trim().length, 'footer rendered empty' ).toBeGreaterThan( 40 );
		await expect( footer ).toContainText( /ATI Holidays/i );
	} );

	test( 'carries the newsletter sign-up form (rendered, not submitted)', async ( { page } ) => {
		const form = page.locator( 'footer .gform_wrapper form' );

		await expect( form, 'the footer newsletter form (Gravity Forms) did not render' ).toHaveCount( 1 );
		await expect( form.locator( 'input[type="email"], input[type="text"]' ).first() ).toBeVisible();
		await expect( form.locator( 'input[type="submit"], button[type="submit"]' ).first() ).toBeVisible();
	} );

	test( 'footer menus have links that resolve to a destination', async ( { page } ) => {
		const links = page.locator( 'footer a[href]' );

		await expect( links ).not.toHaveCount( 0 );

		const empty = await links.evaluateAll( ( nodes ) =>
			nodes
				.filter( ( a ) => '' === ( a.getAttribute( 'href' ) || '' ).trim() )
				.map( ( a ) => ( a.textContent || '' ).trim() )
		);

		expect( empty, `footer links with an empty href: ${ empty.join( '; ' ) }` ).toEqual( [] );
	} );

	/**
	 * `wp:social-link {"url":"#"}` is a placeholder left in patterns/footer.php.
	 */
	test( 'social links point at real profiles, not "#"', async ( { page } ) => {
		const social = page.locator( 'footer .wp-block-social-links a' );

		test.skip( 0 === ( await social.count() ), 'no social links in the footer' );

		const placeholders = await social.evaluateAll( ( nodes ) =>
			nodes
				.filter( ( a ) => /^#?$/.test( ( a.getAttribute( 'href' ) || '' ).trim() ) )
				.map( ( a ) => ( a.textContent || a.className ).trim().slice( 0, 30 ) )
		);

		expect(
			placeholders,
			`footer social links still set to "#" (patterns/footer.php): ${ placeholders.join( ', ' ) }`
		).toEqual( [] );
	} );

	test( 'footer navigation landmarks are named', async ( { page } ) => {
		const unnamed = await page.locator( 'footer nav' ).evaluateAll( ( navs ) =>
			navs.filter( ( n ) => ! ( n.getAttribute( 'aria-label' ) || n.getAttribute( 'aria-labelledby' ) ) ).length
		);

		expect( unnamed, 'footer <nav> landmarks without an accessible name' ).toBe( 0 );
	} );

	test( 'footer images load', async ( { page } ) => {
		await scrollThrough( page );
		expect( await brokenImages( page ) ).toEqual( [] );
	} );
} );
