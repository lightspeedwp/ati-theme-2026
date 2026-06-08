<?php
/**
 * Title: ATI Blog Card
 * Slug: ati-theme-2026/ati-blog-card
 * Description: Vertical blog post card with featured image, title, publish date, reading time, category, excerpt, author name, and read-more button — for use in post query loops.
 * Categories: query, posts
 * Keywords: blog, post, article, card, news, listing
 * Viewport Width: 500
 * Block Types: core/post-template
 * Post Types: post
 * Inserter: true
 */
?>

<!-- wp:group {"metadata":{"name":"Blog Card","patternName":"ati-theme-2026/ati-blog-card"},"className":"overflow-hidden is-style-tour-card-light","style":{"spacing":{"blockGap":"0"},"border":{"radius":{"topLeft":"0","topRight":"0","bottomLeft":"0","bottomRight":"0"}}},"layout":{"type":"default"},"ariaLabel":"Blog Card","linkDestination":"post"} -->
<div aria-label="Blog Card" class="wp-block-group overflow-hidden is-style-tour-card-light" style="border-top-left-radius:0;border-top-right-radius:0;border-bottom-left-radius:0;border-bottom-right-radius:0"><!-- wp:post-featured-image {"aspectRatio":"3/2"} /-->

<!-- wp:group {"metadata":{"name":"Content"},"style":{"spacing":{"padding":{"right":"var:preset|spacing|30","left":"var:preset|spacing|30","top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|30"}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)"><!-- wp:group {"metadata":{"name":"Title"},"style":{"dimensions":{"minHeight":"0rem"},"spacing":{"padding":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="min-height:0rem;padding-top:0;padding-bottom:0"><!-- wp:post-title {"textAlign":"left","level":3,"isLink":true,"style":{"elements":{"link":{":hover":{"color":{"text":"var:preset|color|neutral-900"}},"color":{"text":"var:preset|color|contrast"}}},"typography":{"lineHeight":"1.25"}},"textColor":"contrast","fontSize":"400"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30"}},"border":{"top":{"color":"var:preset|color|accent-500","width":"1px"},"right":{},"bottom":{},"left":{}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="border-top-color:var(--wp--preset--color--accent-500);border-top-width:1px;padding-top:var(--wp--preset--spacing--30)"><!-- wp:group {"metadata":{"name":"Meta"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:post-date {"datetime":"2026-04-23T10:45:14.464Z","format":"j M Y","fontSize":"100"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:post-time-to-read {"fontSize":"100"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-terms {"term":"category","prefix":"Posted in: ","style":{"border":{"radius":{"topLeft":"0","topRight":"0","bottomLeft":"0","bottomRight":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Excerpt"},"className":"lsx-tour-info","style":{"spacing":{"padding":{"left":"0","right":"0","top":"0","bottom":"0"},"blockGap":"0"},"border":{"top":{"width":"0px","style":"none"},"bottom":{"width":"0px","style":"none"}}},"fontSize":"400","layout":{"type":"default"},"ariaLabel":"Tour details"} -->
<div aria-label="Tour details" class="wp-block-group lsx-tour-info has-400-font-size" style="border-top-style:none;border-top-width:0px;border-bottom-style:none;border-bottom-width:0px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:post-excerpt {"excerptLength":25,"className":"is-style-excerpt-truncate-4","fontSize":"200"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-terms {"term":"post_tag","prefix":"Tags: ","className":"is-style-default","style":{"typography":{"textTransform":"none","fontStyle":"italic","fontWeight":"400"}},"fontSize":"200"} /-->

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"right"}} -->
<div class="wp-block-group"><!-- wp:group {"metadata":{"blockVisibility":false},"style":{"spacing":{"blockGap":"5px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"cta-500","iconColorValue":"#AA653C","width":"24px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-cta-500-color" style="color:#AA653C;width:24px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:post-author-name {"fontSize":"200"} /--></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"base","textColor":"accent-500","hoverTextColor":"accent-600","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"}}},"spacing":{"padding":{"left":"0","right":"0","top":"0","bottom":"0"}},"typography":{"textTransform":"none"}},"icon":"arrow-right","iconSpacing":"0.2em"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-accent-500-color has-base-background-color has-text-color has-background has-link-color wp-element-button" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;text-transform:none">Read more</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->