/**
 * Tour Operator's wrapper-visibility rule, re-implemented for static checking.
 *
 * LSX Tour Operator 2.2 hooks `render_block` (`Query_Loop::maybe_hide_varitaion`,
 * includes/classes/blocks/class-query-loop.php) and *removes the block's HTML*
 * for any `core/group` or `core/paragraph` whose `className` matches
 *
 *     /(lsx|facts)-(.*?)-wrapper/
 *
 * when the "key" it derives is empty for the current post:
 *
 *   key = match, minus `facts-`, `lsx-`, `-wrapper`
 *
 *   1. `-query` in the key        → related-query rules (regions / country / …)
 *   2. key is a taxonomy          → hidden when the post has no terms in it
 *   3. location / *_map           → hidden unless the post has a map
 *      gallery / itinerary / units→ dedicated checks
 *   4. anything else              → post meta (hyphens → underscores), hidden
 *                                   when empty; `include_exclude` reads
 *                                   `included` + `not_included`
 *   +  `travel-information` (filterable multi-field map) is hidden only when
 *      every one of its fields is empty.
 *
 * The consequence — and the reason this file exists — is that a wrapper class
 * which does not match the binding *inside* it makes the row vanish for every
 * post where the class's own key happens to be empty. Nothing errors; the row
 * is just not there.
 *
 * Keep this in step with the plugin. It is deliberately a literal port, quirks
 * included (see `classNameQuirk`).
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { bindingsOf, parseBlocks } from './block-parser.js';
import { markup, patternsBySlug, read, themePath } from './theme-files.js';
import fs from 'node:fs';

/**
 * The plugin's own pattern, verbatim.
 */
export const WRAPPER_PATTERN = /(lsx|facts)-(.*?)-wrapper/;

/**
 * Taxonomies registered on ATI (Tour Operator's, plus core's). A wrapper whose
 * key is one of these is checked against the post's terms, not its meta.
 */
export const TAXONOMIES = [
	'travel-style',
	'accommodation-type',
	'accommodation-brand',
	'continent',
	'facility',
	'category',
	'post_tag',
	'post-tag',
];

/**
 * Wrappers that deliberately house several fields. TO hides these only when
 * *all* of their meta keys are empty, so the binding inside need not (and
 * cannot) match the wrapper key. Each lists the meta keys that make the wrapper
 * legitimate; at least one binding from the list must be inside.
 *
 * `travel-information` mirrors TO's default `lsx_to_multi_field_wrappers`;
 * `include-exclude` is the hard-coded `included` + `not_included` branch.
 */
const BASE_MULTI_FIELD_WRAPPERS = {
	'travel-information': [
		'additional_info',
		'banking',
		'climate',
		'cuisine',
		'electricity',
		'dress',
		'health',
		'safety',
		'transport',
		'visa',
	],
	'include-exclude': [ 'included', 'not_included' ],
};

/**
 * Wrappers the THEME registers through the `lsx_to_multi_field_wrappers`
 * filter (functions.php: `$wrappers['booking-validity'] = array( … )`), which
 * is how TO lets a wrapper stand for several meta keys. Read from the source so
 * the static check agrees with what the plugin will do at runtime.
 *
 * @return {Object<string, string[]>} Wrapper key → meta keys.
 */
function themeRegisteredWrappers() {
	if ( ! fs.existsSync( themePath( 'functions.php' ) ) ) {
		return {};
	}

	const found = {};

	for ( const match of read( 'functions.php' ).matchAll(
		/\$wrappers\[\s*'([a-z0-9_-]+)'\s*\]\s*=\s*array\(([^)]*)\)/g
	) ) {
		found[ match[ 1 ] ] = [ ...match[ 2 ].matchAll( /'([a-z0-9_]+)'/g ) ].map( ( m ) => m[ 1 ] );
	}

	return found;
}

export const MULTI_FIELD_WRAPPERS = {
	...BASE_MULTI_FIELD_WRAPPERS,
	...themeRegisteredWrappers(),
};

/**
 * Wrapper keys served by a dedicated TO block binding that carries no `key`
 * argument. Maps wrapper key → the binding sources that satisfy it.
 */
export const KEYLESS_SOURCES = {
	gallery: [ 'lsx/gallery' ],
	itinerary: [ 'lsx/tour-itinerary' ],
	units: [ 'lsx/accommodation-units' ],
	location: [ 'lsx/map' ],
	wetu_map: [ 'lsx/map' ],
	google_map: [ 'lsx/map' ],
	'wetu-map': [ 'lsx/map' ],
	'google-map': [ 'lsx/map' ],
};

/**
 * Post types a `X-related-Y-query` wrapper may name (the plugin checks
 * `post_type_exists( X )`).
 */
export const POST_TYPES = [
	'tour',
	'accommodation',
	'destination',
	'review',
	'special',
	'team',
	'post',
	'page',
];

