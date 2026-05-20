---
name: legacy-page-pattern-extractor
description: "Extract ATI Holidays legacy page sections into WordPress block patterns, template parts, and templates for ati-theme-2026. Use when migrating a live ATI page URL or matching source files in ati-holidays-lsx-child, especially Tour Operator templates that need correct pattern naming, section styling, and template assembly using goafrica-ollie-child and Medical Academic as references."
argument-hint: "Provide a live ATI URL, and optionally a source template slug, target template slug, or migration constraints."
---

# Legacy Page Pattern Extractor

## Purpose

Use this skill when rebuilding an existing ATI Holidays page or template into `ati-theme-2026` using block patterns, template parts, block templates, and section styles.

This skill is for migration from the live site and the legacy source theme, not greenfield design work. Its job is to identify the reusable page sections already present on ATI, map them to the correct block-theme artefacts, and then assemble them into the target theme without drifting away from the current ATI presentation unless the user explicitly asks for a small modernisation.

All created patterns must be ATI-specific patterns for `ati-theme-2026`. Reference themes may inform structure, behaviour, or template responsibility, but they must not be copied forward as generic shared theme patterns.

This skill is approval-gated in two steps:

1. Detect the sections, patterns, template parts, and template responsibilities on the source page.
2. Stop and ask the user to approve that extraction map.
3. Propose the concrete target artefacts to create, reuse, or update in `ati-theme-2026`.
4. Stop and ask the user to approve that implementation plan.
5. Only then create or update patterns, section styles, template parts, and templates.

Do not skip either approval gate.

## When To Use

- Migrating a live ATI Holidays URL into `ati-theme-2026`
- Converting a legacy ATI template or PHP-rendered section into block patterns
- Reconstructing page composition from `ati-holidays-lsx-child`
- Rebuilding Tour Operator archive, taxonomy, and single templates with the correct ATI styling
- Extracting repeated page sections before creating a new template in the block theme
- Applying newly created patterns to templates or template parts after approval
- Keeping one-off sections in the target template while still giving them a reusable section style when appropriate

## Inputs

- A live ATI Holidays page URL
- Optional source file hint such as a PHP template name, page slug, or template responsibility
- Optional target file hint such as a template slug, template part slug, or preferred pattern slug
- Optional constraints such as `MVP`, `preserve content exactly`, `light modernisation`, `patterns only`, `no new section styles`, or `template assembly included`

## Theme Scope

Treat these directories as the working set:

- Target block theme: `wp-content/themes/ati-theme-2026`
- Legacy ATI source theme: `wp-content/themes/ati-holidays-lsx-child`
- Tour Operator reference theme: `wp-content/themes/goafrica-ollie-child`
- Theme-structure reference: `wp-content/themes/medical academic`

Always read and use these target-theme files before proposing or writing anything:

- `AGENTS.md`
- `DESIGN.md`
- `theme.json`
- `styles/**/*.json`
- `styles/sections/**/*.json`
- `patterns/**/*.php`
- `parts/**/*.html`
- `templates/**/*.html`
- `functions.php`
- any target `.github/instructions/*.md` files relevant to edited files

Always inspect these source-theme files before inferring structure from the live page alone:

- `ati-holidays-lsx-child/functions.php`
- `ati-holidays-lsx-child/header.php`
- `ati-holidays-lsx-child/footer.php`
- source template PHP files that match the page or content type
- source partials, classes, or helper files used to render the page sections

For Tour Operator templates, always inspect these reference areas as well:

- `goafrica-ollie-child/templates/**/*.html`
- `goafrica-ollie-child/patterns/**/*.php`
- the matching Tour Operator templates and patterns in `ati-theme-2026`

For style-structure guidance, inspect these reference areas when deciding whether a section style belongs in JSON, markup, or template composition:

- `medical academic/styles/**/*.json`
- `medical academic/patterns/**/*.php`
- `medical academic/templates/**/*.html`
- `medical academic/parts/**/*.html`

## Source Of Truth

The live ATI page and `ati-holidays-lsx-child` should describe the same implementation. Use both.

Priority rules:

1. Use the live URL to understand rendered order, visible content, interaction, and responsive grouping.
2. Use `ati-holidays-lsx-child` to identify the real source template, partials, loops, conditionals, and reusable section boundaries.
3. Use `ati-theme-2026` as the source of truth for target tokens, naming, structure, and existing reusable artefacts.
4. Use `goafrica-ollie-child` to preserve Tour Operator-specific semantics, pattern responsibilities, and template assembly.
5. Use `medical academic` as a structural reference for clean style placement, section-style organisation, and target-theme composition patterns.

Do not invent a new page structure when the live site and source theme already agree.
Do not import reference-theme pattern identities into ATI. Rebuild them as ATI-specific target-theme artefacts.

## Artefact Routing Rules

