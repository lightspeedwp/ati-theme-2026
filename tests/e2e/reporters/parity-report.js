/**
 * Playwright reporter: turns the `parity.json` attachments of the parity specs
 * into a readable report, grouped by type → page → field.
 *
 * Writes, to tests/e2e/test-results/:
 *   parity-report.md    scan-friendly summary (also printed in short to stderr)
 *   parity-report.html  the same, styled
 *   parity-report.json  raw records
 *   parity-visual/      live and dev screenshots (visual-parity.spec.js), shown
 *                       side by side at the end of parity-report.html
 *
 * It only reads what the tests attached; it makes no requests.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );

const OUT = path.join( __dirname, '..', 'test-results' );
const ORDER = [
	'MISSING_ON_DEV',
	'KNOWN_PENDING',
	'INTENTIONAL',
	'CONTENT_DRIFT',
	'STALE',
	'EXTRA_ON_DEV',
];
const TITLE = {
	MISSING_ON_DEV: 'Missing on dev (live has it) — likely theme/binding bug',
	KNOWN_PENDING: 'Known pending (fix in working tree, not deployed)',
	INTENTIONAL:
		'Intentional (a design decision, see fixtures/intentional-differences.js)',
	CONTENT_DRIFT: 'Content drift (probably stale dev content)',
	STALE: 'Stale (live 404/redirect or live-only item)',
	EXTRA_ON_DEV: 'Extra on dev (informational)',
};
const ICON = {
	MISSING_ON_DEV: '✗',
	KNOWN_PENDING: '⏳',
	INTENTIONAL: '◇',
	CONTENT_DRIFT: '≈',
	STALE: '·',
	EXTRA_ON_DEV: '+',
};

/**
 * @param {string} text Raw text.
 * @return {string} HTML-escaped.
 */
