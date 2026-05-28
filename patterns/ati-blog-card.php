<?php
/**
 * Title: ATI Blog Card
 * Slug: ati-blog-card
 * Theme: ati-theme-2026
 * Inserter: yes
 */
?>

<!-- wp:group {"metadata":{"name":"Blog Card"},"className":"overflow-hidden is-style-ati-tour-card","style":{"spacing":{"blockGap":"0"},"border":{"radius":"0.5rem"}},"layout":{"type":"default"},"ariaLabel":"Blog Card","linkDestination":"post"} -->
<div aria-label="Tour Card" class="wp-block-group overflow-hidden is-style-ati-tour-card" style="border-radius:0.5rem"><!-- wp:cover {"useFeaturedImage":true,"dimRatio":0,"customOverlayColor":"#FFF","isUserOverlayColor":false,"contentPosition":"top left","isDark":false,"style":{"dimensions":{"aspectRatio":"3/2"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-cover is-light has-custom-content-position is-position-top-left"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#FFF"></span><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"placeholder":"Write title…","style":{"typography":{"textAlign":"center"}},"fontSize":"600"} -->
<p class="has-text-align-center has-600-font-size"></p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"metadata":{"name":"Content"},"style":{"spacing":{"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:post-terms {"term":"category","className":"is-style-default","style":{"typography":{"textTransform":"uppercase"},"elements":{"link":{"color":{"text":"var:preset|color|primary-500"},":hover":{"color":{"text":"var:preset|color|cta-500"}}}}},"fontSize":"100"} /-->

<!-- wp:group {"metadata":{"name":"Title"},"className":"center-vertically","style":{"dimensions":{"minHeight":"0rem"},"spacing":{"padding":{"top":"0","bottom":"0"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left","verticalAlignment":"top"}} -->
<div class="wp-block-group center-vertically" style="min-height:0rem;padding-top:0;padding-bottom:0"><!-- wp:post-title {"textAlign":"left","level":3,"isLink":true,"style":{"elements":{"link":{":hover":{"color":{"text":"var:preset|color|neutral-900"}}}},"typography":{"lineHeight":"1.25"}},"fontSize":"400"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Excerpt"},"className":"lsx-tour-info","style":{"spacing":{"padding":{"left":"0","right":"0","top":"0","bottom":"0"},"blockGap":"0"},"border":{"top":{"width":"0px","style":"none"},"bottom":{"width":"0px","style":"none"}}},"fontSize":"400","layout":{"type":"default"},"ariaLabel":"Tour details"} -->
<div aria-label="Tour details" class="wp-block-group lsx-tour-info has-400-font-size" style="border-top-style:none;border-top-width:0px;border-bottom-style:none;border-bottom-width:0px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:post-excerpt {"excerptLength":25,"className":"is-style-excerpt-truncate-4","fontSize":"200"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->