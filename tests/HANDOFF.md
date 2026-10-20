# ATI theme test suite — handoff

Written 2026-10-16; status updated 2026-10-20.

## What is done

- Static unit tests (vitest, no browser): `tests/unit/theme/*`
  - `to-wrappers.test.js` — TO `lsx-*-wrapper` / `facts-*-wrapper` vs binding agreement (expands theme patterns; honours `lsx_to_multi_field_wrappers` registered in functions.php; control tests prove it can fail).
  - `theme-json.test.js`, `references.test.js` (patterns/parts resolve, no `wp:block` refs, no hardcoded env URLs, one `<main>` per template), `patterns.test.js` (headers, `php -l`, block-comment balance, SVG fill advisory), `template-coverage.test.js`.
- Playwright e2e (`playwright.config.js`, `tests/e2e/`): templates, static pages (every REST-published page), singles, taxonomies, search/404, cards + wrappers (REST-driven), parts (header/footer/mega/mobile/modals), layout gaps, forms (client-side only), responsive, a11y (axe, baseline gate), editor (REST overrides, read-only), parity (card parity + full content parity with report).
- Safety: host allowlist, production refusal, every non-GET to the target is intercepted (`fixtures/base.js`), live access only through `utils/live.js` (GET, serial, delayed, capped, disk-cached).
- Secrets: `.env` (gitignored, mode 600) holds `WP_REST_AUTH`; `.env.example` and `.gitignore` added.
- Old `tests/e2e` suite removed (it submitted real forms to dev). Its cookie helper and GF form ids were carried over.

## Status (2026-10-20)

Run against dev (desktop, tablet, mobile, responsive, a11y, editor): 438 passed, 29 failed, 6 skipped, before
the 0.1.2 fixes below. Unit: 534 pass. Not yet run: firefox, webkit, parity beyond the 3-page sample, an a11y
baseline.

Fixed on 2026-10-20:

- Accommodation and review singles returned 500. Cause: WETU-imported Tour Operator `*_to_*` connection meta
  (location objects, nested arrays, repeated IDs); TO 2.2 uses each item as an array key. Fixed in the dev
  database by a one-off migration (586 rows). **Live needs the same migration before launch.**
- 0.1.2 (deploy pending at time of writing): one banner landmark, single team `<h1>`, team tel/mailto links,
  team contact card skips drafts, review heading level, slider-arrow overflow below 1400px, 24px top-bar targets,
  duplicate GF hooks script in the enquiry modal, search no-results copy, legacy header removed. Test fixes:
  FacetWP no-results is not a result, header selectors include `.ati-top-header`, multi-page booking form,
  mega-menu link check batched with a longer timeout.

Open (not theme code):

- Gravity Forms #4 (contact) has no required fields on dev: `forms.spec.js › contact … declares its required
  fields` fails until the form is configured.
- "Helpful Pre-departure Information" hotlinks 3 images from lh4.googleusercontent.com that no longer load.
- Orphan database template parts on dev (unreferenced; TO seeds and old themes) — delete via WP-CLI.

Keep in mind: bump the theme `Version` whenever a pattern file or slug changes, or WordPress keeps serving the
cached pattern list (this blanked the header and footer on dev once).

## Commands

    npm install && npx playwright install chromium
    npm run test:unit                 # static, ~20s, no network
    npm run test:smoke                # @smoke on desktop
    npx playwright test --project=desktop     # full functional sweep
    npm run test:templates | test:parts | test:forms | test:layout | test:cards
    npm run test:responsive           # responsive + tablet + mobile
    npm run test:a11y                 # axe (report-only until a baseline exists)
    npm run test:editor               # needs WP_REST_AUTH, GET only
    npm run test:parity               # opt-in, reads ati-holidays.com; report: tests/e2e/test-results/parity-report.md
    WP_BASE_URL=http://localhost:8900 npm run test:e2e   # local Studio (stale DB, TO 2.1.1)
    ATI_BYPASS_CACHE=true ...         # render dev fresh (slower)
