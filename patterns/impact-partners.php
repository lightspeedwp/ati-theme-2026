<?php
/**
 * Title: Impact Trusted Partners
 * Slug: impact-partners
 * Description: Centred section with "Working with trusted partners" heading and a row of five partner logos.
 * Theme: ati-theme-2026
 * Inserter: yes
 */

$tosco_logo          = esc_url( get_theme_file_uri( 'assets/logos/partners/tosco.png' ) );
$natural_selection   = esc_url( get_theme_file_uri( 'assets/logos/partners/natural-selection.svg' ) );
$long_run_logo       = esc_url( get_theme_file_uri( 'assets/logos/partners/the-long-run.webp' ) );
$pack_logo           = esc_url( get_theme_file_uri( 'assets/logos/partners/pack-for-a-purpose.webp' ) );
$citw_logo           = esc_url( get_theme_file_uri( 'assets/logos/partners/children-in-the-wilderness.jpg' ) );
?>
<!-- wp:group {"metadata":{"name":"Trusted Partners"},"className":"is-style-ati-page-section-default","align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull is-style-ati-page-section-default">

<!-- wp:heading {"textAlign":"center","style":{"typography":{"fontWeight":"300"}}} -->
<h2 class="wp-block-heading has-text-align-center" style="font-weight:300">Working with trusted partners</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:3rem;margin-block:var(--wp--preset--spacing--40,2.5rem)">
	<img src="<?php echo $tosco_logo; ?>" alt="TOSCO Trust" height="60" style="height:60px;width:auto;object-fit:contain;display:block">
	<img src="<?php echo $natural_selection; ?>" alt="Natural Selection" height="60" style="height:60px;width:auto;max-width:180px;object-fit:contain;display:block">
	<img src="<?php echo $long_run_logo; ?>" alt="The Long Run – helping nature thrive" height="60" style="height:60px;width:auto;object-fit:contain;display:block">
	<img src="<?php echo $pack_logo; ?>" alt="Pack for a Purpose" height="60" style="height:60px;width:auto;object-fit:contain;display:block">
	<img src="<?php echo $citw_logo; ?>" alt="Children in the Wilderness" height="60" style="height:60px;width:auto;object-fit:contain;display:block">
</div>
<!-- /wp:html -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline button-full-width-false button-3d-false"} -->
<div class="wp-block-button is-style-outline button-full-width-false button-3d-false"><a class="wp-block-button__link wp-element-button">Meet Our Partners</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

</div>
<!-- /wp:group -->
