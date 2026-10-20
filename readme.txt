== ati-theme-2026 ==

Contributors: LightSpeedWP
Requires at least: 6.9
Tested up to: 7.0
Requires PHP: 7.3
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

== Description ==

Standalone Ollie-derived block theme for ATI Holidays. The theme implements the ATI 2026 design system, a fixed 47-preset colour contract, Forum typography, Tour Operator-compatible templates, and block-theme-native styling through theme.json and style variation JSON.

== Changelog ==

= 0.1.2 =
* Fix: accommodation and review pages no longer crash on Tour Operator connections (connection data migrated; draft connections are left out of connection lists instead of being reshaped in meta).
* Fix: one banner landmark per page; the top bar is no longer a <header>.
* Fix: team pages have a single <h1>, and team phone numbers and emails are tel:/mailto: links.
* Fix: the team contact card skips draft team members.
* Fix: the review "Trip details" heading no longer skips a level.
* Fix: slider arrows no longer push the page wider than the screen below 1400px.
* Fix: top-bar links and the currency menu toggle meet the 24px minimum target size.
* Fix: the enquiry modal no longer prints a broken duplicate of the Gravity Forms hooks script.
* Search with no results now shows search-appropriate copy.
* Remove the unused legacy header pattern and template part.

= 0.1.1 =
* Namespace header, footer, main-header, top-header, single-hero and home-page-destinations-section pattern slugs as ati-theme-2026/<file>. The version bump also invalidates WordPress's cached theme pattern list, which otherwise kept the old slugs and rendered the header and footer empty.

= 0.1.0 =
* Initial standalone ATI Theme 2026 implementation.

== Copyright ==

ati-theme-2026 WordPress Theme, (C) 2026 LightSpeed.
ati-theme-2026 is distributed under the terms of the GNU GPL.

This theme is derived from the local Ollie block theme baseline and includes ATI Holidays-specific migration work from the previous ATI child theme.
