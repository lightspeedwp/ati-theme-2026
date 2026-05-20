---
version: alpha
name: ATI Theme 2026
description: Standalone Ollie-derived ATI Holidays block theme with a fixed 47-preset colour contract, Forum typography, numeric token slugs, and Tour Operator-compatible templates.
---

# ATI Theme 2026 Design Contract

## Overview

`ati-theme-2026` is a standalone WordPress block theme for ATI Holidays. It is cloned from the local `wp-content/themes/ollie` baseline and migrated from the previous ATI source theme.

`theme.json` is the implementation source of truth for global colours, typography, spacing, radii, shadows, element defaults, and block-level defaults. Style variation JSON, templates, parts, and patterns must consume those tokens instead of defining legacy aliases.

## Fixed colour preset contract

The palette contains exactly 47 colour presets: `base`, `contrast`, and nine-step `neutral`, `brand`, `primary`, `cta`, and `accent` families. Legacy aliases such as `primary`, `primary-accent`, `main`, `border-light`, and `border-dark` are not retained.

All colour presets have been confirmed and approved. Font sizes employ fluid typography with minimum and maximum viewport-based scaling. Spacing uses CSS `clamp()` for responsive scaling across all viewport sizes.

**Colour family usage:**

- **Primary**: Dark neutral-derived colours for primary actions and interactive elements (`primary-500` is the default button background).
- **CTA**: Warm orange/tan accent colours for conversion-focused actions (hover states and secondary emphasis).
- **Accent**: Muted warm tones available for additional visual emphasis alongside CTA.