Every extracted section must be assigned to one target artefact type before implementation:

- `patterns/*.php` for reusable content sections or cards
- `parts/*.html` for shared site chrome or repeatable template shells
- `templates/*.html` for page-level and content-type-level assembly
- `styles/sections/**/*.json` for reusable section styles that belong in the theme styling layer
- other `styles/**/*.json` files only when the styling responsibility clearly belongs outside section styles

Routing rules:

1. If the section is reused across multiple pages, prefer a pattern.
2. If it is global chrome such as header, footer, or shared masthead shell, prefer a template part.
3. If the work is page-level composition of already-known pieces, prefer a template.
4. If a pattern or template section needs a reusable visual contract beyond inline block attributes, create or reuse a section style in `styles/sections/`.
5. If a section exists only to satisfy one template and has no reuse value, keep the structure in the template instead of forcing a pattern.
6. A one-off section may still receive a section style when that improves consistency or keeps template markup cleaner.

## Naming Rules

When extracting sections, use names that reflect their job, not their source CSS class.

- Name group blocks by semantic responsibility, such as `hero`, `intro`, `featured-tours`, `destination-highlights`, `facts-strip`, or `enquiry-cta`.
- Name patterns by section purpose and family, not by page slug alone.
- Keep Tour Operator names aligned with existing ATI or GoAfrica pattern responsibilities where a close equivalent already exists.
- Preserve plugin-aware blocks and query contexts for Tour Operator content instead of flattening them into static layout blocks.
- Rebuild all patterns as ATI-specific artefacts, even when a reference theme exposes a close equivalent.

For Tour Operator templates:

1. Match the content type or taxonomy to the nearest existing ATI or GoAfrica template responsibility.
2. Reuse existing ATI 2026 Tour Operator patterns where they already fit.
3. If a new pattern is needed, keep the naming compatible with the existing ATI 2026 Tour Operator pattern family.
4. Apply section styles so the result reads as ATI first, not as a GoAfrica clone.

## Mandatory Workflow

### Phase 1 - Context Loading

1. Read the target theme files listed in Theme Scope.
2. Read the live ATI page if a URL was supplied.
3. Locate the matching source template or closest rendering entry point in `ati-holidays-lsx-child`.
4. Trace any source partials, helper classes, or loops that materially affect visible page sections.
5. Read the closest matching patterns, parts, templates, and section styles already present in `ati-theme-2026`.
6. If the page is Tour Operator-driven, read the closest matching templates and patterns in `goafrica-ollie-child`.
7. If style placement is unclear, inspect the equivalent organisational choice in `medical academic`.

### Phase 2 - Section Detection

Identify the page as a sequence of migration units.

For each visible unit, capture:

- section name
- source of truth file or files
- whether it belongs to a pattern, part, template, or style only
- whether it is static, dynamic, or plugin-driven
- likely reuse frequency
- key styling contract
- whether it already exists in `ati-theme-2026`

Detection rules:

1. Split at real semantic section boundaries, not just visual spacing changes.
2. Keep compound hero areas together unless they are clearly reused separately.
3. Treat repeated cards, teaser rails, and CTA bands as candidate patterns.
4. Treat template-only wrappers, query scaffolds, and content-type shells as template responsibilities.
5. Mark uncertain boundaries explicitly instead of guessing.
6. Default one-off sections to the relevant template unless reuse is clear.

### Phase 3 - Approval Gate One

Return the extraction map and stop.

The report must include:

1. page or template being migrated
2. source template or entry point found
3. ordered list of detected sections
4. proposed artefact type for each section
5. dynamic or Tour Operator dependencies
6. existing target patterns, templates, or section styles that may already cover some sections
7. ambiguities that need confirmation

Then ask: `Approve these detected sections and responsibilities?`

Do not write files before approval.

### Phase 4 - Reuse And Gap Analysis

After approval, map each approved section to the smallest target change.

For each section, determine:

- reuse an existing ATI-specific pattern only if it already matches the required ATI section responsibility
- remake a nearby ATI pattern as a more specific ATI pattern when the current one is too generic or misnamed
- create a new pattern
- keep inside a template only
- move global structure into a template part
- create or reuse a section style in `styles/sections/`
- assemble inside an existing template
- create or update a template

Search these areas before creating anything:

- `ati-theme-2026/patterns/**/*.php`
- `ati-theme-2026/parts/**/*.html`
- `ati-theme-2026/templates/**/*.html`
- `ati-theme-2026/styles/sections/**/*.json`
- matching Tour Operator files in `goafrica-ollie-child`

Reference-theme files may guide structure, but do not reuse or port their pattern names directly into ATI unless that name already matches ATI content language.

### Phase 5 - Tour Operator Branch

When the page belongs to a Tour Operator post type, taxonomy, archive, or single template, apply this branch.

