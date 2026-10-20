/**
 * theme.json and every style variation are valid, current-schema JSON, and
 * theme.json's `templateParts` agree with the files in parts/.
 *
 * A JSON syntax error in theme.json does not fail loudly: WordPress falls back
 * to core defaults and the site renders unstyled. In a section style it is
 * quieter still — the variation just disappears from the editor.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { describe, expect, it } from 'vitest';

import fs from 'node:fs';
import { expectNone } from '../helpers/assert';
import { list, read, themePath } from '../helpers/theme-files';

const STYLE_FILES = list( 'styles', '.json', true );
const SCHEMA = /^https:\/\/schemas\.wp\.org\/(wp\/[\d.]+|trunk)\/theme\.json$/;

describe( 'theme.json', () => {
	it( 'is valid JSON', () => {
		expect( () => JSON.parse( read( 'theme.json' ) ) ).not.toThrow();
	} );

	const themeJson = JSON.parse( read( 'theme.json' ) );

	it( 'is version 3 against a WordPress schema', () => {
		expect( themeJson.version ).toBe( 3 );
		expect( themeJson.$schema ).toMatch( SCHEMA );
	} );

	it( 'keeps the fixed colour palette (47 presets, AGENTS.md)', () => {
		expect( themeJson.settings.color.palette ).toHaveLength( 47 );
	} );

	it( 'declares templateParts that all have a file in parts/', () => {
		const missing = ( themeJson.templateParts || [] )
			.filter(
				( part ) =>
					! fs.existsSync( themePath( `parts/${ part.name }.html` ) )
			)
			.map( ( part ) => `templateParts "${ part.name }" has no parts/${ part.name }.html` );

		expectNone( missing, 'theme.json templateParts without a file:' );
	} );

	it( 'declares every file in parts/ as a templatePart (so the Editor can place it)', () => {
		const declared = new Set(
			( themeJson.templateParts || [] ).map( ( part ) => part.name )
		);
		const undeclared = list( 'parts', '.html' )
			.map( ( file ) => file.replace( /^parts\/|\.html$/g, '' ) )
			.filter( ( name ) => ! declared.has( name ) )
			.map( ( name ) => `parts/${ name }.html is not in theme.json templateParts` );

		expectNone( undeclared, 'part files not declared in theme.json:' );
	} );

	it( 'gives every templatePart a valid area', () => {
		const bad = ( themeJson.templateParts || [] )
			.filter(
				( part ) =>
					! [ 'header', 'footer', 'uncategorized' ].includes( part.area )
			)
			.map( ( part ) => `${ part.name }: area "${ part.area }"` );

		expectNone( bad, 'templateParts with an unknown area:' );
	} );
} );

describe( 'style variations', () => {
	it( 'exist', () => {
		expect( STYLE_FILES.length ).toBeGreaterThan( 0 );
	} );

	it.each( STYLE_FILES )( '%s is valid version 3 JSON', ( file ) => {
		const json = JSON.parse( read( file ) );

		expect( json.version ).toBe( 3 );

		if ( json.$schema ) {
			expect( json.$schema ).toMatch( SCHEMA );
		}
	} );

	/**
	 * Core dedupes variations by basename across the tree, so two files with
	 * the same name in different folders silently become one.
	 */
	it( 'have unique basenames across the whole tree', () => {
		const seen = new Map();
		const duplicates = [];

		for ( const file of STYLE_FILES ) {
			const base = file.split( '/' ).pop();

			if ( seen.has( base ) ) {
				duplicates.push( `${ seen.get( base ) } ↔ ${ file }` );
			}

			seen.set( base, file );
		}

		expectNone( duplicates, 'duplicate style basenames:' );
	} );
} );

describe( 'style.css', () => {
	it( 'carries the theme header WordPress needs', () => {
		const header = read( 'style.css' ).slice( 0, 1500 );

		expect( header ).toMatch( /Theme Name:\s*\S+/ );
		expect( header ).toMatch( /Text Domain:\s*ati-theme-2026/ );
		expect( header ).toMatch( /Version:\s*\d/ );
	} );
} );