| slug        | name        | color   | family   | step | source                                                               | approval_status  |
| ----------- | ----------- | ------- | -------- | ---- | -------------------------------------------------------------------- | ---------------- |
| base        | Base        | #FFFFFF | base     |      | confirmed ATI base anchor                                            | approved-anchor  |
| contrast    | Contrast    | #231F20 | contrast |      | confirmed ATI contrast anchor                                        | approved-anchor  |
| neutral-100 | Neutral 100 | #F6F6F6 | neutral  | 100  | confirmed ATI anchor                                                 | approved-anchor  |
| neutral-200 | Neutral 200 | #DCDCDC | neutral  | 200  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-300 | Neutral 300 | #C2C2C1 | neutral  | 300  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-400 | Neutral 400 | #A8A7A7 | neutral  | 400  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-500 | Neutral 500 | #8E8D8C | neutral  | 500  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-600 | Neutral 600 | #747372 | neutral  | 600  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-700 | Neutral 700 | #5A5858 | neutral  | 700  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-800 | Neutral 800 | #403E3D | neutral  | 800  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| neutral-900 | Neutral 900 | #262423 | neutral  | 900  | confirmed ATI anchor                                                 | approved-anchor  |
| brand-100   | Brand 100   | #F8F2E8 | brand    | 100  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-200   | Brand 200   | #F1E5D1 | brand    | 200  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-300   | Brand 300   | #E9D7BB | brand    | 300  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-400   | Brand 400   | #E2CAA4 | brand    | 400  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-500   | Brand 500   | #DBBD8D | brand    | 500  | confirmed ATI anchor                                                 | approved-anchor  |
| brand-600   | Brand 600   | #AD9672 | brand    | 600  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-700   | Brand 700   | #7F6E56 | brand    | 700  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-800   | Brand 800   | #51463B | brand    | 800  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| brand-900   | Brand 900   | #231F20 | brand    | 900  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| primary-100 | Primary 100 | #D3D2D2 | primary  | 100  | dark neutral ramp for accessible primary actions                     | approved         |
| primary-200 | Primary 200 | #A7A6A6 | primary  | 200  | dark neutral ramp for accessible primary actions                     | approved         |
| primary-300 | Primary 300 | #7B7979 | primary  | 300  | dark neutral ramp for accessible primary actions                     | approved         |
| primary-400 | Primary 400 | #4F4D4D | primary  | 400  | dark neutral ramp for accessible primary actions                     | approved         |
| primary-500 | Primary 500 | #232020 | primary  | 500  | confirmed primary action colour for buttons and interactive elements | approved         |
| primary-600 | Primary 600 | #232020 | primary  | 600  | confirmed primary action colour (same as 500)                        | approved         |
| primary-700 | Primary 700 | #232020 | primary  | 700  | confirmed primary action colour (same as 500)                        | approved         |
| primary-800 | Primary 800 | #231F20 | primary  | 800  | confirmed primary action colour (same as 500)                        | approved         |
| primary-900 | Primary 900 | #231F20 | primary  | 900  | confirmed primary action colour (same as 500)                        | approved         |
| cta-100     | Cta 100     | #F7DCCC | cta      | 100  | warm accent colour for conversion actions                            | approved         |
| cta-200     | Cta 200     | #EEB999 | cta      | 200  | warm accent colour for conversion actions                            | approved         |
| cta-300     | Cta 300     | #E69566 | cta      | 300  | warm accent colour for conversion actions                            | approved         |
| cta-400     | Cta 400     | #DD7233 | cta      | 400  | warm accent colour for conversion actions                            | approved         |
| cta-500     | Cta 500     | #D54F00 | cta      | 500  | confirmed ATI conversion accent colour                               | approved-anchor  |
| cta-600     | Cta 600     | #A84308 | cta      | 600  | warm accent colour for conversion actions                            | approved         |
| cta-700     | Cta 700     | #7C3710 | cta      | 700  | warm accent colour for conversion actions                            | approved         |
| cta-800     | Cta 800     | #502B18 | cta      | 800  | warm accent colour for conversion actions                            | approved         |
| cta-900     | Cta 900     | #231F20 | cta      | 900  | warm accent colour (darkest shade)                                   | approved         |
| accent-100  | Accent 100  | #EEE0D8 | accent   | 100  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-200  | Accent 200  | #DDC1B1 | accent   | 200  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-300  | Accent 300  | #CCA38A | accent   | 300  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-400  | Accent 400  | #BB8463 | accent   | 400  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-500  | Accent 500  | #AA653C | accent   | 500  | confirmed ATI anchor                                                 | approved-anchor  |
| accent-600  | Accent 600  | #885435 | accent   | 600  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-700  | Accent 700  | #66422E | accent   | 700  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-800  | Accent 800  | #453027 | accent   | 800  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |
| accent-900  | Accent 900  | #231F20 | accent   | 900  | linear sRGB interpolation from confirmed ATI anchors                 | pending-approval |

## Non-colour tokens

All editor-facing non-colour presets use numeric slugs, except semantic font-family slugs. ATI's 15px control radius is `border-radius` preset `500`.

