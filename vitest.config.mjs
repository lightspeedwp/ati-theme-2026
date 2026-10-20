/**
 * Vitest — static theme contract tests (no WordPress, no browser).
 *
 *   npm run test:unit
 *
 * Collection is narrowed to tests/unit so the Playwright specs in tests/e2e
 * (also named *.spec.js) are never picked up.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		environment: 'node',
		include: [ 'tests/unit/**/*.test.js' ],
		exclude: [ 'node_modules/**', 'tests/e2e/**' ],
		testTimeout: 30000,
		passWithNoTests: true,
	},
} );
