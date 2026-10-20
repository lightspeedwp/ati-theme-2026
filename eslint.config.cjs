/**
 * ESLint flat configuration — `npm run lint:js`.
 *
 * Starts from the `@wordpress/scripts` default (ignores, the
 * `@wordpress/eslint-plugin` recommended set, Vitest rules for `*.test.js`),
 * then makes scoped adjustments. Mirrors the config in `sd-theme-2026`.
 *
 * 1. Shipped scripts in `assets/js/**` are enqueued as-is with no build step,
 *    so the ES2015 style rules that assume a bundler are off there only.
 * 2. File headers may carry `@package` / `@subpackage`.
 * 3. Playwright specs get the plugin's `test-playwright` rules.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const globals = require( 'globals' );
const wpPlugin = require( '@wordpress/eslint-plugin' );
const wpScriptsDefault = require( '@wordpress/scripts/config/eslint.config.cjs' );

const HEADER_TAGS = [ 'package', 'subpackage' ];

module.exports = [
	{
		ignores: [
			'**/build/**',
			'**/node_modules/**',
			'**/vendor/**',
			'tests/e2e/playwright-report/**',
			'tests/e2e/test-results/**',
			'tests/e2e/blob-report/**',
		],
	},
	...wpScriptsDefault,
	{
		settings: { jsdoc: { mode: 'typescript' } },
		rules: {
			'jsdoc/check-tag-names': [ 'error', { definedTags: HEADER_TAGS } ],
			'jsdoc/empty-tags': 'off',
		},
	},
	{
		files: [ 'assets/js/**/*.js' ],
		languageOptions: {
			sourceType: 'script',
			globals: { ...globals.browser, wp: 'readonly', jQuery: 'readonly' },
		},
		rules: {
			'no-var': 'off',
			'object-shorthand': 'off',
			'prefer-const': 'off',
		},
	},
	...wpPlugin.configs[ 'test-playwright' ].map( ( config ) => ( {
		...config,
		files: [ 'tests/e2e/**/*.js', 'playwright.config.js' ],
	} ) ),
	{
		files: [ 'tests/e2e/**/*.js', 'playwright.config.js' ],
		languageOptions: {
			globals: { ...globals.node, getComputedStyle: 'readonly' },
		},
		rules: {
			'react-hooks/rules-of-hooks': 'off',
			'@wordpress/no-global-active-element': 'off',
			'playwright/no-skipped-test': 'off',
			'playwright/no-conditional-in-test': 'warn',
		},
	},
	{
		files: [ '*.config.js', '*.config.cjs', '*.config.mjs' ],
		languageOptions: { globals: globals.node },
	},
];
