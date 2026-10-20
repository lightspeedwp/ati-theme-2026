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
 *
 * @package ATI_Theme_2026
 */

?>

<!-- wp:group {"metadata":{"name":"Review Card","patternName":"ati-review-card-small"},"className":"overflow-hidden is-style-default","style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}},"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}}},"backgroundColor":"primary-500","textColor":"base","layout":{"type":"default"},"ariaLabel":"Review Card","linkDestination":"post"} -->
<div aria-label="Review Card" class="wp-block-group overflow-hidden is-style-default has-base-color has-primary-500-background-color has-text-color has-background has-link-color" style="border-top-left-radius:var(--wp--preset--border-radius--100);border-top-right-radius:var(--wp--preset--border-radius--100);border-bottom-left-radius:var(--wp--preset--border-radius--100);border-bottom-right-radius:var(--wp--preset--border-radius--100);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:group {"metadata":{"name":"Content"},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:post-featured-image {"aspectRatio":"1","height":"160px","style":{"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}}}} /-->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"metadata":{"name":"Reviewers"},"className":"center-vertically","style":{"dimensions":{"minHeight":"0rem"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group center-vertically" style="min-height:0rem"><!-- wp:post-title {"textAlign":"center","level":3,"isLink":true,"style":{"typography":{"fontStyle":"normal","fontWeight":"300"},"elements":{"link":{":hover":{"color":{"text":"var:preset|color|base"}},"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Review Content"},"layout":{"type":"default"}} -->
<div class="wp-block-group"><!-- wp:post-excerpt {"showMoreOnNewLine":false,"excerptLength":40,"className":"line-clamp-4","style":{"typography":{"fontStyle":"italic","fontWeight":"300"}},"fontSize":"200"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Location Row"},"className":"lsx-destination-to-review-wrapper","style":{"spacing":{"blockGap":"var:preset|spacing|10","padding":{"top":"var:preset|spacing|0","bottom":"var:preset|spacing|0","left":"var:preset|spacing|0","right":"var:preset|spacing|0"}}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group lsx-destination-to-review-wrapper" style="padding-top:var(--wp--preset--spacing--0);padding-right:var(--wp--preset--spacing--0);padding-bottom:var(--wp--preset--spacing--0);padding-left:var(--wp--preset--spacing--0)"><!-- wp:group {"className":"lsx-info-label","style":{"spacing":{"blockGap":"var:preset|spacing|10"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group lsx-info-label"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block --></div>
<!-- /wp:group -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"lsx/post-connection","args":{"key":"destination_to_review","parents":true}}}},"fontSize":"200","prefix":"Location: "} -->
<p class="has-200-font-size"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
