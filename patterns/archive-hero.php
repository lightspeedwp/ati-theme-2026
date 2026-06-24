<?php
/**
 * Title: Archive Hero
 * Slug: ati-theme-2026/archive-hero
 * Description: Full-width hero section for archive pages featuring a background image, prominent heading, and tagline.
 * Categories: featured, header
 * Keywords: hero, archive, banner, heading, tagline, tours
 * Viewport Width: 1280
 * Block Types: core/group
 * Template Types: archive
 * Inserter: true
 */
?>


<!-- wp:group {"metadata":{"name":"Archive Hero"},"align":"full","style":{"spacing":{"margin":{"top":"var:preset|spacing|0","bottom":"var:preset|spacing|0"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:var(--wp--preset--spacing--0);margin-bottom:var(--wp--preset--spacing--0)"><!-- wp:cover {"useFeaturedImage":true,"dimRatio":40,"overlayColor":"contrast","isUserOverlayColor":true,"minHeight":50,"contentPosition":"center center","isDark":false,"tagName":"section","metadata":{"name":"Hero"},"className":"alignfull is-style-default","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"var:preset|spacing|0","bottom":"var:preset|spacing|80","right":"var:preset|spacing|0","left":"var:preset|spacing|0"},"blockGap":"var:preset|spacing|70"}},"layout":{"type":"constrained"}} -->
<section class="wp-block-cover is-light alignfull is-style-default" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--0);padding-right:var(--wp--preset--spacing--0);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--0);min-height:50px"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-40 has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:block {"ref":22500} /-->

<!-- wp:group {"align":"wide","style":{"dimensions":{"minHeight":"0px"},"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|40","right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"layout":{"type":"constrained","justifyContent":"center","contentSize":"1100px"}} -->
<div class="wp-block-group alignwide" style="min-height:0px;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--20)"><!-- wp:query-title {"type":"archive","textAlign":"center","showPrefix":false,"align":"wide","className":"is-style-shadow-text","style":{"typography":{"fontStyle":"normal","fontWeight":"500","textAlign":"center"},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base","fontSize":"900"} /-->

<!-- wp:paragraph {"metadata":{"name":"Tagline","bindings":{"content":{"source":"lsx/post-meta","args":{"key":"tagline"}}}},"className":"lsx-tagline-wrapper is-style-shadow-text has-base-color has-text-color has-link-color","style":{"typography":{"textAlign":"center"},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} -->
<p class="has-text-align-center lsx-tagline-wrapper is-style-shadow-text has-base-color has-text-color has-link-color"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div></section>
<!-- /wp:cover --></div>
<!-- /wp:group -->
