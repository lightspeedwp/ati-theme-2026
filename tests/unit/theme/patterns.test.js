/**
 * Pattern file hygiene: headers, PHP syntax, block-comment balance, SVG icons.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { describe, expect, it } from 'vitest';

import { spawnSync } from 'node:child_process';
import { advise } from '../helpers/advisory';
import { expectNone } from '../helpers/assert';
import { parseBlocks } from '../helpers/block-parser';
import {
	list,
	markup,
	markupFiles,
	patternHeaders,
	themePath,
} from '../helpers/theme-files';

const PATTERNS = list( 'patterns', '.php' );
const php = spawnSync( 'php', [ '-v' ] );
const HAS_PHP = 0 === php.status;

describe( 'pattern headers', () => {
	it.each( PATTERNS )( '%s has a Title', ( file ) => {
		expect( patternHeaders( file ).title ).toBeTruthy();
	} );

	/**
	 * Convention (matches the SD theme): `Slug: ati-theme-2026/<filename>`.
	 * ATI's chrome patterns (header, main-header, top-header, footer, single-hero)
	 * use a bare slug plus a `Theme:` header instead; they resolve, but they
	 * break the convention and the slug-by-filename lookup.
	 */
	it.each( PATTERNS )( '%s declares Slug: ati-theme-2026/<filename>', ( file ) => {
		const base = file.replace( /^patterns\/|\.php$/g, '' );

		expect( patternHeaders( file ).slug ).toBe( `ati-theme-2026/${ base }` );
	} );

	it( 'declare unique slugs', () => {
		const seen = new Map();
		const problems = [];

		for ( const file of PATTERNS ) {
			const { slug } = patternHeaders( file );

			if ( ! slug ) {
				problems.push( `${ file } has no Slug header` );
			} else if ( seen.has( slug ) ) {
				problems.push( `${ file } repeats slug "${ slug }" (also ${ seen.get( slug ) })` );
			} else {
				seen.set( slug, file );
			}
		}

		expectNone( problems, 'pattern slug problems:' );
	} );
} );

describe( 'php syntax', () => {
	for ( const file of [ ...PATTERNS, 'functions.php', ...list( 'inc', '.php' ) ] ) {
		it.skipIf( ! HAS_PHP )( `${ file } is php -l clean`, () => {
			const result = spawnSync( 'php', [ '-l', themePath( file ) ], {
				encoding: 'utf8',
			} );

			expect(
				result.status,
				`php -l ${ file }:\n${ result.stdout }${ result.stderr }`
			).toBe( 0 );
		} );
	}
} );

describe( 'block comments are balanced and parseable', () => {
	it.each( markupFiles() )( '%s', ( file ) => {
		expectNone(
			parseBlocks( markup( file ) ).errors,
			`${ file } has unbalanced or invalid block delimiters (the Editor will show "Attempt recovery" or drop content):`
		);
	} );
} );

describe( 'icon SVGs', () => {
	/**
	 * Advisory: an inline icon filled `#000000` ignores the text colour of the
	 * element around it (white-on-dark, hover colours), where `currentColor`
	 * follows it.
	 */
	it( 'use currentColor, not #000000 (advisory)', () => {
		let total = 0;

		for ( const file of markupFiles() ) {
			const hits = [];

			markup( file )
				.split( '\n' )
				.forEach( ( text, index ) => {
					const count = ( text.match( /<svg[^>]*fill="#000(?:000)?"/gi ) || [] ).length;

					if ( count ) {
						hits.push( `line ${ index + 1 }: ${ count } svg(s) with fill="#000000"` );
						total += count;
					}
				} );

			advise( 'svg-fill-000000', file, hits );
		}

		process.stderr.write( `\nADVISORY [svg-fill-000000] total: ${ total } icon(s)\n` );
		expect( total ).toBeGreaterThanOrEqual( 0 );
	} );
} );
