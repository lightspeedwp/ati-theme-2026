/**
 * No unintended vertical gap between consecutive full-width sections.
 *
 * Two places a stray `blockGap` shows up as a band of page background between
 * two sections that should butt together:
 *
 *   - the direct children of `main`   (page sections inside the template);
 *   - the direct children of `.wp-site-blocks` (header, main, footer, and any
 *     wrappers between them).
 *
 * The known cause: Tour Operator 2.2 wraps each sticky-menu section in
 * `div.lsx-to-sticky-menu-section-wrapper`; that wrapper is a flow-layout child
 * so it picks up a 20px `blockGap` margin from its parent, and every wrapped
 * section is separated from its neighbour by a 20px stripe. (CSS fix pending in
 * the working tree; this spec is what verifies it once deployed.)
 *
 * Measured the way a visitor sees it: bounding boxes of the rendered,
 * non-collapsed children, the gap being `next.top - prev.bottom`.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );

/**
 * Gaps up to this size are rounding, not layout.
 */
const TOLERANCE = 1;

/**
 * @param {import('@playwright/test').Page} page Page under test.
 * @return {Promise<{container: string, gap: number, between: string}[]>} Gaps over tolerance.
 */
async function measureGaps( page ) {
	return page.evaluate( ( tolerance ) => {
		const describe = ( el ) =>
			`<${ el.tagName.toLowerCase() }${ el.id ? `#${ el.id }` : '' } .${ [ ...el.classList ]
				.filter( ( c ) => ! c.startsWith( 'wp-container' ) && ! c.startsWith( 'is-layout' ) && ! c.startsWith( 'wp-block-group-is' ) )
				.slice( 0, 3 )
				.join( '.' ) }>`;
		const found = [];
		const check = ( el, label ) => {
			// Only children that take part in the layout: displayed, with a box, not
			// out of flow (a fixed/absolute child is not "between" anything).
			const kids = [ ...el.children ].filter( ( c ) => {
				const style = getComputedStyle( c );

				return 'none' !== style.display && 0 < c.offsetHeight && ! [ 'fixed', 'absolute' ].includes( style.position );
			} );

			for ( let i = 1; i < kids.length; i++ ) {
				const gap = Math.round( kids[ i ].getBoundingClientRect().top - kids[ i - 1 ].getBoundingClientRect().bottom );

				if ( gap > tolerance ) {
					found.push( { container: label, gap, between: `${ describe( kids[ i - 1 ] ) } → ${ describe( kids[ i ] ) }` } );
				}
			}
		};

		check( document.querySelector( '.wp-site-blocks' ), '.wp-site-blocks' );
		document.querySelectorAll( 'main' ).forEach( ( main ) => check( main, 'main' ) );

		return found;
	}, TOLERANCE );
}

const PAGES = [
	[ 'front page', ( routes ) => '/' ],
	[ 'single tour', ( routes ) => routes.post( 'tour' ) ],
	[ 'single accommodation', ( routes ) => routes.post( 'accommodation' ) ],
	[ 'single country', ( routes ) => routes.post( 'country' ) ],
	[ 'single region', ( routes ) => routes.post( 'region' ) ],
	[ 'single review', ( routes ) => routes.post( 'review' ) ],
	[ 'single special', ( routes ) => routes.post( 'special' ) ],
	[ 'tour archive', () => '/tours/' ],
	[ 'accommodation archive', () => '/accommodation/' ],
	[ 'our story', () => '/our-story/' ],
	[ 'impact', () => '/impact/' ],
];

test.describe( 'Section spacing', () => {
	for ( const [ name, resolve ] of PAGES ) {
		test( `${ name }: no stray gap between consecutive sections @responsive`, async ( { page, visit, routes } ) => {
			const path = resolve( routes );

			test.skip( ! path, `no published ${ name }` );

			await visit( path );
			// Layout settles after fonts and lazy images.
			await page.evaluate( () => document.fonts.ready );

			const gaps = await measureGaps( page );

			expect(
				gaps.map( ( g ) => `${ g.container }: ${ g.gap }px between ${ g.between }` ),
				`${ path } has vertical gaps between consecutive sections. ` +
					'A 20px gap before/after a div.lsx-to-sticky-menu-section-wrapper is the known Tour Operator 2.2 blockGap bug.'
			).toEqual( [] );
		} );
	}

	test( 'sticky-menu section wrappers carry no block-gap margin', async ( { page, visit, routes } ) => {
		const path = routes.post( 'tour' );

		test.skip( ! path, 'no published tour' );

		await visit( path );

		const margins = await page.locator( '.lsx-to-sticky-menu-section-wrapper' ).evaluateAll( ( nodes ) =>
			nodes
				.map( ( n ) => {
					const style = getComputedStyle( n );

					return { id: n.querySelector( '[id]' )?.id || '', top: parseFloat( style.marginTop ), bottom: parseFloat( style.marginBottom ) };
				} )
				// The first child of its parent never takes the gap.
				.filter( ( m, i ) => 0 < i && 0 < m.top )
		);

		test.skip( 0 === ( await page.locator( '.lsx-to-sticky-menu-section-wrapper' ).count() ), 'no sticky-menu wrappers on this page' );

		expect( margins, 'sticky-menu wrappers with a non-zero top margin (flow blockGap)' ).toEqual( [] );
	} );
} );
