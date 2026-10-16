/**
 * Assertion helpers that fail with a readable message.
 *
 * `expect( list ).toEqual( [] )` prints a diff of the whole list after the
 * message, which doubles every line of a long finding. These throw the message
 * alone.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

/**
 * @param {string[]} findings Offending entries; empty means pass.
 * @param {string}   message  Lead-in for the failure.
 */
export function expectNone( findings, message ) {
	if ( findings.length ) {
		throw new Error( `${ message }\n  ${ findings.join( '\n  ' ) }` );
	}
}
