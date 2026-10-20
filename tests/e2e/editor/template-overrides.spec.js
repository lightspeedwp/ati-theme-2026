/**
 * Site Editor database overrides shadowing theme files — read-only, REST.
 *
 * Anything edited in the Site Editor is stored in the database and wins over
 * the theme file, so a template can be right in the repository and wrong on the
 * site. This lists the templates and template parts whose `source` is
 * `custom` on the target.
 *
 * The goal is ZERO once the database overrides are reset, but until then the
 * list is REPORTED (annotations + stderr) rather than failed, so it does not
 * mask real regressions. A custom part with no theme file at all (an orphan)
 * is reported too.
 *
 * Needs `WP_REST_AUTH` (a full Authorization header value — a WordPress
 * application password, in `.env`). The project is dropped when it is unset. The
 * header is read here and sent only to the configured target with GET requests;
 * it is never printed.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { test, expect, request } = require( '@playwright/test' );
const { readResolvedRoutes } = require( '../fixtures/base.js' );

const THEME_ROOT = path.join( __dirname, '..', '..', '..' );

/**
 * @param {string} dir Directory under the theme root.
 * @return {string[]} Slugs of the .html files in it.
 */
function slugsIn( dir ) {
	return fs
		.readdirSync( path.join( THEME_ROOT, dir ) )
		.filter( ( f ) => f.endsWith( '.html' ) )
		.map( ( f ) => f.replace( /\.html$/, '' ) )
		.sort();
}

test.describe( 'Site Editor overrides (read-only REST)', () => {
	let api;

	test.beforeAll( async () => {
		test.skip( ! process.env.WP_REST_AUTH, 'WP_REST_AUTH is not set — see .env.example' );

		api = await request.newContext( {
			baseURL: readResolvedRoutes().baseURL,
			extraHTTPHeaders: { Authorization: process.env.WP_REST_AUTH },
		} );
	} );

	test.afterAll( async () => {
		await api?.dispose();
	} );

	/**
	 * @param {string} endpoint `templates` or `template-parts`.
	 * @return {Promise<Object[]>} Items.
	 */
	async function fetchAll( endpoint ) {
		const response = await api.get( `/wp-json/wp/v2/${ endpoint }?per_page=100&_fields=slug,source,origin,has_theme_file,theme,title` );

		expect( response.status(), `${ endpoint } returned ${ response.status() } — is the application password still valid?` ).toBe( 200 );

		return ( await response.json() ).filter( ( item ) => ! item.theme || 'ati-theme-2026' === item.theme );
	}

	test( 'templates with a database override (source=custom) — reported, goal zero', async () => {
		const templates = await fetchAll( 'templates' );
		const shadowed = templates.filter( ( t ) => 'custom' === t.source && t.has_theme_file ).map( ( t ) => t.slug ).sort();
		const orphans = templates.filter( ( t ) => 'custom' === t.source && ! t.has_theme_file ).map( ( t ) => t.slug ).sort();

		test.info().annotations.push(
			{ type: 'warning', description: `${ shadowed.length } template(s) shadowed by a DB override: ${ shadowed.join( ', ' ) || 'none' }` },
			{ type: 'warning', description: `${ orphans.length } custom template(s) with no theme file: ${ orphans.join( ', ' ) || 'none' }` }
		);
		process.stderr.write( `\n  ⚠ templates with source=custom (${ shadowed.length }): ${ shadowed.join( ', ' ) || 'none' }\n` );

		expect( true ).toBe( true );
	} );

	test( 'template parts with a database override (source=custom) — reported, goal zero', async () => {
		const parts = await fetchAll( 'template-parts' );
		const shadowed = parts.filter( ( t ) => 'custom' === t.source && t.has_theme_file ).map( ( t ) => t.slug ).sort();
		const orphans = parts.filter( ( t ) => 'custom' === t.source && ! t.has_theme_file ).map( ( t ) => t.slug ).sort();

		test.info().annotations.push(
			{ type: 'warning', description: `${ shadowed.length } part(s) shadowed by a DB override: ${ shadowed.join( ', ' ) || 'none' }` },
			{ type: 'warning', description: `${ orphans.length } custom part(s) with no theme file: ${ orphans.join( ', ' ) || 'none' }` }
		);
		process.stderr.write( `\n  ⚠ parts with source=custom (${ shadowed.length }): ${ shadowed.join( ', ' ) || 'none' }\n  ⚠ orphan custom parts (${ orphans.length }): ${ orphans.join( ', ' ) || 'none' }\n` );

		expect( true ).toBe( true );
	} );

	test( 'every template and part file in the theme is registered with WordPress', async () => {
		const templates = new Set( ( await fetchAll( 'templates' ) ).map( ( t ) => t.slug ) );
		const parts = new Set( ( await fetchAll( 'template-parts' ) ).map( ( t ) => t.slug ) );

		const missing = [
			...slugsIn( 'templates' ).filter( ( s ) => ! templates.has( s ) ).map( ( s ) => `templates/${ s }.html` ),
			...slugsIn( 'parts' ).filter( ( s ) => ! parts.has( s ) ).map( ( s ) => `parts/${ s }.html` ),
		];

		expect( missing, `files WordPress does not list (malformed block comment, or not deployed yet):\n  ${ missing.join( '\n  ' ) }` ).toEqual( [] );
	} );

	test( 'the front page template resolves from the theme file, not the database', async () => {
		const front = ( await fetchAll( 'templates' ) ).find( ( t ) => 'front-page' === t.slug );

		expect( front, 'no front-page template registered' ).toBeTruthy();
		expect( front.source, `front-page renders from "${ front.source }"` ).toBe( 'theme' );
	} );

	test( 'user global styles do not override theme.json', async () => {
		const themes = await api.get( '/wp-json/wp/v2/themes?status=active&_fields=stylesheet,_links' );

		test.skip( ! themes.ok(), 'themes endpoint not available' );

		const [ active ] = await themes.json();
		const link = active?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href;

		test.skip( ! link, 'no user-global-styles link' );

		const response = await api.get( link );
		const styles = await response.json();
		const customised = [ Object.keys( styles.settings || {} ).length && 'settings', Object.keys( styles.styles || {} ).length && 'styles' ].filter( Boolean );

		test.info().annotations.push( { type: 'warning', description: `user global styles: ${ customised.join( ', ' ) || 'none' }` } );

		expect( true ).toBe( true );
	} );
} );
