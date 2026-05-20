# AGENTS.md

Follow the user's request and this file's guidance when working in `ati-theme-2026`.

## Project overview

- This directory is the standalone ATI Holidays block theme at `wp-content/themes/ati-theme-2026`.
- The theme is derived from the local `wp-content/themes/ollie` baseline and migrated from the previous ATI source theme.
- `DESIGN.md` and `theme.json` are the source of truth for ATI tokens, typography, spacing, radii, and Tour Operator-compatible styling.
- This is not an Ollie child theme. Do not add a parent-template header, parent stylesheet dependencies, child-theme function prefixes, or old child-theme references.

## Token rules

- Keep the fixed 47 colour presets only: `base`, `contrast`, and `neutral|brand|primary|cta|accent` `100-900` ramps.
- **Primary family** (`primary-500` = #232020): Use for primary actions, buttons, and main interactive elements.
- **CTA family** (`cta-500` = #D54F00): Use for conversion actions, hover states, and secondary emphasis.
- **Accent family** (`accent-500` = #AA653C): Use for additional visual emphasis and decorative accents (shares tone with CTA but distinct).
- Do not reintroduce legacy colour aliases such as `primary`, `primary-accent`, `main`, `border-light`, or `border-dark`.
- Use `Forum, serif` through the `brand-serif` font-family preset.
- Use numeric slugs for font sizes, spacing, shadows, and border radii.
- `border-radius` preset `500` is the ATI 15px control radius.
- Font sizes and spacing use fluid scaling with `clamp()` for responsive design.

## File ownership

- Prefer `theme.json` for global tokens, element defaults, and shared block defaults.
- Prefer `styles/**/*.json` for block and section style variations.
- Use `templates/*.html`, `parts/*.html`, and `patterns/*.php` for editor-compatible block markup.
- Keep `style.css` limited to metadata and behavior-constrained CSS that cannot live in theme.json.
- Preserve Tour Operator block markup and plugin bindings while updating token references.

## Validation

Before handoff, scan for old namespace strings, legacy preset slugs, orphaned `var:preset` references, invalid JSON, and PHP syntax errors. Record local WordPress editor/front-end QA limitations when CLI access is unavailable.