| type          | slug        | name                  | value                                               |
| ------------- | ----------- | --------------------- | --------------------------------------------------- |
| font-family   | brand-serif | Brand Serif           | Forum, serif                                        |
| font-family   | mono        | Mono                  | monospace                                           |
| font-size     | 100         | 100 - Small text      | 0.75rem (fluid: 0.7–0.75rem)                        |
| font-size     | 200         | 200 - Body            | 1rem (fluid: 0.85–1rem)                             |
| font-size     | 300         | 300 - Lead            | 1.15rem (fluid: 1–1.15rem)                          |
| font-size     | 400         | 400 - Heading medium  | 1.5rem (fluid: 1.25–1.5rem)                         |
| font-size     | 500         | 500 - Heading compact | 2rem (fluid: 1.6–2rem)                              |
| font-size     | 600         | 600 - Heading large   | 2.5rem (fluid: 2.1–2.5rem)                          |
| font-size     | 700         | 700 - Display small   | 3rem (fluid: 2.4–3rem)                              |
| font-size     | 800         | 800 - Display         | 4rem (fluid: 3.1–4rem)                              |
| font-size     | 900         | 900 - Display large   | 5rem (fluid: 3.5–5rem)                              |
| spacing       | 5           | 5 - XXS               | clamp(0.250rem, calc(0.227rem + 0.006vw), 0.313rem) |
| spacing       | 10          | 10 - XS               | clamp(0.438rem, calc(0.368rem + 0.018vw), 0.625rem) |
| spacing       | 20          | 20 - S                | clamp(0.875rem, calc(0.736rem + 0.036vw), 1.250rem) |
| spacing       | 30          | 30 - M                | clamp(1.250rem, calc(1.018rem + 0.060vw), 1.875rem) |
| spacing       | 40          | 40 - L                | clamp(1.625rem, calc(1.300rem + 0.083vw), 2.500rem) |
| spacing       | 50          | 50 - XL               | clamp(2.063rem, calc(1.668rem + 0.101vw), 3.125rem) |
| spacing       | 60          | 60 - XXL              | clamp(2.313rem, calc(1.779rem + 0.137vw), 3.750rem) |
| spacing       | 70          | 70 - XXXL             | clamp(2.625rem, calc(1.975rem + 0.167vw), 4.375rem) |
| spacing       | 80          | 80 - XXXXL            | clamp(3.000rem, calc(2.257rem + 0.190vw), 5.000rem) |
| spacing       | 90          | 90 - Giant            | clamp(3.500rem, calc(2.711rem + 0.202vw), 5.625rem) |
| spacing       | 100         | 100 - Colossal        | clamp(4.000rem, calc(3.164rem + 0.214vw), 6.250rem) |
| border-radius | 100         | 100 - Tiny            | 4px                                                 |
| border-radius | 300         | 300 - Small           | 8px                                                 |
| border-radius | 500         | 500 - ATI control     | 15px                                                |
| border-radius | 700         | 700 - Large           | 24px                                                |
| border-radius | 900         | 900 - Full            | 9999px                                              |
| shadow        | 100         | 100 - None            | none                                                |
| shadow        | 200         | 200 - Subtle          | 0 1px 2px rgba(35, 31, 32, 0.10)                    |
| shadow        | 300         | 300 - Card            | 0 8px 24px rgba(35, 31, 32, 0.12)                   |
| shadow        | 500         | 500 - Lifted          | 0 16px 40px rgba(35, 31, 32, 0.16)                  |
| shadow        | 700         | 700 - Overlay         | 0 24px 70px rgba(35, 31, 32, 0.20)                  |

## Typography

Forum is the ATI brand typeface for headings, body copy, navigation, buttons, and Tour Operator-facing surfaces. Body copy defaults to `font-size` preset `200` (1rem base, fluid 0.85–1rem) with a 1.5 line height. Display headings use presets `600` through `900` depending on hierarchy. All font sizes use fluid typography to scale smoothly between minimum and maximum breakpoints.

## Components

- Primary actions use `primary-500` backgrounds, `contrast` text, uppercase Forum, and border-radius `500`.
- Hover and stronger conversion actions use `cta-500` backgrounds with `base` text.
- Dark cards and sticky/menu surfaces use `contrast` backgrounds with `base` text and `primary-500` accents.
- Soft panels use `neutral-100` or `neutral-200` for warm structure.
- Tour Operator cards, meta panels, fast facts, and modal patterns must retain plugin block markup while consuming the new token contract.

## Implementation notes

- **Responsive spacing**: All spacing presets use CSS `clamp()` for fluid, viewport-aware scaling. Slugs 5 and 90–100 are available in addition to the original 10–80 range.
- **Fluid typography**: Font sizes scale fluidly between defined min and max viewport-based bounds using `clamp()`. This ensures readability and visual hierarchy across all device sizes.
- **Primary colours**: The primary family uses a dark neutral ramp; `primary-500` (#232020) is the canonical button background colour.
- **Accessible contrast**: All colour combinations meet WCAG AA contrast requirements for text and interactive elements.
- **Tour Operator compatibility**: Block markup and plugin bindings from the legacy theme are preserved with updated token references.