function esc( text ) {
	return String( text ).replace(
		/[&<>"]/g,
		( c ) =>
			( { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } )[ c ]
	);
}

class ParityReport {
	constructor() {
		this.records = new Map();
		this.visuals = [];
	}

	/**
	 * @param {Object} test   Test case.
	 * @param {Object} result Test result.
	 */
	onTestEnd( test, result ) {
		const visual = {};

		for ( const attachment of result.attachments ) {
			if (
				attachment.body &&
				[ 'visual.json', 'visual-dev.png', 'visual-live.png' ].includes(
					attachment.name
				)
			) {
				visual[ attachment.name ] = attachment.body;
			}
		}

		if (
			visual[ 'visual.json' ] &&
			visual[ 'visual-dev.png' ] &&
			visual[ 'visual-live.png' ]
		) {
			this.visuals.push( {
				...JSON.parse( visual[ 'visual.json' ].toString() ),
				dev: visual[ 'visual-dev.png' ],
				live: visual[ 'visual-live.png' ],
			} );
		}

		for ( const attachment of result.attachments ) {
			if ( 'parity.json' !== attachment.name || ! attachment.body ) {
				continue;
			}

			try {
				const record = JSON.parse( attachment.body.toString() );
				const key = `${ record.type }|${ record.path }`;
				const existing = this.records.get( key );

				// Two specs may attach the same page (content + card parity):
				// merge their diffs, de-duplicated.
				if ( existing ) {
					const seen = new Set(
						existing.diffs.map(
							( d ) => `${ d.cls }|${ d.field }|${ d.detail }`
						)
					);
					record.diffs.forEach( ( d ) => {
						if (
							! seen.has(
								`${ d.cls }|${ d.field }|${ d.detail }`
							)
						) {
							existing.diffs.push( d );
						}
					} );
				} else {
					this.records.set( key, record );
				}
			} catch {
				// ignore a malformed attachment
			}
		}
	}

	onEnd() {
		const records = [ ...this.records.values() ];

		if ( ! records.length && ! this.visuals.length ) {
			return;
		}

		fs.mkdirSync( OUT, { recursive: true } );

		const totals = Object.fromEntries( ORDER.map( ( c ) => [ c, 0 ] ) );
		const byField = new Map();

		for ( const record of records ) {
			for ( const diff of record.diffs ) {
				totals[ diff.cls ]++;

				if (
					'MISSING_ON_DEV' === diff.cls ||
					'KNOWN_PENDING' === diff.cls
				) {
					const key = `${ diff.cls }|${ diff.field }`;
					const entry = byField.get( key ) || {
						cls: diff.cls,
						field: diff.field,
						label: diff.label,
						pages: [],
					};
					entry.pages.push( `${ record.type } ${ record.path }` );
					byField.set( key, entry );
				}
			}
		}

		const types = [ ...new Set( records.map( ( r ) => r.type ) ) ];
		const md = [];

		md.push( '# Dev vs live content parity', '' );
		md.push(
			`Generated ${ new Date().toISOString() } — ${ records.length } page pairs.`,
			''
		);
		md.push( '| Class | Differences |', '| --- | ---: |' );
		ORDER.forEach( ( cls ) =>
			md.push(
				`| ${ ICON[ cls ] } ${ TITLE[ cls ] } | ${ totals[ cls ] } |`
			)
		);
		md.push( '' );

		md.push( '## Missing on dev, by field (the pattern view)', '' );
		const missingFields = [ ...byField.values() ].filter(
			( e ) => 'MISSING_ON_DEV' === e.cls
		);

		if ( missingFields.length ) {
			md.push( '| Field | Pages | Example |', '| --- | ---: | --- |' );
			missingFields
				.sort( ( a, b ) => b.pages.length - a.pages.length )
				.forEach( ( e ) =>
					md.push(
						`| \`${ e.field }\` — ${ e.label } | ${ e.pages.length } | ${ e.pages[ 0 ] } |`
					)
				);
		} else {
			md.push( '_None._' );
		}

		md.push( '' );

		for ( const type of types ) {
			md.push( `## ${ type }`, '' );

			for ( const record of records.filter( ( r ) => r.type === type ) ) {
				const worst = ORDER.find( ( cls ) =>
					record.diffs.some( ( d ) => d.cls === cls )
				);
				const state = worst
					? `${ ICON[ worst ] } ${ worst }`
					: '✓ matches';

				md.push(
					`### ${ record.path } — ${ state }` +
						`${ null !== record.similarity ? ` · body similarity ${ record.similarity }%` : '' }` +
						` · dev ${ record.devStatus } / live ${ record.liveStatus }`
				);

				if (
					record.liveFinalPath &&
					record.liveFinalPath !== record.path &&
					200 === record.liveStatus
				) {
					md.push( `_live redirects to ${ record.liveFinalPath }_` );
				}

				for ( const cls of ORDER ) {
					const diffs = record.diffs.filter( ( d ) => d.cls === cls );

					diffs.forEach( ( d ) =>
						md.push(
							`- ${ ICON[ cls ] } **${ cls }** \`${ d.field }\` ${ d.label }` +
								( d.live || d.dev
									? ` — live: ${ d.live || '∅' } · dev: ${ d.dev || '∅' }`
									: '' ) +
								( d.detail ? ` — ${ d.detail }` : '' )
						)
					);
				}

				md.push( '' );
			}
		}

		fs.writeFileSync(
			path.join( OUT, 'parity-report.md' ),
			md.join( '\n' )
		);
		fs.writeFileSync(
			path.join( OUT, 'parity-report.json' ),
			JSON.stringify( records, null, '\t' )
		);

		const html = [
			'<!doctype html><meta charset="utf-8"><title>Dev vs live parity</title>',
			'<style>body{font:14px/1.45 system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem}h2{margin-top:2rem;border-bottom:1px solid #ddd}h3{font-size:1rem;margin:1.2rem 0 .3rem}li{margin:.15rem 0}code{background:#f3f3f3;padding:0 .25em}.MISSING_ON_DEV{color:#b00020}.KNOWN_PENDING{color:#8a6d00}.CONTENT_DRIFT{color:#555}.STALE{color:#777}.EXTRA_ON_DEV{color:#0a6}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.25rem .6rem;text-align:left}</style>',
			'<h1>Dev vs live content parity</h1>',
			`<p>${ records.length } page pairs · generated ${ new Date().toISOString() }</p>`,
			'<table><tr><th>Class</th><th>Differences</th></tr>',
			...ORDER.map(
				( cls ) =>
					`<tr class="${ cls }"><td>${ ICON[ cls ] } ${ esc( TITLE[ cls ] ) }</td><td>${ totals[ cls ] }</td></tr>`
			),
			'</table>',
			'<h2>Missing on dev, by field</h2>',
			missingFields.length
				? '<table><tr><th>Field</th><th>Pages</th><th>Example</th></tr>' +
					missingFields
						.sort( ( a, b ) => b.pages.length - a.pages.length )
						.map(
							( e ) =>
								`<tr><td><code>${ esc( e.field ) }</code> ${ esc( e.label ) }</td><td>${ e.pages.length }</td><td>${ esc( e.pages[ 0 ] ) }</td></tr>`
						)
						.join( '' ) +
					'</table>'
				: '<p><em>None.</em></p>',
		];

		for ( const type of types ) {
			html.push( `<h2>${ esc( type ) }</h2>` );

			for ( const record of records.filter( ( r ) => r.type === type ) ) {
				const worst = ORDER.find( ( cls ) =>
					record.diffs.some( ( d ) => d.cls === cls )
				);

				html.push(
					`<h3><span class="${ worst || '' }">${ worst ? ICON[ worst ] : '✓' }</span> ${ esc( record.path ) }` +
						` <small>dev ${ record.devStatus } / live ${ record.liveStatus }${ null !== record.similarity ? ` · body ${ record.similarity }%` : '' }</small></h3><ul>`
				);

				for ( const cls of ORDER ) {
					record.diffs
						.filter( ( d ) => d.cls === cls )
						.forEach( ( d ) =>
							html.push(
								`<li class="${ cls }">${ ICON[ cls ] } <b>${ cls }</b> <code>${ esc( d.field ) }</code> ${ esc( d.label ) }` +
									( d.live || d.dev
										? ` — live: ${ esc( d.live || '∅' ) } · dev: ${ esc( d.dev || '∅' ) }`
										: '' ) +
									( d.detail
										? ` — ${ esc( d.detail ) }`
										: '' ) +
									'</li>'
							)
						);
				}

				html.push( '</ul>' );
			}
		}

		if ( this.visuals.length ) {
			const dir = path.join( OUT, 'parity-visual' );

			fs.mkdirSync( dir, { recursive: true } );
			html.push(
				'<h2 id="side-by-side">Side by side</h2>',
				'<p>Live on the left, dev on the right, one page per template. The redesign changes the look on purpose: look for what is <em>missing</em> — a section, an image, a box that renders empty.</p>',
				'<style>.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start;margin-bottom:2.5rem}.pair figure{margin:0}.pair img{width:100%;border:1px solid #ddd}.pair figcaption{font-weight:600;margin-bottom:.3rem}</style>'
			);

			for ( const shot of this.visuals ) {
				const slug = `${ shot.type }-${ shot.path }`
					.replace( /[^a-z0-9]+/gi, '-' )
					.replace( /^-|-$/g, '' );

				fs.writeFileSync(
					path.join( dir, `${ slug }-live.png` ),
					shot.live
				);
				fs.writeFileSync(
					path.join( dir, `${ slug }-dev.png` ),
					shot.dev
				);
				html.push(
					`<h3>${ esc( shot.type ) }: ${ esc( shot.path ) }</h3><div class="pair">` +
						`<figure><figcaption>Live</figcaption><a href="parity-visual/${ slug }-live.png"><img loading="lazy" src="parity-visual/${ slug }-live.png" alt="Live ${ esc( shot.path ) }"></a></figure>` +
						`<figure><figcaption>Dev</figcaption><a href="parity-visual/${ slug }-dev.png"><img loading="lazy" src="parity-visual/${ slug }-dev.png" alt="Dev ${ esc( shot.path ) }"></a></figure></div>`
				);
			}

			md.push(
				'## Side by side',
				'',
				`${ this.visuals.length } page pairs, screenshots in parity-visual/ — open parity-report.html to compare.`,
				''
			);
			fs.writeFileSync(
				path.join( OUT, 'parity-report.md' ),
				md.join( '\n' )
			);
		}

		fs.writeFileSync(
			path.join( OUT, 'parity-report.html' ),
			html.join( '\n' )
		);

		process.stderr.write(
			`\nParity report: ${ path.join( OUT, 'parity-report.md' ) }\n` +
				`  ${ ORDER.map( ( cls ) => `${ cls } ${ totals[ cls ] }` ).join( ' · ' ) }\n`
		);
	}
}

module.exports = ParityReport;
