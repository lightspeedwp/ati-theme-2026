/**
 * Read the theme's authored files from disk, for the static contract tests.
 *
 * These tests are static: they read templates, parts, patterns, styles and
 * theme.json as text and check the rules AGENTS.md states. No WordPress, no
 * browser — a full run takes a couple of seconds (most of it `php -l`).
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const THEME_ROOT = path.join(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..',
	'..',
	'..'
);

/**
 * @param {string} relative Path relative to the theme root.
 * @return {string} Absolute path.
 */
export function themePath( relative ) {
	return path.join( THEME_ROOT, relative );
}

/**
 * @param {string} relative Path relative to the theme root.
 * @return {string} File contents.
 */
export function read( relative ) {
	return fs.readFileSync( themePath( relative ), 'utf8' );
}

/**
 * Files in a theme directory, optionally recursive, as theme-relative paths.
 *
 * @param {string}  directory Directory relative to the theme root.
 * @param {string}  extension Extension including the dot.
 * @param {boolean} recursive Whether to descend.
 * @return {string[]} Sorted theme-relative paths.
 */
export function list( directory, extension, recursive = false ) {
	const absolute = themePath( directory );

	if ( ! fs.existsSync( absolute ) ) {
		return [];
	}

	return fs
		.readdirSync( absolute, { withFileTypes: true } )
		.flatMap( ( entry ) => {
			const relative = path.posix.join( directory, entry.name );

			if ( entry.isDirectory() ) {
				return recursive ? list( relative, extension, true ) : [];
			}

			return entry.name.endsWith( extension ) ? [ relative ] : [];
		} )
		.sort();
}

/**
 * A file's block markup: the file itself, minus PHP docblocks and CSS-style
 * comments. Pattern docblocks may quote block delimiters when they explain
 * history; a quotation is not markup. Block delimiters are HTML comments and
 * survive.
 *
 * @param {string} relative Path relative to the theme root.
 * @return {string} Markup.
 */
export function markup( relative ) {
	const text = read( relative );

	return relative.endsWith( '.php' )
		? text.replace( /\/\*[\s\S]*?\*\//g, '' )
		: text;
}

/**
 * Header fields of a pattern file (`Title:`, `Slug:`, …).
 *
 * @param {string} relative Pattern path relative to the theme root.
 * @return {Object<string, string>} Header values keyed by lower-cased name.
 */
export function patternHeaders( relative ) {
	const docblock = read( relative ).match( /\/\*\*([\s\S]*?)\*\// );
	const headers = {};

	if ( ! docblock ) {
		return headers;
	}

	for ( const line of docblock[ 1 ].split( '\n' ) ) {
		const match = line.match( /^\s*\*\s*([A-Za-z ]+):\s*(.+?)\s*$/ );

		if ( match ) {
			headers[ match[ 1 ].trim().toLowerCase() ] = match[ 2 ];
		}
	}

	return headers;
}

/**
 * Every pattern file, keyed by its declared slug.
 *
 * ATI's chrome patterns (header, footer, main-header, top-header) declare a
 * bare slug plus a `Theme:` header, so the *registered* slug is
 * `ati-theme-2026/<bare>` when no namespace is given.
 *
 * @return {Map<string, string>} Declared slug → theme-relative path.
 */
export function patternsBySlug() {
	const bySlug = new Map();

	for ( const file of list( 'patterns', '.php' ) ) {
		const { slug } = patternHeaders( file );

		if ( slug ) {
			bySlug.set( slug, file );
		}
	}

	return bySlug;
}

/**
 * The block-markup files the authoring rules apply to.
 *
 * @return {string[]} Theme-relative paths.
 */
export function markupFiles() {
	return [
		...list( 'templates', '.html' ),
		...list( 'parts', '.html' ),
		...list( 'patterns', '.php' ),
	];
}
