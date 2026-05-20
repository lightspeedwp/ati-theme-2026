---
applyTo: "theme.json,styles/**/*.json,templates/**/*.html,parts/**/*.html,patterns/**/*,functions.php,assets/css/**/*,blocks/**/*"
---

# ATI Theme 2026 Block Theme Instructions

This is a standalone block theme, not an Ollie child theme. Use `DESIGN.md` and `theme.json` as the source of truth for ATI tokens.

Required behavior:

- keep `theme.json` as the source of truth for shared tokens and global styles
- preserve Tour Operator plugin block markup and bindings
- use only the approved 47 colour presets
- use numeric slugs for font sizes, spacing, shadows, and border radii
- avoid raw colour values when a preset or custom token can express the rule
- do not add a parent-template header or parent stylesheet dependencies
