/**
 * The route map — what the suite knows about the site before it runs.
 *
 *   STATIC_ROUTES     Paths that exist by construction (front page, CPT archives,
 *                     the three pages that carry a custom template). Each names
 *                     the theme template it exercises, which is how you tell
 *                     which of the theme's templates are actually covered.
 *   RESOLVED_ROUTES   Singles, resolved from the REST API at the start of each
 *                     run (global-setup.js) so no spec hardcodes a slug.
 *   RESOLVED_TAXONOMIES  Taxonomy archives, resolved to a term with posts.
 *   SYNTHETIC_ROUTES  Search and 404, which need no content.
 *
 * Every other published page is enumerated at run time from
 * `/wp-json/wp/v2/pages` (see `routes.pages`) and smoke-tested by
 * templates/static-pages.spec.js.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

/**
 * Template files that must each be exercised by at least one route. The
 * coverage spec asserts every file in templates/ appears here.
 */
const STATIC_ROUTES = [
	{ name: 'front page', path: '/', template: 'front-page.html', smoke: true },
	{
		name: 'blog (posts page)',
		path: '/blog/',
		template: 'index.html',
	},
	{
		name: 'tour archive',
		path: '/tours/',
		template: 'archive-tour.html',
		smoke: true,
		results: true,
	},
	{
		name: 'destination archive',
		path: '/destinations/',
		template: 'archive-destination.html',
		results: true,
	},
	{
		name: 'accommodation archive',
		path: '/accommodation/',
		template: 'archive-accommodation.html',
		results: true,
	},
	{
		name: 'review archive',
		path: '/reviews/',
		template: 'archive-review.html',
		results: true,
	},
	{
		name: 'special archive',
		path: '/specials/',
		template: 'archive-special.html',
		results: true,
	},
	{
		name: 'team archive',
		path: '/team/',
		template: 'archive-team.html',
		results: true,
	},
	{
		name: 'our story (page-our-story)',
		path: '/our-story/',
		template: 'page-our-story.html',
	},
	{
		name: 'impact (page-impact)',
		path: '/impact/',
		template: 'page-impact.html',
	},
	{
		name: 'jobs (page-no-title)',
		path: '/jobs/',
		template: 'page-no-title.html',
	},
];

/**
 * CPT archive bases that redirect site-wide, by design. A 301 here is
 * expected, not a failure; a 200 or a 404 is a change worth knowing about.
 */
const REDIRECTING_ARCHIVES = [ '/tour/', '/destination/' ];

/**
 * Singles resolved from the REST API.
 *
 * `restBase` is the collection endpoint; `query` narrows it (a country is a
 * top-level destination, a region has a parent). `optional` entries skip rather
 * than fail when an environment has no such content (local Studio is stale).
 */
const RESOLVED_ROUTES = [
	{
		key: 'tour',
		name: 'single tour',
		restBase: 'tour',
		template: 'single-tour.html',
		smoke: true,
	},
	{
		key: 'accommodation',
		name: 'single accommodation',
		restBase: 'accommodation',
		template: 'single-accommodation.html',
		optional: true,
	},
	{
		key: 'country',
		name: 'single country',
		restBase: 'destination',
		query: 'parent=0',
		template: 'single-country.html',
		optional: true,
	},
	{
		key: 'region',
		name: 'single region',
		restBase: 'destination',
		query: 'parent_exclude=0',
		template: 'single-region.html',
		optional: true,
	},
	{
		key: 'review',
		name: 'single review',
		restBase: 'review',
		template: 'single-review.html',
		optional: true,
	},
	{
		key: 'special',
		name: 'single special',
		restBase: 'special',
		template: 'single-special.html',
		optional: true,
	},
	{
		key: 'team',
		name: 'single team member',
		restBase: 'team',
		template: 'single-team.html',
		optional: true,
	},
	{
		key: 'post',
		name: 'single post',
		restBase: 'posts',
		template: 'single.html',
		optional: true,
	},
];

/**
 * Taxonomy archives, resolved to the term with the most posts (an empty term
 * renders the "nothing found" branch, which is not the path worth covering).
 */
const RESOLVED_TAXONOMIES = [
	{
		key: 'travel-style',
		name: 'travel style archive',
		restBase: 'travel-style',
		template: 'taxonomy-travel-style.html',
		optional: true,
	},
	{
		key: 'accommodation-type',
		name: 'accommodation type archive',
		restBase: 'accommodation-type',
		template: 'taxonomy-accommodation-type.html',
		optional: true,
	},
	{
		key: 'accommodation-brand',
		name: 'accommodation brand archive',
		restBase: 'accommodation-brand',
		template: 'taxonomy-accommodation-brand.html',
		optional: true,
	},
	{
		key: 'category',
		name: 'category archive',
		restBase: 'categories',
		template: 'category.html',
		optional: true,
	},
	{
		key: 'post_tag',
		name: 'tag archive',
		restBase: 'tags',
		template: 'tag.html',
		optional: true,
	},
];

/**
 * Routes that exercise a template without needing any content.
 */
const SYNTHETIC_ROUTES = [
	{ name: 'search results', path: '/?s=safari', template: 'search.html' },
	{
		name: 'empty search results',
		path: '/?s=zzzznotarealquery',
		template: 'search.html',
	},
	{
		name: '404',
		path: '/this-page-does-not-exist-ati-e2e/',
		template: '404.html',
		expectStatus: 404,
	},
];

/**
 * Templates reached some other way than the maps above: `page.html` is the
 * default for every plain static page, and `archive.html` / `single.html` are
 * the generic fallbacks.
 */
const IMPLICIT_TEMPLATES = {
	'page.html': 'every plain static page (routes.pages)',
	'single.html': 'single blog post (RESOLVED_ROUTES.post)',
	'archive.html': 'generic archive fallback (author/date archives)',
	'index.html': '/blog/ (posts page)',
};

module.exports = {
	STATIC_ROUTES,
	REDIRECTING_ARCHIVES,
	RESOLVED_ROUTES,
	RESOLVED_TAXONOMIES,
	SYNTHETIC_ROUTES,
	IMPLICIT_TEMPLATES,
};
