/**
 * Global setup — resolve live permalinks before the run, read-only.
 *
 * One REST sweep (GETs against the target) caches, to `.resolved-routes.json`:
 *   - per content type: the newest item plus an evenly spread sample
 *     (`ATI_SAMPLE`, default 5) so specs see old migrated content as well as new
 *   - per taxonomy: the fullest term
 *   - every published page, with its template
 *
 * If a type has no content the entry is `null` and the specs that need it skip
 * with a stated reason, rather than failing.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { request } = require( '@playwright/test' );

const {
	RESOLVED_ROUTES,
	RESOLVED_TAXONOMIES,
} = require( './fixtures/routes.js' );

const CACHE_PATH = path.join( __dirname, '.resolved-routes.json' );
const SAMPLE = Math.max( 1, parseInt( process.env.ATI_SAMPLE || '5', 10 ) );

/**
 * @param {string} link    Absolute permalink.
 * @param {string} baseURL Site origin.
 * @return {string} Path (with query) and a leading slash.
 */
function toPath( link, baseURL ) {
	try {
		const url = new URL( link, baseURL );
		return url.pathname + url.search;
	} catch {
		return link;
	}
}

/**
 * Pick `count` items spread evenly across a list, always including the first.
 *
 * @param {Array}  items Items.
 * @param {number} count How many.
 * @return {Array} Picked items.
 */
function spread( items, count ) {
	if ( items.length <= count ) {
		return items;
	}

	const picked = [];

	for ( let i = 0; i < count; i++ ) {
		picked.push( items[ Math.floor( ( i * items.length ) / count ) ] );
	}

	return picked;
}

/**
 * @param {import('@playwright/test').APIRequestContext} api     Request context.
 * @param {string}                                       url     REST path.
 * @return {Promise<Array>} All items, following pagination.
 */
async function getAll( api, url ) {
	const items = [];

	for ( let page = 1; page <= 10; page++ ) {
		const response = await api.get(
			`${ url }${ url.includes( '?' ) ? '&' : '?' }per_page=100&page=${ page }`
		);

		if ( ! response.ok() ) {
			break;
		}

		const batch = await response.json();

		if ( ! Array.isArray( batch ) || 0 === batch.length ) {
			break;
		}

		items.push( ...batch );

		if ( batch.length < 100 ) {
			break;
		}
	}

	return items;
}

/**
 * @param {import('@playwright/test').FullConfig} config Playwright config.
 */
module.exports = async function globalSetup( config ) {
	const baseURL =
		config.projects[ 0 ]?.use?.baseURL ||
		process.env.WP_BASE_URL ||
		'https://ati-holidays.lightspeedwp.dev';

	const api = await request.newContext( { baseURL, timeout: 45 * 1000 } );

	const probe = await api.get( '/wp-json/' ).catch( () => null );

	if ( ! probe || ! probe.ok() ) {
		await api.dispose();
		throw new Error(
			`Cannot reach ${ baseURL }. Is the target up?\n` +
				'  dev:   https://ati-holidays.lightspeedwp.dev (default)\n' +
				'  local: start the Studio site, then WP_BASE_URL=http://localhost:8900'
		);
	}

	const resolved = {
		baseURL,
		posts: {},
		samples: {},
		terms: {},
		pages: [],
		resolvedAt: new Date().toISOString(),
	};
	const missing = [];
	const requiredMissing = [];

	try {
		await Promise.all(
			RESOLVED_ROUTES.map( async ( route ) => {
				const items = await getAll(
					api,
					`/wp-json/wp/v2/${ route.restBase }?status=publish&orderby=date&order=desc&_fields=id,link,slug,parent${
						route.query ? `&${ route.query }` : ''
					}`
				);
				const links = items
					.filter( ( item ) => item.link )
					.map( ( item ) => toPath( item.link, baseURL ) );

				resolved.posts[ route.key ] = links[ 0 ] || null;
				resolved.samples[ route.key ] = spread( links, SAMPLE );

				if ( ! links.length ) {
					( route.optional ? missing : requiredMissing ).push(
						route.name
					);
				}
			} )
		);

		await Promise.all(
			RESOLVED_TAXONOMIES.map( async ( route ) => {
				const response = await api.get(
					`/wp-json/wp/v2/${ route.restBase }?per_page=1&orderby=count&order=desc&hide_empty=true&_fields=link,count`
				);
				const terms = response.ok() ? await response.json() : [];
				const term = Array.isArray( terms ) ? terms[ 0 ] : null;

				resolved.terms[ route.key ] =
					term?.link && 0 < term.count
						? toPath( term.link, baseURL )
						: null;

				if ( ! resolved.terms[ route.key ] ) {
					( route.optional ? missing : requiredMissing ).push(
						route.name
					);
				}
			} )
		);

		const pages = await getAll(
			api,
			'/wp-json/wp/v2/pages?status=publish&orderby=menu_order&order=asc&_fields=id,link,slug,template,parent,title'
		);

		resolved.pages = pages.map( ( page ) => ( {
			id: page.id,
			slug: page.slug,
			path: toPath( page.link, baseURL ),
			template: page.template || '',
			parent: page.parent,
			title: String( page.title?.rendered || page.slug ).replace(
				/&#0?38;|&amp;/g,
				'&'
			),
		} ) );

		if ( requiredMissing.length ) {
			throw new Error(
				`No content for required route(s): ${ requiredMissing.join(
					', '
				) } on ${ baseURL }.`
			);
		}
	} finally {
		await api.dispose();
	}

	fs.writeFileSync( CACHE_PATH, JSON.stringify( resolved, null, '\t' ) );

	process.stderr.write(
		`\n  Target:   ${ baseURL }\n` +
			`  Resolved: ${
				Object.values( resolved.posts ).filter( Boolean ).length +
				Object.values( resolved.terms ).filter( Boolean ).length
			} content routes, ${ resolved.pages.length } static pages\n` +
			( missing.length
				? `  No content: ${ missing.join( ', ' ) } — those specs will skip\n\n`
				: '\n' )
	);
};
