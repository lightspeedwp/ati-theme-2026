<?php
/**
 * Title: ATI Room Card
 * Slug: ati-theme-2026/ati-room-card
 * Description: Room card for accommodation pages showing room image, name, description and amenities.
 * Categories: lsx-tour-operator
 * Keywords: room, accommodation, lodge, suite, amenities
 * Viewport Width: 500
 * Block Types: core/post-template
 * Inserter: true
 */
?>

<!-- wp:group {"metadata":{"name":"Accommodation Units","bindings":{"content":{"source":"lsx/accommodation-units","type":"rooms"}}},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-group alignwide"><!-- wp:columns {"metadata":{"patternName":"lsx-tour-operator/room-card","name":"Room Card","description":"A horizontal card layout for accommodation units with image, description, and pricing.","categories":["lsx-tour-operator"]},"align":"full","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|30"},"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}},"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}},"shadow":"var:preset|shadow|200"},"backgroundColor":"base"} -->
<div class="wp-block-columns alignfull has-base-background-color has-background" style="border-top-left-radius:var(--wp--preset--border-radius--100);border-top-right-radius:var(--wp--preset--border-radius--100);border-bottom-left-radius:var(--wp--preset--border-radius--100);border-bottom-right-radius:var(--wp--preset--border-radius--100);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20);box-shadow:var(--wp--preset--shadow--200)"><!-- wp:column {"width":"25%"} -->
<div class="wp-block-column" style="flex-basis:25%"><!-- wp:group {"metadata":{"name":"Image"},"className":"lsx-unit-image","style":{"layout":{"selfStretch":"fixed","flexSize":"275px"},"dimensions":{"minHeight":"275px"},"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group lsx-unit-image" style="min-height:275px"><!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"medium","linkDestination":"none","className":"unit-image","style":{"border":{"radius":"0.5rem"},"layout":{"selfStretch":"fixed","flexSize":"275px"}}} -->
<figure class="wp-block-image size-medium has-custom-border unit-image"><img src="/wp-content/plugins/tour-operator/assets/img/blocks/placeholder.png" alt="Room image" style="border-radius:0.5rem;aspect-ratio:1;object-fit:cover"/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-column"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|30"},"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
<div class="wp-block-columns" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:column {"width":"60%","style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-column" style="flex-basis:60%"><!-- wp:group {"metadata":{"name":"Room Heading"},"style":{"border":{"bottom":{"width":"0px","style":"none"},"top":[],"right":[],"left":[]}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="border-bottom-style:none;border-bottom-width:0px"><!-- wp:heading {"level":3,"className":"unit-title","style":{"typography":{"fontStyle":"normal","fontWeight":"400"}},"fontSize":"400"} -->
<h3 class="wp-block-heading unit-title has-400-font-size" style="font-style:normal;font-weight:400">Room Title</h3>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Description"},"className":"unit-description-wrapper","style":{"spacing":{"blockGap":"var:preset|spacing|30"},"layout":{"selfStretch":"fixed","flexSize":"60%"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group unit-description-wrapper"><!-- wp:paragraph {"className":"unit-description","style":{"spacing":{"margin":{"top":"0"}}}} -->
<p class="unit-description" style="margin-top:0">Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit. Maecenas vehicula auctor nisl, ut suscipit purus
                                consectetur dictum. Sed dapibus congue dolor sed iaculis. Fusce in molestie metus, vitae
                                commodo nibh.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%"><!-- wp:group {"metadata":{"name":"Information"},"className":"lsx-unit-info","style":{"border":{"radius":"0.5rem"},"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group lsx-unit-info" style="border-radius:0.5rem"><!-- wp:group {"className":"unit-price-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group unit-price-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"24px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:24px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"className":"unit-price amount","fontSize":"200","prefix":"From:"} -->
<p class="unit-price amount has-200-font-size"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"unit-type-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group unit-type-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"24px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:24px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H48V120l80-80,80,80Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"className":"unit-type","fontSize":"200","prefix":"Unit Type: "} -->
<p class="unit-type has-200-font-size"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
