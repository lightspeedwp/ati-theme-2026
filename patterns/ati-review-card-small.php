<?php
/**
 * Title: ATI Review Card Small
 * Slug: ati-theme-2026/ati-review-card-small
 * Description: Compact review card with a circular thumbnail, reviewer name, and excerpt displayed on a primary-coloured background with rounded corners.
 * Categories: testimonials
 * Keywords: review, testimonial, card, guest, compact
 * Viewport Width: 500
 * Block Types: core/post-template
 * Inserter: true
 */
?>


<!-- wp:group {"metadata":{"name":"Review Card"},"className":"overflow-hidden is-style-default","style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}},"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}}},"backgroundColor":"primary-500","textColor":"base","layout":{"type":"default"},"ariaLabel":"Tour Card","linkDestination":"post"} -->
<div aria-label="Tour Card" class="wp-block-group overflow-hidden is-style-default has-base-color has-primary-500-background-color has-text-color has-background has-link-color" style="border-top-left-radius:var(--wp--preset--border-radius--100);border-top-right-radius:var(--wp--preset--border-radius--100);border-bottom-left-radius:var(--wp--preset--border-radius--100);border-bottom-right-radius:var(--wp--preset--border-radius--100);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"33.33%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:33.33%"><!-- wp:post-featured-image {"aspectRatio":"1","width":"","height":"","style":{"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}}}} /--></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"66.66%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:66.66%"><!-- wp:group {"style":{"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:group {"metadata":{"name":"Reviewers"},"className":"center-vertically","style":{"dimensions":{"minHeight":"0rem"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group center-vertically" style="min-height:0rem"><!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"typography":{"fontStyle":"normal","fontWeight":"300"},"elements":{"link":{":hover":{"color":{"text":"var:preset|color|base"}},"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Review Content"},"layout":{"type":"default"}} -->
<div class="wp-block-group"><!-- wp:post-excerpt {"showMoreOnNewLine":false,"excerptLength":40,"className":"line-clamp-4","style":{"typography":{"fontStyle":"italic","fontWeight":"300"}},"fontSize":"200"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->