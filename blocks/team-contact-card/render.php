<?php
/**
 * Team Contact Card block render.
 *
 * Variables available from WordPress:
 *
 * @var array    $attributes Block attributes (color, spacing, border from supports).
 * @var string   $content    Inner content – unused, self-closing block.
 * @var WP_Block $block      Block instance; $block->context carries postId / postType
 *                           from the surrounding template, which is more reliable in
 *                           FSE context than get_queried_object_id().
 */

// Prefer block context (populated from the FSE template's main query) so the
// block works correctly when inserted into tour / accommodation / destination
// single-post templates via the Site Editor.
$post_id = ! empty( $block->context['postId'] )
	? intval( $block->context['postId'] )
	: get_queried_object_id();

if ( ! $post_id ) {
	return;
}

$post_type = get_post_type( $post_id );
$meta_key  = 'team_to_' . $post_type; // e.g. team_to_lsx-to-tour

$team_ids = get_post_meta( $post_id, $meta_key, true );
$team_ids = array_filter( (array) $team_ids );

if ( empty( $team_ids ) ) {
	return;
}

$team_id = intval( reset( $team_ids ) );
if ( ! $team_id ) {
	return;
}

$name      = get_the_title( $team_id );
$permalink = get_permalink( $team_id );
$thumbnail = get_the_post_thumbnail(
	$team_id,
	'medium',
	array(
		'class' => 'wp-post-image',
		'alt'   => esc_attr( $name ),
	)
);

if ( ! $name ) {
	return;
}

// get_block_wrapper_attributes() merges WordPress-generated classes / inline
// styles from block supports (background colour, padding, border-radius …)
// with our custom class, so editor sidebar controls affect the rendered output.
$wrapper_attributes = get_block_wrapper_attributes(
	array( 'class' => 'lsx-to-contact-widget' )
);

$thumb_html = '';
if ( $thumbnail ) {
	$thumb_html = sprintf(
		'<div class="lsx-to-contact-thumb"><a href="%s">%s</a></div>',
		esc_url( $permalink ),
		$thumbnail
	);
}

$info_html = sprintf(
	'<div class="lsx-to-contact-info">' .
		'<small class="lsx-to-contact-prefix">%s</small>' .
		'<h4 class="lsx-to-contact-name"><a href="%s">%s</a></h4>' .
	'</div>',
	esc_html__( 'Your travel expert:', 'ati-theme-2026' ),
	esc_url( $permalink ),
	esc_html( $name )
);

printf(
	'<div %s>%s%s</div>',
	$wrapper_attributes,
	$thumb_html,
	$info_html
);