1. Identify the exact content entity and template responsibility.
2. Preserve the plugin-aware block structure and dynamic bindings.
3. Match the shell to the nearest Tour Operator template in `ati-theme-2026`.
4. If the target theme lacks the required shell, use `goafrica-ollie-child` as the behavioural reference for template composition.
5. Name group blocks and section wrappers by ATI content responsibility, not by incidental markup classes from the legacy PHP theme.
6. Use ATI 2026 patterns for cards and repeated sections where available before creating new Tour Operator patterns, but remake them when they are not ATI-specific enough.
7. When creating a new Tour Operator pattern, ensure it can be applied cleanly from the template without breaking plugin context.

### Phase 6 - Styling And Modernisation

ATI styling should stay recognisably ATI.

Modernisation rules:

1. Preserve section hierarchy, brand tone, content order, and core affordances.
2. Only modernise lightly unless the user explicitly asks for broader redesign.
3. Prefer target theme tokens, spacing scale, typography presets, and existing style variations.
4. Reuse or create section styles in `styles/sections/` when a visual contract will be shared or repeated.
5. Do not introduce stylistic divergence just because the legacy theme used bespoke CSS.
6. When translating legacy utility classes or hardcoded values, move to the closest ATI 2026 token-led equivalent.

### Phase 7 - Approval Gate Two

Return the implementation plan and stop.

The report must include:

1. target ATI-specific patterns to reuse
2. target ATI-specific patterns to remake or replace
3. new ATI-specific patterns to create
4. template parts to reuse or update
5. templates to reuse or update
6. section styles to reuse or create
7. Tour Operator-specific template decisions
8. assumptions or unresolved mapping issues

Then ask: `Approve this extraction plan and proceed with implementation?`

Do not write files before approval.

### Phase 8 - Implementation After Approval

After approval:

1. Create or update ATI-specific patterns in `ati-theme-2026/patterns/`.
2. Create or update reusable section styles in `ati-theme-2026/styles/sections/` when needed.
3. Create or update template parts in `ati-theme-2026/parts/` when global composition requires them.
4. Create or update templates in `ati-theme-2026/templates/` when page assembly is part of the approved plan.
5. Ensure newly extracted patterns are actually applied in the relevant template or template part when the approved plan requires template assembly.
6. Validate that Tour Operator templates keep the right dynamic block responsibilities and pattern placement.
7. Verify the final naming is semantic and consistent across patterns, parts, templates, and section styles.

## Pattern And Template Authoring Rules

- Use WordPress block markup, not ad hoc HTML shells, unless a target file format requires HTML templates.
- Keep patterns self-contained and reusable.
- Keep templates focused on composition.
- Escape PHP output and use the `ati-theme-2026` text domain if the target repo uses translatable visible strings in PHP patterns.
- Reuse existing ATI 2026 cards, content sections, and Tour Operator patterns only when they already fit ATI-specific naming and responsibility.
- If an existing ATI pattern is too generic or mismatched, remake it as a clearer ATI-specific pattern rather than forcing reuse.
- Do not hardcode legacy CSS class systems into new pattern markup unless the class is a deliberate runtime hook that the target theme already uses.
- Prefer semantic blocks over generic wrappers where WordPress provides one.

## Validation Checklist

- The source page or template was matched to real files in `ati-holidays-lsx-child`
- The detected sections were approved before implementation
- The extraction plan was approved before implementation
- Every created artefact has a clear responsibility: pattern, part, template, or section style
- New patterns are applied in templates when template assembly was part of the approved plan
- Tour Operator templates preserve dynamic responsibilities and naming consistency
- One-off sections remain in templates unless reuse is justified
- ATI 2026 styling stays aligned with `DESIGN.md`, `theme.json`, and existing `styles/sections/**/*.json`
- GoAfrica is used as a Tour Operator reference, not as a visual source to copy blindly
- Medical Academic is used for structure guidance only where it improves target-theme organisation

## Reporting Template

1. **Page**: `<live URL or template slug>`
2. **Source entry point**: `<legacy file(s)>`
3. **Detected sections**: `<ordered list with section name -> artefact type -> source file -> reuse potential>`
4. **Existing target coverage**: `<patterns, parts, templates, section styles already available>`
5. **Tour Operator handling**: `<required or not required, plus relevant target/reference files>`
6. **Need confirmation on**: `<ambiguities>`

Then ask: `Approve these detected sections and responsibilities?`

For the second gate, report:

1. **Reuse**: `<existing ATI-specific target artefacts>`
2. **Remake**: `<existing ATI artefacts to replace with clearer theme-specific versions>`
3. **Create**: `<new patterns, parts, templates, section styles>`
4. **Template assembly**: `<where approved patterns will be applied>`
5. **Need confirmation on**: `<remaining ambiguities>`

Then ask: `Approve this extraction plan and proceed with implementation?`
