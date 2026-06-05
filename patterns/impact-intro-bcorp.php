<?php
/**
 * Title: Impact Intro B Corp
 * Slug: impact-intro-bcorp
 * Description: Two-column intro section with "Meaningful journeys" copy on the left and B Corp certification panel on the right.
 * Theme: ati-theme-2026
 * Inserter: yes
 */

$bcorp_logo = esc_url( get_theme_file_uri( 'assets/logos/partners/bcorp-certified.png' ) );
?>
<!-- wp:group {"metadata":{"name":"Impact Intro & B Corp"},"className":"is-style-ati-page-section-default","align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull is-style-ati-page-section-default">

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|80"}}}} -->
<div class="wp-block-columns alignwide">

<!-- wp:column {"width":"58%","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-column" style="flex-basis:58%">

<!-- wp:heading {"style":{"typography":{"fontWeight":"300"}}} -->
<h2 class="wp-block-heading" style="font-weight:300">Meaningful journeys.<br>Lasting impact.</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Travel has the power to protect wild places, uplift communities and create a better future. At ATI Holidays, we're committed to using our business as a force for good—today and for generations to come.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"button-full-width-false button-3d-false","href":"/about/"} -->
<div class="wp-block-button button-full-width-false button-3d-false"><a class="wp-block-button__link wp-element-button" href="/about/">Our Approach</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

</div>
<!-- /wp:column -->

<!-- wp:column {"width":"42%","style":{"spacing":{"blockGap":"var:preset|spacing|30","padding":{"left":"var:preset|spacing|50"}},"border":{"left":{"color":"var:preset|color|neutral-200","width":"1px"}}}} -->
<div class="wp-block-column" style="flex-basis:42%;border-left-color:var(--wp--preset--color--neutral-200);border-left-width:1px;border-left-style:solid;padding-left:var(--wp--preset--spacing--50)">

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontWeight":"300","fontSize":"0.875rem","textTransform":"uppercase","letterSpacing":"0.1em"}},"textColor":"neutral-600"} -->
<p class="has-text-align-center has-neutral-600-color has-text-color" style="font-weight:300;font-size:0.875rem;letter-spacing:0.1em;text-transform:uppercase">Proud to be</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div style="text-align:center;margin-block:0">
<img src="<?php echo $bcorp_logo; ?>" alt="Certified B Corporation" width="140" height="auto" loading="lazy" style="display:inline-block;max-width:140px;height:auto">
</div>
<!-- /wp:html -->

<!-- wp:paragraph {"fontSize":"200"} -->
<p class="has-200-font-size">ATI Holidays became a Certified B Corporation in 2024, reflecting our commitment to balancing memorable guest experiences with responsibility to people, communities, and the environment.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"200"} -->
<p class="has-200-font-size"><strong>115.6 B Impact Score</strong> — well above the 80 points required for certification and the 50.9 median score for ordinary businesses.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline button-full-width-false button-3d-false","href":"https://www.bcorporation.net/en-us/find-a-b-corp/company/africa-tourist-info-cc/"} -->
<div class="wp-block-button is-style-outline button-full-width-false button-3d-false"><a class="wp-block-button__link wp-element-button" href="https://www.bcorporation.net/en-us/find-a-b-corp/company/africa-tourist-info-cc/">Learn More About B Corp</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

</div>
<!-- /wp:column -->

</div>
<!-- /wp:columns -->

</div>
<!-- /wp:group -->
