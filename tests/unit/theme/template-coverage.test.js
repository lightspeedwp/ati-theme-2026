/**
 * Every template file is exercised by at least one e2e route.
 *
 * The route map (tests/e2e/fixtures/routes.js) names the template each route is
 * meant to render. If a template is added without a route that reaches it, it
 * ships untested; this fails the day it lands rather than the day someone
 * remembers.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

import { expectNone } from '../helpers/assert';
import { list } from '../helpers/theme-files';

const require = createRequire( import.meta.url );
const routes = require( '../../e2e/fixtures/routes.js' );

describe( 'e2e route map covers the templates', () => {
	const covered = new Set( [
		...routes.STATIC_ROUTES.map( ( r ) => r.template ),
		...routes.RESOLVED_ROUTES.map( ( r ) => r.template ),
		...routes.RESOLVED_TAXONOMIES.map( ( r ) => r.template ),
		...routes.SYNTHETIC_ROUTES.map( ( r ) => r.template ),
		...Object.keys( routes.IMPLICIT_TEMPLATES ),
	] );

	it( 'maps every file in templates/ to a route', () => {
		const uncovered = list( 'templates', '.html' )
			.map( ( file ) => file.replace( /^templates\//, '' ) )
			.filter( ( file ) => ! covered.has( file ) );

		expectNone( uncovered, 'templates with no e2e route (add one to tests/e2e/fixtures/routes.js):' );
	} );

	it( 'names only templates that exist', () => {
		const existing = new Set( list( 'templates', '.html' ).map( ( f ) => f.replace( /^templates\//, '' ) ) );
		const stale = [ ...covered ].filter( ( file ) => ! existing.has( file ) );

		expectNone( stale, 'route map names templates that do not exist:' );
	} );
} );
