/**
 * Shared plumbing for the parity specs: which pages to compare, how to fetch
 * the dev side, and how to run one pair through the extractor and comparer.
 *
 * Fetching is plain GET through Playwright's request API on both sides (no page
 * is navigated, no script runs); the HTML is parsed with DOMParser in a blank
 * page, so what is compared is the server-rendered content on each site.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { extractPage } = require( './extract.js' );
const { compare, tally } = require( './compare.js' );
const { REDIRECTING_ARCHIVES } = require( '../fixtures/routes.js' );
const { devHeaders } = require( './helpers.js' );

/**
 * Pages per content type. `ATI_PARITY_SAMPLE` (default 4) — 3–5 is the
 * intended range; every extra page is two more requests, one of them against
 * production.
 */
const SAMPLE = Math.max( 1, parseInt( process.env.ATI_PARITY_SAMPLE || '4', 10 ) );

/**
 * Pinned pages always included first (the ones the client and the team have
 * been looking at). Missing ones are skipped silently by dev's 404 → they fail
 * loudly in the test instead, which is the point of pinning.
 */
const PINNED = {
	review: [ '/review/rachel-nigel/' ],
	accommodation: [ '/accommodation/camp-silwane/' ],
	tour: [ '/tour/moments-in-zimbabwe-10-nights/' ],
};

/**
 * @param {Object} routes Resolved routes (from `.resolved-routes.json`).
 * @return {{type: string, name: string, path: string, listing: boolean}[]} Pages to compare.
 */
function buildPairs( routes ) {
	const pairs = [];
	const seen = new Set();
	const push = ( type, path, listing = false ) => {
		if ( path && ! seen.has( path ) ) {
			seen.add( path );
			pairs.push( { type, name: `${ type }: ${ path }`, path, listing } );
		}
	};

	push( 'home', '/' );

	for ( const archive of [ '/tours/', '/destinations/', '/accommodation/', '/reviews/', '/specials/', '/team/', '/blog/' ] ) {
		if ( ! REDIRECTING_ARCHIVES.includes( archive ) ) {
			push( 'archive', archive, true );
		}
	}

	const typeOf = { country: 'destination', region: 'destination' };

	for ( const key of [ 'tour', 'accommodation', 'country', 'region', 'review', 'special', 'team', 'post' ] ) {
		const type = typeOf[ key ] || key;
		const list = [ ...( PINNED[ key ] || [] ), ...( routes.samples[ key ] || [] ) ];

		list.slice( 0, SAMPLE + ( PINNED[ key ] || [] ).length ).forEach( ( path ) => push( type, path ) );
	}

	for ( const key of [ 'travel-style', 'accommodation-type', 'accommodation-brand' ] ) {
		push( 'term', routes.terms[ key ], true );
	}

	// Every published static page, the home page's own entry excluded.
	for ( const page of routes.pages ) {
		push( 'page', page.path );
	}

	return pairs;
}

const REST_BASES = {
	tour: 'tour',
	accommodation: 'accommodation',
	destination: 'destination',
	review: 'review',
	special: 'special',
	team: 'team',
	post: 'posts',
};

/**
 * What exists on dev, by post type — so a live-only related item can be told
 * apart (new on live: stale) from one that exists on dev but is not shown there
 * (a connection or binding problem).
 *
 * @param {import('@playwright/test').APIRequestContext} request Request context bound to dev.
 * @return {Promise<Object>} `{ [type]: { slugs: Set, ids: Set } }`.
 */
async function loadDevIndex( request ) {
	const index = {};

	for ( const [ type, base ] of Object.entries( REST_BASES ) ) {
		index[ type ] = { slugs: new Set(), ids: new Set() };

		for ( let page = 1; page <= 8; page++ ) {
			const response = await request.get(
				`/wp-json/wp/v2/${ base }?per_page=100&page=${ page }&_fields=id,slug`
			);

			if ( ! response.ok() ) {
				break;
			}

			const batch = await response.json();

			batch.forEach( ( item ) => {
				index[ type ].slugs.add( item.slug );
				index[ type ].ids.add( String( item.id ) );
			} );

			if ( batch.length < 100 ) {
				break;
			}
		}
	}

	return index;
}

/**
 * Compare one path on dev and live.
 *
 * @param {Object} args Arguments.
 * @param {import('@playwright/test').Page}              args.page     A blank page to parse HTML in.
 * @param {import('@playwright/test').APIRequestContext} args.request  Request context bound to dev.
 * @param {Object}                                       args.live     LiveClient.
 * @param {Object}                                       args.devIndex Result of loadDevIndex().
 * @param {Object}                                       args.pair     One entry of buildPairs().
 * @return {Promise<Object>} The record attached to the test and read by the reporter.
 */
async function comparePair( { page, request, live, devIndex, pair } ) {
	const record = {
		type: pair.type,
		path: pair.path,
		listing: pair.listing,
		devStatus: 0,
		liveStatus: 0,
		liveFinalPath: '',
		diffs: [],
		counts: {},
		similarity: null,
	};

	const dev = await request.get( pair.path, {
		headers: devHeaders(),
	} );
	record.devStatus = dev.status();

	const liveResult = await live.get( pair.path );
	record.liveStatus = liveResult.status;
	record.liveFinalPath = liveResult.finalPath;

	if ( 200 !== record.devStatus ) {
		record.diffs.push( {
			cls: 'MISSING_ON_DEV',
			field: 'page',
			label: 'Page',
			live: String( record.liveStatus ),
			dev: String( record.devStatus ),
			detail: `dev answered ${ record.devStatus } for a URL dev itself published`,
		} );
	} else if ( 200 !== liveResult.status ) {
		record.diffs.push( {
			cls: 'STALE',
			field: 'page',
			label: 'Page',
			live: String( liveResult.status ),
			dev: '200',
			detail: 'dev URL does not exist on live (new content on dev, or slug changed on live)',
		} );
	} else {
		if ( liveResult.redirected ) {
			record.diffs.push( {
				cls: 'STALE',
				field: 'redirect',
				label: 'Live redirects this URL',
				live: liveResult.finalPath,
				dev: pair.path,
				detail: 'slug differs on live; content compared at the redirect target',
			} );
		}

		await page.goto( 'about:blank' );

		const liveData = await page.evaluate( extractPage, { html: liveResult.html, side: 'live' } );
		const devData = await page.evaluate( extractPage, { html: await dev.text(), side: 'dev' } );

		const { diffs, similarity } = compare( {
			type: pair.type,
			live: liveData,
			dev: devData,
			devIndex,
			listing: pair.listing,
		} );

		record.diffs.push( ...diffs );
		record.similarity = Math.round( similarity * 100 );
		record.summary = {
			live: { cards: liveData.cards.length, paragraphs: liveData.paragraphs.length, days: liveData.itinerary.days.length, units: liveData.units.count, gallery: liveData.gallery.count },
			dev: { cards: devData.cards.length, paragraphs: devData.paragraphs.length, days: devData.itinerary.days.length, units: devData.units.count, gallery: devData.gallery.count },
		};
	}

	record.counts = tally( record.diffs );

	return record;
}

module.exports = { buildPairs, loadDevIndex, comparePair, SAMPLE };
