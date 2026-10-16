/**
 * Advisory findings: reported, never failing.
 *
 * Some rules are worth surfacing without turning the run red — a convention the
 * team has not decided to enforce, or a defect that is already tracked. They go
 * to stderr with a stable prefix so a human (or `grep ADVISORY`) can find them,
 * and the test that emits them passes.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

/**
 * @param {string}   rule  Short rule name.
 * @param {string}   file  File the findings are about.
 * @param {string[]} lines One finding per entry.
 */
export function advise( rule, file, lines ) {
	if ( ! lines.length ) {
		return;
	}

	process.stderr.write(
		`\nADVISORY [${ rule }] ${ file }\n  ${ lines.join( '\n  ' ) }\n`
	);
}
