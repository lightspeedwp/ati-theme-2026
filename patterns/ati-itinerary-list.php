<?php
/**
 * Title: ATI Itinerary List
 * Slug: ati-theme-2026/ati-itinerary-list
 * Description: Day-by-day tour itinerary list with image, day heading, description and per-day details (location, accommodation, type, drinks/room basis).
 * Categories: lsx-tour-operator
 * Keywords: itinerary, tour, days, schedule, route
 * Viewport Width: 1200
 * Block Types: core/post-content
 * Inserter: true
 */
?>

<!-- wp:group {"metadata":{"name":"Itinerary Day Loop","bindings":{"content":{"source":"lsx/tour-itinerary"}}},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-group alignwide"><!-- wp:columns {"metadata":{"categories":["lsx-tour-operator"],"patternName":"lsx-tour-operator/itinerary-list","name":"Itinerary Item"},"align":"full","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|30"},"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}},"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}},"shadow":"var:preset|shadow|200"},"backgroundColor":"base"} -->
<div class="wp-block-columns alignfull has-base-background-color has-background" style="border-top-left-radius:var(--wp--preset--border-radius--100);border-top-right-radius:var(--wp--preset--border-radius--100);border-bottom-left-radius:var(--wp--preset--border-radius--100);border-bottom-right-radius:var(--wp--preset--border-radius--100);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20);box-shadow:var(--wp--preset--shadow--200)"><!-- wp:column {"width":"25%"} -->
<div class="wp-block-column" style="flex-basis:25%"><!-- wp:group {"metadata":{"name":"Image"},"className":"itinerary-image","style":{"layout":{"selfStretch":"fixed","flexSize":"300px"},"dimensions":{"minHeight":"300px"},"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group itinerary-image" style="min-height:300px"><!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"medium","linkDestination":"none","className":"itinerary-image","style":{"border":{"radius":{"topLeft":"var:preset|border-radius|100","topRight":"var:preset|border-radius|100","bottomLeft":"var:preset|border-radius|100","bottomRight":"var:preset|border-radius|100"}},"layout":{"selfStretch":"fixed","flexSize":"300px"}}} -->
<figure class="wp-block-image size-medium has-custom-border itinerary-image"><img src="/wp-content/plugins/tour-operator/assets/img/blocks/placeholder.png" alt="Itinerary day image" style="border-top-left-radius:var(--wp--preset--border-radius--100);border-top-right-radius:var(--wp--preset--border-radius--100);border-bottom-left-radius:var(--wp--preset--border-radius--100);border-bottom-right-radius:var(--wp--preset--border-radius--100);aspect-ratio:1;object-fit:cover"/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-column"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|30","left":"var:preset|spacing|30"},"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}}} -->
<div class="wp-block-columns" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)"><!-- wp:column {"width":"60%","style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-column" style="flex-basis:60%"><!-- wp:group {"metadata":{"name":"Day Heading"},"style":{"border":{"bottom":{"width":"0px","style":"none"},"top":[],"right":[],"left":[]}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="border-bottom-style:none;border-bottom-width:0px"><!-- wp:heading {"level":3,"className":"itinerary-title","style":{"typography":{"fontStyle":"normal","fontWeight":"400"}},"fontSize":"400"} -->
<h3 class="wp-block-heading itinerary-title has-400-font-size" style="font-style:normal;font-weight:400">Day 1 - 3</h3>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Description"},"className":"itinerary-description-wrapper","style":{"spacing":{"blockGap":"var:preset|spacing|30"},"layout":{"selfStretch":"fixed","flexSize":"60%"}},"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group itinerary-description-wrapper"><!-- wp:paragraph {"className":"itinerary-description","style":{"spacing":{"margin":{"top":"0"}}}} -->
<p class="itinerary-description" style="margin-top:0">Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit. Maecenas vehicula auctor nisl, ut suscipit purus
                                consectetur dictum. Sed dapibus congue dolor sed iaculis. Fusce in molestie metus, vitae
                                commodo nibh.</p>
<!-- /wp:paragraph -->

