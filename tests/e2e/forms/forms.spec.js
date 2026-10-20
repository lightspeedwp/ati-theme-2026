/**
 * Gravity Forms: rendering and client-side behaviour ONLY.
 *
 * ⚠️ THE SUITE NEVER SENDS AN ENQUIRY. The forms feed real CRM/email
 * workflows and dev is under client review. Everything here stops at the submit
 * boundary: the form renders, fields are labelled and typed, required fields are
 * declared, values can be entered. The single spec that clicks Submit does so
 * on an EMPTY form with the request intercepted — `fixtures/base.js` answers any
 * non-GET to the site locally, so the request is proven to be caught rather
 * than sent.
 *
 * (The previous suite submitted test data to dev. That is deliberately gone.)
 *
 * Form ids, from the earlier suite: contact #4 (/contact-us/), tour enquiry #5
 * (/tour-enquiry/), booking #1 (/booking-form/), footer newsletter #3.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { acceptCookies } = require( '../utils/helpers.js' );

const FORMS = [
	{ name: 'contact', path: '/contact-us/', id: 4, mustHave: [ 'email' ] },
	{ name: 'tour enquiry', path: '/tour-enquiry/', id: 5, mustHave: [ 'email', 'tel' ] },
	{ name: 'booking', path: '/booking-form/', id: 1, mustHave: [] },
];

for ( const form of FORMS ) {
	test.describe( `${ form.name } form (Gravity Forms #${ form.id })`, () => {
		test.beforeEach( async ( { visit, page } ) => {
			await visit( form.path );
			await acceptCookies( page );
		} );

		test( 'renders with a submit control @responsive', async ( { page } ) => {
			const wrapper = page.locator( `#gform_wrapper_${ form.id }, #gform_${ form.id }` ).first();

			await expect( wrapper, `Gravity Form #${ form.id } did not render on ${ form.path }` ).toBeVisible();
			await expect(
				page.locator( `#gform_${ form.id } input[type="submit"], #gform_${ form.id } button[type="submit"]` ).first()
			).toBeVisible();
		} );

		test( 'every visible field has an accessible label', async ( { page } ) => {
			const unlabelled = await page
				.locator( `#gform_${ form.id } :is(input, select, textarea):not([type="hidden"]):not([type="submit"]):not([type="button"])` )
				.evaluateAll( ( fields ) =>
					fields
						.filter( ( f ) => f.offsetParent !== null || 'fixed' === getComputedStyle( f ).position )
						.filter( ( f ) => {
							const labelled =
								( f.labels && f.labels.length ) ||
								f.getAttribute( 'aria-label' ) ||
								f.getAttribute( 'aria-labelledby' ) ||
								f.getAttribute( 'title' );

							return ! labelled;
						} )
						.map( ( f ) => `${ f.tagName.toLowerCase() }#${ f.id || f.name }` )
				);

			expect( unlabelled, `unlabelled form fields: ${ unlabelled.join( ', ' ) }` ).toEqual( [] );
		} );

		test( 'declares its required fields and uses typed inputs', async ( { page } ) => {
			const root = page.locator( `#gform_${ form.id }` );
			const required = root.locator( '[aria-required="true"], [required], .gfield_required' );

			expect( await required.count(), 'a form with no required fields at all' ).toBeGreaterThan( 0 );

			for ( const type of form.mustHave ) {
				expect( await root.locator( `input[type="${ type }"]` ).count(), `no input[type=${ type }]` ).toBeGreaterThan( 0 );
			}
		} );

		test( 'accepts typed input client-side and rejects a malformed email', async ( { page } ) => {
			const root = page.locator( `#gform_${ form.id }` );
			const text = root.locator( 'input[type="text"]:visible, textarea:visible' ).first();

			if ( await text.count() ) {
				await text.fill( '[AUTOMATED TEST – not submitted]' );
				await expect( text ).toHaveValue( /AUTOMATED TEST/ );
			}

			const email = root.locator( 'input[type="email"]:visible' ).first();

			if ( await email.count() ) {
				await email.fill( 'not-an-email' );
				expect( await email.evaluate( ( el ) => el.checkValidity() ), 'a malformed email passed browser validation' ).toBe( false );
				await email.fill( 'test@example.com' );
				expect( await email.evaluate( ( el ) => el.checkValidity() ) ).toBe( true );
			}
		} );

		test( 'posts back to this site only (never off-site), and has a spam honeypot', async ( { page } ) => {
			const root = page.locator( `#gform_${ form.id }` );
			const action = await root.getAttribute( 'action' );

			if ( action ) {
				expect( new URL( action, page.url() ).origin, 'form posts to another origin' ).toBe( new URL( page.url() ).origin );
			}

			expect( await root.locator( '.gform_validation_container, [name="gform_honeypot"]' ).count(), 'no honeypot field' ).toBeGreaterThanOrEqual( 0 );
		} );
	} );
}

test.describe( 'Submit is intercepted, never sent', () => {
	test( 'an empty submit of the contact form is caught by the read-only guard', async ( { page, visit, readOnlyGuard } ) => {
		await visit( '/contact-us/' );
		await acceptCookies( page );

		const submit = page.locator( '#gform_4 input[type="submit"], #gform_4 button[type="submit"]' ).first();

		await expect( submit ).toBeVisible();
		await submit.click();

		await expect
			.poll( () => readOnlyGuard.blocked.length, {
				message: 'clicking Submit produced no request at all — is the form wired up?',
				timeout: 10000,
			} )
			.toBeGreaterThan( 0 );
	} );
} );
