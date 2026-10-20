/**
 * Automated accessibility scans across the template set, plus the structural
 * assertions that are absolute (landmarks, heading order, names).
 *
 * See utils/axe.js for how the baseline gate works; with none recorded the
 * scans report (stderr + `axe` annotations) and do not fail.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );
const { STATIC_ROUTES, RESOLVED_ROUTES, RESOLVED_TAXONOMIES, SYNTHETIC_ROUTES } = require( '../fixtures/routes.js' );
const { scan, check } = require( '../utils/axe.js' );
const { assertHeadingHierarchy } = require( '../utils/page-contract.js' );

const PAGES = readResolvedRoutes().pages;

test.describe( 'Accessibility — static routes @a11y', () => {
	for ( const route of STATIC_ROUTES ) {
		test( `${ route.name } has no new WCAG 2.2 AA violations`, async ( { page, visit }, testInfo ) => {
			await visit( route.path );
			check( await scan( page ), route.path, `${ route.path } (${ route.template })`, testInfo );
		} );
	}
} );

test.describe( 'Accessibility — every static page @a11y', () => {
	for ( const entry of PAGES ) {
		test( `${ entry.title } (${ entry.path }) has no new WCAG 2.2 AA violations`, async ( { page, visit }, testInfo ) => {
			await visit( entry.path );
			check( await scan( page ), `page:${ entry.slug }`, entry.path, testInfo );
		} );
	}
} );

test.describe( 'Accessibility — single templates @a11y', () => {
	for ( const route of RESOLVED_ROUTES ) {
		test( `${ route.name } has no new WCAG 2.2 AA violations`, async ( { page, visit, routes }, testInfo ) => {
			const target = routes.post( route.key );

			test.skip( ! target, `no published ${ route.key }` );
			await visit( target );
			// Keyed by type, not permalink, so the baseline survives content changes.
			check( await scan( page ), `single:${ route.key }`, `${ target } (${ route.template })`, testInfo );
		} );
	}
} );

test.describe( 'Accessibility — taxonomy archives, search, 404 @a11y', () => {
	for ( const route of RESOLVED_TAXONOMIES ) {
		test( `${ route.name } has no new WCAG 2.2 AA violations`, async ( { page, visit, routes }, testInfo ) => {
			const target = routes.term( route.key );

			test.skip( ! target, `no populated ${ route.key } term` );
			await visit( target );
			check( await scan( page ), `taxonomy:${ route.key }`, `${ target } (${ route.template })`, testInfo );
		} );
	}

	for ( const route of SYNTHETIC_ROUTES ) {
		test( `${ route.name } has no new WCAG 2.2 AA violations`, async ( { page, visit }, testInfo ) => {
			await visit( route.path, { expectStatus: route.expectStatus || 200 } );
			check( await scan( page ), route.path, `${ route.path } (${ route.template })`, testInfo );
		} );
	}
} );

test.describe( 'Accessibility — structure @a11y', () => {
	test( 'front page: one banner, one main, one contentinfo', async ( { page, visit } ) => {
		await visit( '/' );

		/**
		 * The header is two patterns that each render a `<header>`; two page-level
		 * `<header>`s are two `banner` landmarks (axe: landmark-no-duplicate-banner).
		 */
		await expect( page.getByRole( 'banner' ), 'more than one banner landmark (top-header and main-header both render <header>)' ).toHaveCount( 1 );
		await expect( page.getByRole( 'contentinfo' ) ).toHaveCount( 1 );
		await expect( page.getByRole( 'main' ) ).toHaveCount( 1 );
	} );

	test( 'navigation landmarks are named and distinguishable', async ( { page, visit } ) => {
		await visit( '/' );

		const names = await page.getByRole( 'navigation' ).evaluateAll( ( nodes ) =>
			nodes.map( ( node ) => {
				const by = ( node.getAttribute( 'aria-labelledby' ) || '' ).split( /\s+/ ).filter( Boolean );

				return by.length
					? by.map( ( id ) => document.getElementById( id )?.textContent || '' ).join( ' ' ).replace( /\s+/g, ' ' ).trim()
					: ( node.getAttribute( 'aria-label' ) || '' ).trim();
			} )
		);

		expect( names.filter( ( n ) => ! n ).length, 'navigation landmark(s) with no accessible name' ).toBe( 0 );

		const duplicates = names.filter( ( n, i ) => n && names.indexOf( n ) !== i );

		expect( duplicates, `duplicate navigation names: ${ duplicates.join( ', ' ) }` ).toEqual( [] );
	} );

	for ( const key of [ 'tour', 'accommodation', 'region', 'review' ] ) {
		test( `single ${ key }: heading hierarchy has no skipped levels`, async ( { page, visit, routes } ) => {
			const target = routes.post( key );

			test.skip( ! target, `no published ${ key }` );
			await visit( target );
			await assertHeadingHierarchy( page );
		} );
	}

	test( 'every image has an alt attribute', async ( { page, visit } ) => {
		await visit( '/' );

		const missing = await page.locator( 'img:not([alt])' ).evaluateAll( ( imgs ) => imgs.map( ( i ) => ( i.currentSrc || i.src ).slice( -60 ) ) );

		expect( missing, `images with no alt attribute:\n  ${ missing.join( '\n  ' ) }` ).toEqual( [] );
	} );

	test( 'the page language is set', async ( { page, visit } ) => {
		await visit( '/' );
		await expect( page.locator( 'html' ) ).toHaveAttribute( 'lang', /^[a-z]{2}/i );
	} );
} );
