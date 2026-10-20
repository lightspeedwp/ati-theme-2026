<?php
/**
 * Readable labels for Tour Operator's multi-value fields.
 *
 * @package ATI_Theme_2026
 */

/**
 * Tour Operator 2.x prints the stored option values of its multi-value fields
 * as they are ("english, afrikaans, xhosa"). Live (TO 1.x) shows them title-cased
 * with separators as spaces ("English, Afrikaans, Xhosa", "Beach Coastal").
 */
class ATI_TO_Multi_Value_Labels {

	/**
	 * Tour Operator's multi-value fields (Bindings::post_meta_callback()).
	 */
	const KEYS = array( 'best_time_to_visit', 'spoken_languages', 'suggested_visitor_types', 'special_interests' );

	/**
	 * Register the hooks.
	 */
	public function register() {
		add_filter( 'lsx_to_custom_field_query', array( $this, 'label_values' ), 10, 5 );
	}

	/**
	 * Replace stored values with readable labels.
	 *
	 * @param string $html     Field output.
	 * @param string $meta_key Meta key.
	 * @param mixed  $value    Stored value(s), comma-joined.
	 * @param string $before   Markup before the value.
	 * @param string $after    Markup after the value.
	 * @return string
	 */
	public function label_values( $html, $meta_key, $value, $before = '', $after = '' ) {
		if ( ! in_array( $meta_key, self::KEYS, true ) || ! is_string( $value ) ) {
			return $html;
		}

		$labels = array_map( array( $this, 'label' ), explode( ', ', $value ) );

		return $before . esc_html( implode( ', ', $labels ) ) . $after;
	}

	/**
	 * Readable label for one stored value.
	 *
	 * @param string $value Stored value, e.g. `beach-coastal`.
	 * @return string
	 */
	public function label( $value ) {
		return ucwords( str_replace( array( '-', '_' ), ' ', trim( $value ) ) );
	}
}
