/**
 * Tour Operator content and enquiry modals.
 *
 * These are `dialog.wp-block-hm-popup` elements with ids `to-modal-*`, opened
 * by `a[href="#to-modal-…"]` triggers (destination names, Enquire). Opening a
 * modal is client-side only; the enquiry modal's form is never submitted.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

const TRIGGER = 'main a[href^="#to-modal-"], main a[aria-controls^="to-modal-"]';

test.describe( 'Modals', () => {
	test.beforeEach( async ( { visit, routes, page } ) => {
		const target = routes.post( 'tour' );

		test.skip( ! target, 'No published tour' );
		await visit( target );
		await acceptCookies( page );
	} );

	test( 'every modal trigger points at a dialog that exists', async ( { page } ) => {
		const missing = await page.locator( TRIGGER ).evaluateAll( ( links ) =>
			[ ...new Set( links.map( ( a ) => ( a.getAttribute( 'href' ) || '' ).replace( /^#/, '' ) ) ) ]
				.filter( ( id ) => id && ! document.getElementById( id ) )
		);

		expect( missing, `triggers whose dialog is missing: ${ missing.join( ', ' ) }` ).toEqual( [] );
	} );

	test( 'every dialog has an accessible name', async ( { page } ) => {
		const unnamed = await page.locator( 'dialog' ).evaluateAll( ( dialogs ) =>
			dialogs
				.filter( ( d ) => {
					const by = ( d.getAttribute( 'aria-labelledby' ) || '' ).split( /\s+/ ).filter( Boolean );

					return ! d.getAttribute( 'aria-label' ) && ! by.some( ( id ) => document.getElementById( id )?.textContent.trim() );
				} )
				.map( ( d ) => d.id || d.className )
		);

		expect( unnamed, `dialogs with no accessible name: ${ unnamed.join( ', ' ) }` ).toEqual( [] );
	} );

	test( 'the Enquire modal opens, contains a form, and closes on Escape', async ( { page } ) => {
		const trigger = page.locator( 'main a[href="#to-modal-modal-enquiry"]' ).first();

		test.skip( 0 === ( await trigger.count() ), 'no Enquire trigger on this tour' );

		await trigger.scrollIntoViewIfNeeded();
		await trigger.click();

		const dialog = page.locator( '#to-modal-modal-enquiry' );

		await expect( dialog, 'the enquiry modal did not open' ).toBeVisible();
		await expect( dialog.locator( '.gform_wrapper, form' ).first(), 'the enquiry modal holds no form' ).toBeVisible();

		await page.keyboard.press( 'Escape' );
		await expect( dialog, 'the enquiry modal stayed open after Escape' ).toBeHidden();
	} );

	test( 'a content modal (destination) opens with the destination name', async ( { page } ) => {
		const trigger = page.locator( 'main a[href^="#to-modal-"]:not([href="#to-modal-modal-enquiry"])' ).first();

		test.skip( 0 === ( await trigger.count() ), 'no content-modal trigger on this tour' );

		const id = ( await trigger.getAttribute( 'href' ) ).slice( 1 );

		await trigger.scrollIntoViewIfNeeded();
		await trigger.click();
		await expect( page.locator( `[id="${ id }"]` ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( page.locator( `[id="${ id }"]` ) ).toBeHidden();
	} );
} );
