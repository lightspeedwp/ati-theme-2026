/**
 * Keyboard paths: focus order, visible focus, skip link.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

test.describe( 'Keyboard @a11y', () => {
	test.beforeEach( async ( { visit, page } ) => {
		await visit( '/' );
		await acceptCookies( page );
	} );

	test( 'the first Tab stop is a skip link or a header link', async ( { page } ) => {
		await page.keyboard.press( 'Tab' );

		const first = await page.evaluate( () => {
			const el = document.activeElement;

			return { tag: el.tagName, href: el.getAttribute( 'href' ) || '', text: ( el.textContent || '' ).trim().slice( 0, 40 ), inHeader: !! el.closest( 'header, .ati-top-header' ), skip: /skip/i.test( el.textContent || '' ) };
		} );

		expect( first.skip || first.inHeader, `first Tab landed on <${ first.tag }> "${ first.text }" outside the header` ).toBe( true );
	} );

	test( 'there is a skip-to-content link', async ( { page } ) => {
		const skip = page.locator( 'a.skip-link, a[href="#main"], a[href="#content"], a:has-text("Skip to")' );

		expect( await skip.count(), 'no skip-to-content link (WCAG 2.4.1 Bypass Blocks)' ).toBeGreaterThan( 0 );
	} );

	test( 'focused links show a visible indicator', async ( { page } ) => {
		const invisible = [];

		for ( let i = 0; i < 8; i++ ) {
			await page.keyboard.press( 'Tab' );

			const state = await page.evaluate( () => {
				const el = document.activeElement;
				const style = getComputedStyle( el );
				const hasOutline = 'none' !== style.outlineStyle && 0 < parseFloat( style.outlineWidth );
				const hasShadow = 'none' !== style.boxShadow;

				return { label: ( el.getAttribute( 'aria-label' ) || el.textContent || el.tagName ).trim().slice( 0, 30 ), visible: hasOutline || hasShadow || 'underline' === style.textDecorationLine };
			} );

			if ( ! state.visible ) {
				invisible.push( state.label );
			}
		}

		expect( invisible, `focused elements with no visible focus style: ${ invisible.join( ', ' ) }` ).toEqual( [] );
	} );
} );
