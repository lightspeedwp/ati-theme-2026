/**
 * Taxonomy archives (travel style, accommodation type, accommodation brand) and
 * the blog's category / tag archives, each resolved to a term that has posts.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { test, expect } = require( '../fixtures/base.js' );
const { RESOLVED_TAXONOMIES } = require( '../fixtures/routes.js' );
const { assertPageContract, results } = require( '../utils/page-contract.js' );

test.describe( 'Taxonomy archives', () => {
	for ( const route of RESOLVED_TAXONOMIES ) {
		test( `${ route.name } (${ route.template }) renders and lists results @responsive`, async ( { page, visit, routes } ) => {
			const target = routes.term( route.key );

			test.skip( ! target, `no populated ${ route.key } term on this environment` );

			await visit( target );
			await assertPageContract( page );
			await expect( results( page ), `${ target } listed nothing inside <main>` ).not.toHaveCount( 0 );
		} );
	}
} );