/**
 * @param {string} value Key or class fragment.
 * @return {string} Lower-case with hyphens as underscores, for comparison.
 */
export function normalise( value ) {
	return String( value || '' )
		.toLowerCase()
		.replace( /-/g, '_' );
}

/**
 * Does this block fall under TO's wrapper filter at all?
 *
 * @param {Object} block Parsed block.
 * @return {Object|null} `{ className, match, key }` or null.
 */
export function wrapperOf( block ) {
	if ( ! [ 'core/group', 'core/paragraph' ].includes( block.name ) ) {
		return null;
	}

	const className = block.attrs?.className;

	if ( ! className || 'string' !== typeof className ) {
		return null;
	}

	const match = className.match( WRAPPER_PATTERN );

	if ( ! match ) {
		return null;
	}

	// PHP: str_replace( [ 'facts-', 'lsx-', '-wrapper' ], '', $matches[0] ).
	const key = match[ 0 ]
		.split( 'facts-' )
		.join( '' )
		.split( 'lsx-' )
		.join( '' )
		.split( '-wrapper' )
		.join( '' );

	return { className, match: match[ 0 ], key };
}

/**
 * The plugin matches the *whole className attribute*, non-greedily from the
 * first `lsx-`/`facts-` it finds. A class such as `lsx-accommodation-info`
 * sitting before `lsx-rating-wrapper` therefore makes the match start at the
 * earlier class and swallow the space, and the derived key is
 * `accommodation-info rating` — which no field can ever satisfy.
 *
 * @param {string} key Derived wrapper key.
 * @return {boolean} True when the key is corrupted by a neighbouring class.
 */
export function classNameQuirk( key ) {
	return /\s/.test( key );
}

/**
 * Is the block itself, or any ancestor up to `stopAt`, another wrapper? Used to
 * keep a nested wrapper's own binding from satisfying its parent.
 *
 * @param {Object} block  Candidate block.
 * @param {Object} within The wrapper being checked.
 * @return {boolean} True when `block` is inside a nested wrapper of `within`.
 */
function insideNestedWrapper( block, within ) {
	for ( let node = block; node && node !== within; node = node.parent ) {
		if ( node !== block && wrapperOf( node ) ) {
			return true;
		}

		if ( node === block && wrapperOf( node ) && node !== within ) {
			return true;
		}
	}

	return false;
}

const PATTERNS = patternsBySlug();

/**
 * A block's descendants, with theme patterns EXPANDED in place.
 *
 * The templates were collapsed to `wp:pattern` references (the card and room
 * patterns hold the bindings), so a wrapper whose content is a pattern must be
 * judged by what that pattern contains. Expanded blocks get the `core/pattern`
 * block as their parent, so nested-wrapper detection still sees the chain.
 * Plugin patterns (not in patterns/) cannot be expanded and are left opaque.
 *
 * @param {Object}      block Parsed block.
 * @param {Set<string>} seen  Pattern slugs on the stack (cycle guard).
 * @return {Object[]} Descendants.
 */
function expandedDescendants( block, seen = new Set() ) {
	let children = block.children;

	if ( 'core/pattern' === block.name && block.attrs?.slug ) {
		const slug = block.attrs.slug;
		const file = PATTERNS.get( slug ) || PATTERNS.get( `ati-theme-2026/${ slug }` );

		if ( file && ! seen.has( slug ) ) {
			children = parseBlocks( markup( file ) ).blocks;
			children.forEach( ( child ) => {
				child.parent = block;
			} );
			seen = new Set( seen ).add( slug );
		}
	}

	return children.flatMap( ( child ) => [ child, ...expandedDescendants( child, seen ) ] );
}

/**
 * What a wrapper's own subtree provides.
 *
 * @param {Object} wrapper Parsed wrapper block.
 * @return {{metaKeys: string[], sources: string[], terms: string[], hasQuery: boolean}} Provisions.
 */
export function provisions( wrapper ) {
	const nodes = [ wrapper, ...expandedDescendants( wrapper ) ].filter(
		( node ) => ! insideNestedWrapper( node, wrapper )
	);

	const metaKeys = [];
	const sources = [];
	const terms = [];
	let hasQuery = false;

	for ( const node of nodes ) {
		for ( const binding of bindingsOf( node ) ) {
			sources.push( binding.source );

			if ( binding.key ) {
				metaKeys.push( normalise( binding.key ) );
			}
		}

		if ( 'core/post-terms' === node.name && node.attrs?.term ) {
			terms.push( node.attrs.term );
		}

		if ( 'core/query' === node.name || 'core/post-template' === node.name ) {
			hasQuery = true;
		}
	}

	return { metaKeys, sources, terms, hasQuery };
}

