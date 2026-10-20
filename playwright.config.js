/**
 * Playwright configuration — ATI Holidays 2026 block theme.
 *
 * Target selection
 * ----------------
 * `WP_BASE_URL` chooses the environment (from `.env` at the theme root, see
 * `.env.example`). It defaults to the dev site, the only environment with real
 * migrated content. Local Studio (http://localhost:8900) is supported but its
 * database is stale and it runs Tour Operator 2.1.1 (dev runs 2.2), so do not
 * rely on it for anything content- or TO-version-dependent.
 *
 *   npm run test:e2e                                    # dev (default)
 *   WP_BASE_URL=http://localhost:8900 npm run test:e2e  # local Studio
 *
 * READ-ONLY. The suite only issues GETs against the target. `fixtures/base.js`
 * additionally intercepts and refuses any non-GET request to the target origin,
 * so a form submit cannot reach the server even by mistake.
 *
 * Never point this at ati-holidays.com. The one deliberate exception is the
 * opt-in `parity` project, which reads a small sample of live pages through
 * `utils/live.js` (GET only, serial, cached, polite) and never uses production
 * as `baseURL`.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const { defineConfig, devices } = require( '@playwright/test' );
const {
	loadEnv,
	hostOf,
	assertSafeTarget,
} = require( './tests/e2e/utils/env.js' );

loadEnv();

const baseURL =
	process.env.WP_BASE_URL || 'https://ati-holidays.lightspeedwp.dev';

assertSafeTarget( baseURL );

const baseHost = hostOf( baseURL );
const isLocal = /^(.+\.local|localhost|127\.0\.0\.1)$/i.test( baseHost );

/**
 * Opt-in projects. `wide` costs runtime, `parity` costs requests against the
 * client's production site, so neither runs unless asked for.
 */
const runWide = 'true' === process.env.ATI_RUN_WIDE;
const runParity = 'true' === process.env.ATI_RUN_PARITY;

/**
 * Functional specs, run at every breakpoint that opts in with `@responsive`.
 */
const FUNCTIONAL = [
	'templates/**/*.spec.js',
	'parts/**/*.spec.js',
	'forms/**/*.spec.js',
	'layout/**/*.spec.js',
];

/**
 * Chromium over HTTP/2, not HTTP/3. Dev sits behind Cloudflare, which
 * advertises `h3`; Chromium takes it up and a run can log
 * `net::ERR_QUIC_PROTOCOL_ERROR` transport failures that say nothing about the
 * theme. Chromium-only: Firefox and WebKit do not accept the flag.
 */
const chromium = { launchOptions: { args: [ '--disable-quic' ] } };
const chrome = { ...devices[ 'Desktop Chrome' ], ...chromium };

module.exports = defineConfig( {
	testDir: './tests/e2e',

	/**
	 * Route resolution. Singles and taxonomy archives need a real permalink and
	 * hardcoded slugs rot, so global setup resolves URLs from the REST API and
	 * caches them for the run (`.resolved-routes.json`, gitignored).
	 */
	globalSetup: require.resolve( './tests/e2e/global-setup.js' ),

	outputDir: './tests/e2e/test-results',

	timeout: 60 * 1000,
	expect: { timeout: 10 * 1000 },

	/**
	 * Read-only GETs against a shared server carry no fixture state, so they
	 * parallelise. Workers are capped to stay polite to dev (the client is
	 * reviewing it) — never more than four.
	 */
	fullyParallel: true,
	workers: process.env.CI || isLocal ? 2 : 4,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,

	reporter: [
		[
			'html',
			{ outputFolder: './tests/e2e/playwright-report', open: 'never' },
		],
		[ 'list' ],
		...( runParity
			? [ [ './tests/e2e/reporters/parity-report.js' ] ]
			: [] ),
		...( process.env.CI ? [ [ 'github' ] ] : [] ),
	],

	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'off',
		navigationTimeout: 45 * 1000,
		actionTimeout: 10 * 1000,
		/**
		 * No `extraHTTPHeaders`, deliberately: Playwright applies them to every
		 * request the page makes, including cross-origin ones, which breaks CORS
		 * preflight on third-party embeds and surfaces as console errors.
		 */
	},

	projects: [
		{
			name: 'desktop',
			testMatch: FUNCTIONAL,
			use: { ...chrome, viewport: { width: 1280, height: 800 } },
		},

		/**
		 * Responsive adaptations: layouts adapt without breaking. Specs opt in
		 * with `@responsive` in the title.
		 */
		{
			name: 'tablet',
			testMatch: FUNCTIONAL,
			grep: /@responsive/,
			use: {
				...chrome,
				viewport: { width: 768, height: 1024 },
				isMobile: false,
			},
		},
		{
			name: 'mobile',
			testMatch: FUNCTIONAL,
			grep: /@responsive/,
			use: {
				...devices[ 'Pixel 7' ],
				...chromium,
				viewport: { width: 375, height: 667 },
			},
		},
		...( runWide
			? [
					{
						name: 'wide',
						testMatch: FUNCTIONAL,
						grep: /@responsive/,
						use: { ...chrome, viewport: { width: 1920, height: 1080 } },
					},
				]
			: [] ),

		/**
		 * Engine coverage. `@smoke` is the subset where a rendering-engine
		 * difference would plausibly show — not a second full pass.
		 */
		{
			name: 'firefox',
			testMatch: FUNCTIONAL,
			grep: /@smoke/,
			use: {
				...devices[ 'Desktop Firefox' ],
				viewport: { width: 1280, height: 800 },
			},
		},
		{
			name: 'webkit',
			testMatch: FUNCTIONAL,
			grep: /@smoke/,
			use: {
				...devices[ 'Desktop Safari' ],
				viewport: { width: 1280, height: 800 },
			},
		},

		/**
		 * The responsive contract: horizontal overflow at 375/768/1280 (+1920
		 * when `wide` is on) across the static pages, touch targets, text
		 * scaling. Drives its own viewports.
		 */
		{
			name: 'responsive',
			testMatch: 'responsive/**/*.spec.js',
			use: { ...chrome },
		},

		/**
		 * Axe walks the whole DOM in-page; heavy archives overrun the global
		 * timeout.
		 */
		{
			name: 'a11y',
			testMatch: 'a11y/**/*.spec.js',
			timeout: 120 * 1000,
			use: { ...chrome, viewport: { width: 1280, height: 800 } },
		},

		/**
		 * Read-only REST checks in edit context (template/part database
		 * overrides). Tests skip when WP_REST_AUTH is unset. The header is read
		 * inside the spec, never put in this config,
		 * so it cannot leak into a report or trace.
		 */
		{
			name: 'editor',
			testMatch: 'editor/**/*.spec.js',
			use: { trace: 'off', screenshot: 'off' },
		},

		/**
		 * Dev-vs-live parity, on a sample. Opt-in with ATI_RUN_PARITY=true
		 * because it reads the client's production site: GET only, one worker,
		 * paused between requests, cached on disk between runs.
		 */
		...( runParity
			? [
					{
						name: 'parity',
						testMatch: 'parity/**/*.spec.js',
						fullyParallel: false,
						workers: 1,
						timeout: 180 * 1000,
						use: { ...chrome, viewport: { width: 1280, height: 800 } },
					},
				]
			: [] ),
	],
} );
