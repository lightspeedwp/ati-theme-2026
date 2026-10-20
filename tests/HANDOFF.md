# ATI theme test suite — handoff

Written 2026-10-16 (wrapped up early at the coordinator's request). Nothing is committed (user rule).

## What is done

- Static unit tests (vitest, no browser): `tests/unit/theme/*`
  - `to-wrappers.test.js` — TO `lsx-*-wrapper` / `facts-*-wrapper` vs binding agreement (expands theme patterns; honours `lsx_to_multi_field_wrappers` registered in functions.php; control tests prove it can fail).
  - `theme-json.test.js`, `references.test.js` (patterns/parts resolve, no `wp:block` refs, no hardcoded env URLs, one `<main>` per template), `patterns.test.js` (headers, `php -l`, block-comment balance, SVG fill advisory), `template-coverage.test.js`.
- Playwright e2e (`playwright.config.js`, `tests/e2e/`): templates, static pages (every REST-published page), singles, taxonomies, search/404, cards + wrappers (REST-driven), parts (header/footer/mega/mobile/modals), layout gaps, forms (client-side only), responsive, a11y (axe, baseline gate), editor (REST overrides, read-only), parity (card parity + full content parity with report).
- Safety: host allowlist, production refusal, every non-GET to the target is intercepted (`fixtures/base.js`), live access only through `utils/live.js` (GET, serial, delayed, capped, disk-cached).
- Secrets: `.env` (gitignored, mode 600) holds `WP_REST_AUTH`; `.env.example` and `.gitignore` added.
- Old `tests/e2e` suite removed (it submitted real forms to dev). Its cookie helper and GF form ids were carried over.

## Unfinished / untested

- The full e2e run was NOT completed. Last run: `--project=desktop`, killed at about 91 of 242 tests (68 passed, 23 failed). Not run at all: tablet, mobile, firefox, webkit, responsive, a11y, editor, full parity.
- Parity was run only on 3 pages (rachel-nigel, camp-silwane, moments-in-zimbabwe).
- No a11y baseline recorded (scans report only).
- The `console-and-links` failures below were seen once; the consoleGuard allowlist and link sample have not been tuned. Check each failure for flakiness before filing it.
- Dev renders are slow with 4 workers; use fewer workers if the machine is busy.
- Note: some of my files show as tracked/modified in git (someone ran `git add`/commit while I worked); nothing was committed by me.

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

## Latest failures (desktop run, about 13:5x, 2026-10-16, incomplete)

Dev has been deployed twice since early runs (7e12115, e80c7be) and template resets are happening, so re-run before acting.

(a) Theme-file bugs
- Footer social links `url="#"` (patterns/footer.php) — `parts/footer.spec.js › social links point at real profiles`.
- Header search toggle test failed — `parts/header.spec.js › search: the toggle reveals an input…` (check whether test or theme).
- Static unit failures: pattern Slug convention (`header`, `main-header`, `top-header`, `footer`, `single-hero`, `home-page-destinations-section` do not use `ati-theme-2026/<filename>`); `mobile-menu` missing from theme.json `templateParts`.
- Review "Date travelled" renders January 1, 1970 – January 1, 1970 (live: 05 Sep 2025 – 23 Sep 2025) — parity `fact.date`, `singles.spec.js › review: the travel dates are not the Unix epoch`.
- Accommodation card Style/Location rows missing on dev — `templates/cards.spec.js › single review|single accommodation`, parity `card.accommodation.*` (fix is in the working tree; known-pending).

(b) Content/data on dev
- Booking form / contact form id 1 and 4 checks failed (`forms/forms.spec.js › booking … renders`, `contact … declares required fields`) — verify the form ids still match dev.
- `console-and-links` internal-link and image failures on accommodation archive, single accommodation, single review — inspect the broken URLs in the report.

(c) Plugin / TO
- Console errors on front page, destination archive, single tour/accommodation/country/region/review/special/team: `pageerror fUtil is not defined` (FacetWP) and `Unexpected token ')'` on tour/destination pages. Seen on every page; not allowlisted.
- Modals: `parts/modals.spec.js › every modal trigger points at a dialog that exists` and `every dialog has an accessible name` (TO `dialog.wp-block-hm-popup`).
- `parts/navigation.spec.js › the mega menus link to pages that exist` timed out/failed (1.1 min, 60 GETs) — likely slow dev or a dead link.

(d) Known-pending
- `layout/gaps.spec.js › single accommodation: no stray gap…` (sticky-menu wrapper 20px blockGap; CSS fix pending deploy).
- Accommodation card rows (above), booking validity, tagline, `lsx-additional-info-wrapper`: listed in `tests/e2e/fixtures/known-pending.js`. Delete entries once deployed.
- Site Editor DB overrides (15 templates, 17 parts source=custom at the time): `editor/template-overrides.spec.js` (reports, does not fail).

## Static test state at last run (`npm run test:unit`)
538 pass, 7 fail: 6 pattern-slug convention, 1 `mobile-menu` templateParts. The wrapper test found 25 mismatched wrappers at the start (duration/travel-style x14, tagline x7, general x3, booking-validity x3, a card bug in review-card-small block balance); all are now fixed or registered in the working tree.