/**
 * Judge one wrapper.
 *
 * @param {Object} block Parsed block that `wrapperOf()` accepted.
 * @return {{ok: boolean, kind: string, key: string, expected: string, found: string}} Verdict.
 */
export function judge( block ) {
	const wrapper = wrapperOf( block );
	const { key } = wrapper;
	const found = provisions( block );

	const foundText =
		[
			found.metaKeys.length ? `meta/connection: ${ [ ...new Set( found.metaKeys ) ].join( ', ' ) }` : '',
			found.terms.length ? `post-terms: ${ [ ...new Set( found.terms ) ].join( ', ' ) }` : '',
			found.sources.filter( ( s ) => ! found.metaKeys.length || ! /post-(meta|connection)/.test( s ) ).length
				? `sources: ${ [ ...new Set( found.sources ) ].join( ', ' ) }`
				: '',
		]
			.filter( Boolean )
			.join( '; ' ) || 'no binding or post-terms';

	/**
	 * A concrete edit for the failure message. Prefer renaming the wrapper
	 * class to the field the row actually shows; failing that, bind the row.
	 */
	const hyphenated = ( value ) => String( value ).replace( /_/g, '-' );
	const own = [ ...new Set( found.metaKeys ) ];
	const suggestion = found.terms.length
		? `rename the class to lsx-${ hyphenated( found.terms[ 0 ] ) }-wrapper (the row shows the ${ found.terms[ 0 ] } terms)`
		: own.length === 1
			? `rename the class to lsx-${ hyphenated( own[ 0 ] ) }-wrapper (the row binds ${ own[ 0 ] })`
			: own.length > 1
				? `rename the class to match one field (${ own.join( ', ' ) }) or split the row — TO tests a single meta key named after the class`
				: `bind the content to lsx/post-meta (key ${ normalise( key ) }) or drop the lsx-${ key }-wrapper class`;

	const verdict = ( ok, kind, expected ) => ( {
		ok,
		kind,
		key,
		expected,
		found: foundText,
		suggestion,
	} );

	if ( classNameQuirk( key ) ) {
		return verdict(
			false,
			'class-quirk',
			'a single `lsx-<key>-wrapper` class; the plugin read the key as ' +
				`"${ key }" because another lsx-/facts- class precedes it in className`
		);
	}

	if ( MULTI_FIELD_WRAPPERS[ key ] ) {
		const allowed = MULTI_FIELD_WRAPPERS[ key ];
		const ok =
			found.metaKeys.some( ( k ) => allowed.map( normalise ).includes( k ) ) ||
			// Nested sub-wrappers (visa, climate, …) carry the bindings.
			expandedDescendants( block ).some( ( node ) => {
				const nested = wrapperOf( node );

				return (
					nested &&
					allowed.map( normalise ).includes( normalise( nested.key ) )
				);
			} );

		return verdict(
			ok,
			'multi-field',
			`one of: ${ allowed.join( ', ' ) } (allowlisted multi-field wrapper)`
		);
	}

	if ( 0 < key.indexOf( '-query' ) ) {
		const query = key.replace( '-query', '' );
		const subject = query.split( '-related-' )[ 0 ];
		const special = [ 'regions', 'related-regions', 'country' ].includes( query );
		/**
		 * `regions`, `related-regions` and `country` are the plugin's own
		 * hierarchy checks (has children / has a parent). Their content is
		 * either a core/query or an `lsx/post-connection` on `post_parent` /
		 * `post_children`, so either satisfies them.
		 */
		const hierarchy =
			special &&
			found.metaKeys.some( ( k ) =>
				[ 'post_parent', 'post_children' ].includes( k )
			);
		const ok =
			( special || POST_TYPES.includes( subject ) ) &&
			( found.hasQuery || hierarchy );

		return verdict(
			ok,
			'query',
			special || POST_TYPES.includes( subject )
				? 'a core/query (or post-template), or a post_parent / post_children connection, inside the wrapper'
				: `a known post type before "-related-" (got "${ subject }") — TO would render nothing`
		);
	}

	if ( TAXONOMIES.includes( key ) || TAXONOMIES.includes( normalise( key ).replace( /_/g, '-' ) ) ) {
		const ok = found.terms.some(
			( term ) => normalise( term ) === normalise( key )
		);

		return verdict(
			ok,
			'taxonomy',
			`a core/post-terms block with "term":"${ key }"`
		);
	}

	if ( KEYLESS_SOURCES[ key ] ) {
		const ok = found.sources.some( ( s ) => KEYLESS_SOURCES[ key ].includes( s ) );

		return verdict( ok, 'keyless-source', `a ${ KEYLESS_SOURCES[ key ].join( ' / ' ) } binding` );
	}

	const ok = found.metaKeys.includes( normalise( key ) );

	return verdict(
		ok,
		'meta',
		`a lsx/post-meta or lsx/post-connection binding with args.key "${ normalise( key ) }"`
	);
}
