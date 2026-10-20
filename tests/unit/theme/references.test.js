/**
 * Reference integrity across templates, parts and patterns.
 *
 * - Every `wp:pattern` slug and `wp:template-part` slug resolves to a file.
 * - No per-install ids: no synced-pattern `wp:block {"ref":N}` (and, as an
 *   advisory, no `wp:navigation {"ref":N}`) — neither survives a move to a
 *   different database.
 * - No hard-coded dev or live URLs.
 * - Every template has exactly one `<main>` landmark, counted through the parts
 *   and patterns it pulls in.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { describe, expect, it } from 'vitest';

import fs from 'node:fs';
import { advise } from '../helpers/advisory';
import { expectNone } from '../helpers/assert';
import { parseBlocks } from '../helpers/block-parser';
import {
	list,
	markup,
	markupFiles,
	patternsBySlug,
	read,
	themePath,
} from '../helpers/theme-files';

const THEME = 'ati-theme-2026';
const PATTERNS = patternsBySlug();
const FILES = markupFiles();

/**
 * @param {string} file  Theme-relative path.
 * @param {string} name  Block name.
 * @return {Object[]} Blocks of that name.
 */
function blocksNamed( file, name ) {
	return parseBlocks( markup( file ) ).all.filter( ( b ) => b.name === name );
}

/**
 * A pattern slug resolves when a pattern file declares it. A bare slug is
 * accepted too (ATI's header/footer patterns declare one).
 *
 * @param {string} slug Slug as written in a block.
 * @return {boolean} Whether it resolves.
 */
function patternResolves( slug ) {
	return PATTERNS.has( slug ) || PATTERNS.has( `${ THEME }/${ slug }` );
}

/**
 * Expanded markup of a file, following parts and patterns.
 *
 * @param {string}      file Theme-relative path.
 * @param {Set<string>} seen Stack, to stop cycles.
 * @return {{text: string, foreign: boolean}} Expanded markup and whether it pulls in a plugin pattern.
 */
function expand( file, seen = new Set() ) {
	if ( seen.has( file ) ) {
		return { text: '', foreign: false };
	}

	const next = new Set( seen ).add( file );
	const own = markup( file );
	let text = own;
	let foreign = false;

	for ( const block of parseBlocks( own ).all ) {
		if ( 'core/template-part' === block.name && block.attrs.slug ) {
			const part = `parts/${ block.attrs.slug }.html`;

			if ( fs.existsSync( themePath( part ) ) ) {
				const inner = expand( part, next );
				text += `\n${ inner.text }`;
				foreign = foreign || inner.foreign;
			}
		}

		if ( 'core/pattern' === block.name && block.attrs.slug ) {
			const slug = block.attrs.slug;
			const resolved = PATTERNS.get( slug ) || PATTERNS.get( `${ THEME }/${ slug }` );

			if ( resolved ) {
				const inner = expand( resolved, next );
				text += `\n${ inner.text }`;
				foreign = foreign || inner.foreign;
			} else if ( ! slug.startsWith( THEME ) ) {
				foreign = true;
			}
		}
	}

	return { text, foreign };
}

describe( 'references resolve', () => {
	it.each( FILES )( '%s references only parts and patterns that exist', ( file ) => {
		const missing = [];

		for ( const block of blocksNamed( file, 'core/template-part' ) ) {
			const { slug, theme } = block.attrs;

			if (
				slug &&
				( ! theme || THEME === theme ) &&
				! fs.existsSync( themePath( `parts/${ slug }.html` ) )
			) {
				missing.push( `line ${ block.line }: template part "${ slug }" has no parts/${ slug }.html` );
			}
		}

		for ( const block of blocksNamed( file, 'core/pattern' ) ) {
			const { slug } = block.attrs;

			// Plugin patterns (lsx-tour-operator/…) are not ours to resolve.
			const ours =
				! slug?.includes( '/' ) || slug.startsWith( `${ THEME }/` );

			if ( slug && ours && ! patternResolves( slug ) ) {
				missing.push( `line ${ block.line }: pattern "${ slug }" is not declared by any file in patterns/` );
			}
		}

		expectNone( missing, `${ file } has dangling references:` );
	} );
} );

describe( 'no per-install ids', () => {
	it.each( FILES )( '%s has no synced-pattern wp:block ref', ( file ) => {
		const refs = blocksNamed( file, 'core/block' )
			.filter( ( b ) => undefined !== b.attrs.ref )
			.map( ( b ) => `line ${ b.line }: wp:block ref ${ b.attrs.ref }` );

		expectNone(
			refs,
			`${ file } embeds synced patterns by database id — the id does not exist on any other install. Inline the pattern or reference a theme pattern by slug:`
		);
	} );

	/**
	 * Advisory: a navigation `ref` is also a database id, but TO/Ollie header
	 * menus are normally authored that way and the client edits them in the
	 * Editor. Reported so it is visible; not failing.
	 */
	it( 'reports wp:navigation refs (advisory)', () => {
		for ( const file of FILES ) {
			advise(
				'navigation-ref',
				file,
				blocksNamed( file, 'core/navigation' )
					.filter( ( b ) => undefined !== b.attrs.ref )
					.map( ( b ) => `line ${ b.line }: wp:navigation ref ${ b.attrs.ref }` )
			);
		}

		expect( true ).toBe( true );
	} );
} );

describe( 'no hard-coded environment URLs', () => {
	const URL_PATTERN = /https?:\/\/(?:www\.)?ati-holidays(?:\.lightspeedwp\.dev|\.com)[^\s"')<]*/gi;
	const SCANNED = [
		...FILES,
		...list( 'styles', '.json', true ),
		...list( 'assets', '.css', true ),
		...list( 'assets', '.js', true ),
		'theme.json',
		'style.css',
		'functions.php',
	];

	it.each( SCANNED )( '%s has no ati-holidays.* URL', ( file ) => {
		const hits = [];

		read( file )
			.split( '\n' )
			.forEach( ( text, index ) => {
				for ( const match of text.matchAll( URL_PATTERN ) ) {
					hits.push( `line ${ index + 1 }: ${ match[ 0 ].slice( 0, 110 ) }` );
				}
			} );

		expectNone(
			hits,
			`${ file } hard-codes an environment URL. Use a relative path, home_url()/get_theme_file_uri(), or a block binding:`
		);
	} );
} );

describe( 'templates', () => {
	const templates = list( 'templates', '.html' );

	it( 'include index.html', () => {
		expect( templates ).toContain( 'templates/index.html' );
	} );

	/**
	 * Counted by `"tagName":"main"` attribute only — a static block serialises
	 * its tag twice (comment attribute and element), so counting elements too
	 * would double every landmark. A template that hands its body to a plugin's
	 * pattern is held to "at most one".
	 */
	it.each( templates )( '%s has exactly one <main> landmark', ( file ) => {
		const { text, foreign } = expand( file );
		const count = ( text.match( /"tagName"\s*:\s*"main"/g ) || [] ).length;

		expect(
			foreign ? [ 0, 1 ] : [ 1 ],
			`${ file } expands to ${ count } <main> landmark(s)`
		).toContain( count );
	} );
} );