<!-- wp:read-more {"content":"Read more","hoverTextColor":"cta-500","className":"is-style-default","style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"elements":{"link":{"color":{"text":"var:preset|color|accent-500"}}}},"textColor":"accent-500"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"40%"} -->
<div class="wp-block-column" style="flex-basis:40%"><!-- wp:group {"metadata":{"name":"Information"},"className":"lsx-itinerary-info","style":{"border":{"radius":"0.5rem"},"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group lsx-itinerary-info" style="border-radius:0.5rem"><!-- wp:group {"metadata":{"name":"Location Row"},"className":"itin-location-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group itin-location-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M249.94,120.24l-27.05-6.76a95.86,95.86,0,0,0-80.37-80.37l-6.76-27a8,8,0,0,0-15.52,0l-6.76,27.05a95.86,95.86,0,0,0-80.37,80.37l-27,6.76a8,8,0,0,0,0,15.52l27.05,6.76a95.86,95.86,0,0,0,80.37,80.37l6.76,27.05a8,8,0,0,0,15.52,0l6.76-27.05a95.86,95.86,0,0,0,80.37-80.37l27.05-6.76a8,8,0,0,0,0-15.52Zm-95.49,22.9L139.31,128l15.14-15.14L215,128Zm-52.9,0L41,128l60.57-15.14L116.69,128ZM205.77,109.2,158.6,97.4,146.8,50.23A79.88,79.88,0,0,1,205.77,109.2Zm-62.63-7.65L128,116.69l-15.14-15.14L128,41ZM109.2,50.23,97.4,97.4,50.23,109.2A79.88,79.88,0,0,1,109.2,50.23Zm-59,96.57L97.4,158.6l11.8,47.17A79.88,79.88,0,0,1,50.23,146.8Zm62.63,7.65L128,139.31l15.14,15.14L128,215Zm33.94,51.32,11.8-47.17,47.17-11.8A79.88,79.88,0,0,1,146.8,205.77Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"metadata":{"name":"Location Value"},"className":"itinerary-location","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200","prefix":"Location: "} -->
<p class="itinerary-location has-link-color has-200-font-size">Card Link</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Accommodation Row"},"className":"itin-accommodation-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group itin-accommodation-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M240,208H224V136l2.34,2.34A8,8,0,0,0,237.66,127L139.31,28.68a16,16,0,0,0-22.62,0L18.34,127a8,8,0,0,0,11.32,11.31L32,136v72H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM48,120l80-80,80,80v88H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48Zm96,88H112V160h32Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"metadata":{"name":"Accommodation Value"},"className":"itinerary-accommodation","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200","prefix":"Accommodation: "} -->
<p class="itinerary-accommodation has-link-color has-200-font-size">Card Link</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Type Row"},"className":"itin-type-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group itin-type-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H48V120l80-80,80,80Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"metadata":{"name":"Type Value"},"className":"itinerary-type","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200","prefix":"Type: "} -->
<p class="itinerary-type has-link-color has-200-font-size">Card Link</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Drinks Basis Row"},"className":"itin-drinks-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group itin-drinks-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M206,26.69A8,8,0,0,0,200,24H56a8,8,0,0,0-7.94,9l23.15,193A16,16,0,0,0,87.1,240h81.8a16,16,0,0,0,15.89-14.09L207.94,33A8,8,0,0,0,206,26.69ZM191,40,188.1,64H67.9L65,40ZM168.9,224H87.1L69.82,80H186.18Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"metadata":{"name":"Drinks Basis Value"},"className":"itinerary-drinks","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200","prefix":"Drinks basis: "} -->
<p class="itinerary-drinks has-link-color has-200-font-size">Card Link</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"name":"Room Basis Row"},"className":"itin-room-wrapper","style":{"spacing":{"blockGap":"0.3125rem"},"typography":{"fontStyle":"normal","fontWeight":"500"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group itin-room-wrapper" style="font-style:normal;font-weight:500"><!-- wp:outermost/icon-block {"iconName":"","iconColor":"accent-500","iconColorValue":"#AA653C","width":"20px"} -->
<div class="wp-block-outermost-icon-block"><div class="icon-container has-icon-color has-accent-500-color" style="color:#AA653C;width:20px;transform:rotate(0deg) scaleX(1) scaleY(1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M24,184H232a8,8,0,0,0,0-16h-8V152a96.12,96.12,0,0,0-88-95.66V40h16a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16h16V56.34A96.12,96.12,0,0,0,32,152v16H24a8,8,0,0,0,0,16Zm24-32a80,80,0,0,1,160,0v16H48Zm192,56a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16H232A8,8,0,0,1,240,208Z"></path></svg></div></div>
<!-- /wp:outermost/icon-block -->

<!-- wp:paragraph {"metadata":{"name":"Room Basis Value"},"className":"itinerary-room","style":{"elements":{"link":{"color":{"text":"var:preset|color|accent-500"},":hover":{"color":{"text":"var:preset|color|accent-600"}}}}},"fontSize":"200","prefix":"Room basis: "} -->
<p class="itinerary-room has-link-color has-200-font-size">Card Link</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
