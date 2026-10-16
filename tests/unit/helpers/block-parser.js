/**
 * A small, dependency-free parser for serialised block markup.
 *
 * It reads only the block *comment delimiters* (`<!-- wp:name {json} -->`,
 * `<!-- /wp:name -->`, `<!-- wp:name {json} /-->`), which is all the static
 * contract tests need: block names, attributes (including
 * `metadata.bindings` and `className`) and nesting. It does not validate the
 * saved HTML — the block editor does that, on a signed-in browser.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const DELIMITER =
	/<!--\s+(\/)?wp:([a-z][a-z0-9_-]*(?:\/[a-z][a-z0-9_-]*)?)(?:\s+(\{[\s\S]*?\}))?(?=\s*\/?-->)\s*(\/)?-->/g;

/**
 * @param {string} source Text up to an offset.
 * @param {number} offset Character offset.
 * @return {number} 1-based line number.
 */
function lineAt( source, offset ) {
	let line = 1;

	for ( let i = 0; i < offset; i++ ) {
		if ( '\n' === source[ i ] ) {
			line++;
		}
	}

	return line;
}

/**
 * Parse serialised markup into a block tree.
 *
 * @param {string} source Block markup.
 * @return {{blocks: Object[], errors: string[], all: Object[]}} Top-level blocks,
 *         structural errors (unbalanced / mismatched delimiters, bad JSON), and
 *         a flat list of every block in document order.
 */
export function parseBlocks( source ) {
	const root = { name: '#root', attrs: {}, children: [] };
	const stack = [ root ];
	const errors = [];
	const all = [];

	for ( const match of source.matchAll( DELIMITER ) ) {
		const [ , closing, rawName, rawAttrs, selfClosing ] = match;
		const name = rawName.includes( '/' ) ? rawName : `core/${ rawName }`;
		const line = lineAt( source, match.index );

		if ( closing ) {
			const top = stack[ stack.length - 1 ];

			if ( top.name !== name || stack.length === 1 ) {
				errors.push(
					`line ${ line }: closing wp:${ rawName } but ${
						stack.length === 1
							? 'nothing is open'
							: `wp:${ top.name.replace( /^core\//, '' ) } (line ${
									top.line
								}) is open`
					}`
				);

				// Recover: if the block is further up the stack, unwind to it.
				const at = stack.map( ( b ) => b.name ).lastIndexOf( name );

				if ( at > 0 ) {
					stack.length = at;
				}

				continue;
			}

			top.endLine = line;
			stack.pop();
			continue;
		}

		let attrs = {};

		if ( rawAttrs ) {
			try {
				attrs = JSON.parse( rawAttrs );
			} catch ( error ) {
				errors.push(
					`line ${ line }: wp:${ rawName } has invalid JSON attributes (${ error.message })`
				);
			}
		}

		const block = { name, attrs, children: [], line, parent: null };
		const parent = stack[ stack.length - 1 ];

		block.parent = parent === root ? null : parent;
		parent.children.push( block );
		all.push( block );

		if ( ! selfClosing ) {
			stack.push( block );
		}
	}

	for ( const open of stack.slice( 1 ) ) {
		errors.push(
			`line ${ open.line }: wp:${ open.name.replace( /^core\//, '' ) } is never closed`
		);
	}

	return { blocks: root.children, errors, all };
}

/**
 * Every descendant of a block, depth-first, excluding the block itself.
 *
 * @param {Object} block Parsed block.
 * @return {Object[]} Descendants.
 */
export function descendants( block ) {
	return block.children.flatMap( ( child ) => [
		child,
		...descendants( child ),
	] );
}

/**
 * The binding declarations on one block.
 *
 * @param {Object} block Parsed block.
 * @return {{attribute: string, source: string, key: (string|undefined)}[]} Bindings.
 */
export function bindingsOf( block ) {
	const bindings = block.attrs?.metadata?.bindings || {};

	return Object.entries( bindings )
		.filter( ( [ attribute ] ) => '__default' !== attribute )
		.map( ( [ attribute, binding ] ) => ( {
			attribute,
			source: binding?.source,
			key: binding?.args?.key,
			args: binding?.args || {},
		} ) )
		.filter( ( binding ) => binding.source );
}
