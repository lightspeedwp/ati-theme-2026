<?php
/**
 * WP-CLI: move Tour Operator 1.x / WETU field values to the 2.x storage.
 *
 * @package ATI_Theme_2026
 */

/**
 * Fixes field values the WETU importer and Tour Operator 1.x stored in a shape
 * Tour Operator 2.x cannot read.
 *
 * - Multi-value fields (spoken languages, special interests, best time to visit,
 *   suggested visitor types) were saved as one row holding an array. TO 2.x
 *   registers them `single => false` (one row per value) and drops array rows as
 *   "old data", so the row is shown with no values.
 * - Check-in time holds a copy of the accommodation's map location (address,
 *   lat, long, zoom), which TO 2.x prints as "Check in time: 49 Marine drive, …".
 *   Live shows no check-in row for these. The row is removed; the post's own
 *   `location` is untouched (and reported if it is empty).
 * - Connection lists (`*_to_*`) point at deleted posts and revisions, which
 *   makes Tour Operator hide the row (see prune_connections()).
 * - Booking validity dates are text, which TO 2.x prints as nothing.
 *
 * Run once per site after migrating from 1.x:
 *
 *     wp ati-meta split-multi-values            # dry run: report only
 *     wp ati-meta split-multi-values --apply    # write
 *     wp ati-meta clean-checkin-times [--apply]
 *     wp ati-meta prune-connections [--apply]
 *     wp ati-meta convert-booking-dates [--apply]
 */
class ATI_TO_Meta_Migration {

	/**
	 * Split array rows of multi-value fields into one row per value.
	 *
	 * Values are matched to Tour Operator's option values where they differ only
	 * by `-` / `_` (WETU's `beach-coastal` is TO's `beach_coastal`), so the admin
	 * select shows them as chosen.
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Write the changes. Without it, only report what would change.
	 *
	 * @subcommand split-multi-values
	 *
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Associative arguments.
	 */
	public function split_multi_values( $args, $assoc_args ) {
		global $wpdb;

		$apply = ! empty( $assoc_args['apply'] );
		$keys  = ATI_TO_Multi_Value_Labels::KEYS;
		$in    = implode( ', ', array_fill( 0, count( $keys ), '%s' ) );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $in is placeholders only.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT m.meta_id, m.post_id, m.meta_key, m.meta_value, p.post_type FROM {$wpdb->postmeta} m
				 JOIN {$wpdb->posts} p ON p.ID = m.post_id
				 WHERE m.meta_key IN ({$in}) AND m.meta_value LIKE %s",
				array_merge( $keys, array( 'a:%' ) )
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$changed = array();

		foreach ( $rows as $row ) {
			$values = $this->flatten( maybe_unserialize( $row->meta_value ), $row->post_type, $row->meta_key );
			$label  = $row->post_type . ' ' . $row->meta_key;

			$changed[ $label ] = ( $changed[ $label ] ?? 0 ) + 1;

			if ( ! $apply ) {
				continue;
			}

			$existing = get_post_meta( (int) $row->post_id, $row->meta_key, false );
			delete_metadata_by_mid( 'post', (int) $row->meta_id );

			foreach ( $values as $value ) {
				if ( ! in_array( $value, $existing, true ) ) {
					add_post_meta( (int) $row->post_id, $row->meta_key, $value );
				}
			}
		}

		$this->report( count( $rows ), $changed, $apply, 'split' );
	}

	/**
	 * Remove check-in times that hold a map location instead of a time.
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Write the changes. Without it, only report what would change.
	 *
	 * @subcommand clean-checkin-times
	 *
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Associative arguments.
	 */
	public function clean_checkin_times( $args, $assoc_args ) {
		global $wpdb;

		$apply = ! empty( $assoc_args['apply'] );

		$rows = $wpdb->get_results(
			"SELECT m.meta_id, m.post_id, m.meta_key, m.meta_value, p.post_type FROM {$wpdb->postmeta} m
			 JOIN {$wpdb->posts} p ON p.ID = m.post_id
			 WHERE m.meta_key IN ('checkin_time', 'checkout_time') AND m.meta_value LIKE 'a:%'"
		);

		$changed = array();

		foreach ( $rows as $row ) {
			$value = maybe_unserialize( $row->meta_value );

			if ( ! is_array( $value ) || ! array_intersect( array( 'address', 'lat', 'long' ), array_keys( $value ) ) ) {
				WP_CLI::warning( sprintf( 'Post %d %s is an array but not a location; left alone.', $row->post_id, $row->meta_key ) );
				continue;
			}

			if ( empty( get_post_meta( (int) $row->post_id, 'location', true ) ) ) {
				WP_CLI::warning( sprintf( 'Post %d has no location of its own; its %s copy is the only one.', $row->post_id, $row->meta_key ) );
			}

			$label             = $row->post_type . ' ' . $row->meta_key;
			$changed[ $label ] = ( $changed[ $label ] ?? 0 ) + 1;

			if ( $apply ) {
				delete_metadata_by_mid( 'post', (int) $row->meta_id );
			}
		}

		$this->report( count( $rows ), $changed, $apply, 'removed' );
	}

	/**
	 * Store booking validity dates as timestamps.
	 *
	 * Tour Operator 1.x saved them as text ("November 24, 2025"); 2.x saves a
	 * `text_date_timestamp` (UTC midnight) and prints it with wp_date(), which
	 * shows nothing for text. The Booking validity row was empty on every
	 * special card and fast facts box as a result.
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Write the changes. Without it, only report what would change.
	 *
	 * @subcommand convert-booking-dates
	 *
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Associative arguments.
	 */
	public function convert_booking_dates( $args, $assoc_args ) {
		global $wpdb;

		$apply = ! empty( $assoc_args['apply'] );

		$rows = $wpdb->get_results(
			"SELECT m.meta_id, m.post_id, m.meta_key, m.meta_value, p.post_type FROM {$wpdb->postmeta} m
			 JOIN {$wpdb->posts} p ON p.ID = m.post_id
			 WHERE m.meta_key IN ('booking_validity_start', 'booking_validity_end')"
		);

		$changed = array();

		foreach ( $rows as $row ) {
			$value = trim( (string) $row->meta_value );

			if ( '' === $value || ctype_digit( $value ) ) {
				continue;
			}

			$timestamp = strtotime( $value . ' 00:00:00 UTC' );

			if ( false === $timestamp ) {
				WP_CLI::warning( sprintf( 'Post %d %s "%s" is not a date; left alone.', $row->post_id, $row->meta_key, $value ) );
				continue;
			}

			$label             = $row->post_type . ' ' . $row->meta_key;
			$changed[ $label ] = ( $changed[ $label ] ?? 0 ) + 1;

			if ( $apply ) {
				update_metadata_by_mid( 'post', (int) $row->meta_id, (string) $timestamp );
			}
		}

		$this->report( count( $rows ), $changed, $apply, 'converted' );
	}

	/**
	 * Remove connections to posts that no longer exist.
	 *
	 * Tour Operator hides a card or fact row (`lsx-<key>-wrapper`) when
	 * Query_Loop::post_ids_exist() finds none of the connected posts. It passes
	 * the IDs as one `ID IN (%s)` string, so MySQL checks only the FIRST ID, and
	 * only for `publish` / `draft`. WETU left deleted posts and revisions in these
	 * lists (Okonjima Bush Suite: `[15326, 175]`, 15326 deleted), which hides the
	 * Location row although Namibia is connected.
	 *
	 * Missing IDs are dropped, revisions are replaced by the post they belong to,
	 * and published / draft IDs are put first. Each row keeps its shape (an array
	 * row stays an array; a single-ID row is updated or removed).
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Write the changes. Without it, only report what would change.
	 *
	 * @subcommand prune-connections
	 *
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Associative arguments.
	 */
	public function prune_connections( $args, $assoc_args ) {
		global $wpdb;

		$apply = ! empty( $assoc_args['apply'] );

		$rows = $wpdb->get_results(
			"SELECT m.meta_id, m.post_id, m.meta_key, m.meta_value, p.post_type FROM {$wpdb->postmeta} m
			 JOIN {$wpdb->posts} p ON p.ID = m.post_id
			 WHERE m.meta_key REGEXP '^(accommodation|activity|destination|post|review|special|team|tour|vehicle)_to_(accommodation|activity|destination|post|review|special|team|tour|vehicle)$'
			 ORDER BY m.meta_id"
		);

		$posts   = $wpdb->get_results( "SELECT ID, post_parent, post_type, post_status FROM {$wpdb->posts}", OBJECT_K );
		$changed = array();
		$seen    = array();

		foreach ( $rows as $row ) {
			$stored  = maybe_unserialize( $row->meta_value );
			$ids     = $this->live_ids( is_array( $stored ) ? $stored : array( $stored ), $posts );
			$post_id = (int) $row->post_id;
			$label   = $row->post_type . ' ' . $row->meta_key;

			if ( is_array( $stored ) ) {
				$current = array_values( array_map( 'strval', array_filter( $stored, 'is_scalar' ) ) );

				if ( $ids === $current ) {
					continue;
				}

				$changed[ $label ] = ( $changed[ $label ] ?? 0 ) + 1;

				if ( $apply ) {
					if ( $ids ) {
						update_metadata_by_mid( 'post', (int) $row->meta_id, $ids );
					} else {
						delete_metadata_by_mid( 'post', (int) $row->meta_id );
					}
				}
				continue;
			}

			// One ID per row: drop it when dead or already present for this post and key.
			$key = $post_id . '|' . $row->meta_key;
			$id  = $ids[0] ?? '';

			$keep = '' !== $id && empty( $seen[ $key ][ $id ] );

			if ( $keep ) {
				$seen[ $key ][ $id ] = true;

				if ( (string) $stored === $id ) {
					continue;
				}
			}

			$changed[ $label ] = ( $changed[ $label ] ?? 0 ) + 1;

			if ( $apply ) {
				if ( $keep ) {
					update_metadata_by_mid( 'post', (int) $row->meta_id, $id );
				} else {
					delete_metadata_by_mid( 'post', (int) $row->meta_id );
				}
			}
		}

		$this->report( count( $rows ), $changed, $apply, 'pruned' );
	}

	/**
	 * Connected IDs that still point at a post, revisions resolved, live ones first.
	 *
	 * @param array $ids   Stored IDs.
	 * @param array $posts All posts (ID => ID, post_parent, post_type, post_status).
	 * @return string[]
	 */
	public function live_ids( array $ids, array $posts ) {
		$live  = array();
		$other = array();

		foreach ( $ids as $id ) {
			if ( ! is_scalar( $id ) || ! isset( $posts[ (int) $id ] ) ) {
				continue;
			}

			$post = $posts[ (int) $id ];

			if ( 'revision' === $post->post_type ) {
				$post = $posts[ (int) $post->post_parent ] ?? null;

				if ( ! $post ) {
					continue;
				}
			}

			if ( in_array( $post->post_status, array( 'publish', 'draft' ), true ) ) {
				$live[] = (string) $post->ID;
			} elseif ( ! in_array( $post->post_status, array( 'trash', 'auto-draft', 'inherit' ), true ) ) {
				$other[] = (string) $post->ID;
			}
		}

		return array_values( array_unique( array_merge( $live, $other ) ) );
	}

	/**
	 * Flatten a stored array into unique scalar values, matched to TO's options.
	 *
	 * @param mixed  $stored    Unserialized meta value.
	 * @param string $post_type Post type.
	 * @param string $meta_key  Meta key.
	 * @return string[]
	 */
	public function flatten( $stored, $post_type, $meta_key ) {
		$values  = array();
		$options = $this->option_values( $post_type, $meta_key );

		array_walk_recursive(
			$stored,
			static function ( $value ) use ( &$values ) {
				if ( is_scalar( $value ) && '' !== trim( (string) $value ) ) {
					$values[] = trim( (string) $value );
				}
			}
		);

		foreach ( $values as $i => $value ) {
			$normalised = str_replace( '-', '_', strtolower( $value ) );

			foreach ( $options as $option ) {
				if ( str_replace( '-', '_', strtolower( $option ) ) === $normalised ) {
					$values[ $i ] = $option;
					break;
				}
			}
		}

		return array_values( array_unique( $values ) );
	}

	/**
	 * Option values Tour Operator offers for a field, from its post-type JSON.
	 *
	 * @param string $post_type Post type.
	 * @param string $meta_key  Meta key.
	 * @return string[]
	 */
	private function option_values( $post_type, $meta_key ) {
		static $cache = array();

		if ( ! isset( $cache[ $post_type ] ) ) {
			$cache[ $post_type ] = array();
			$file                = WP_PLUGIN_DIR . '/tour-operator/post-types/' . sanitize_file_name( $post_type ) . '.json';

			if ( is_readable( $file ) ) {
				$config = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local file.

				foreach ( (array) ( $config['fields'] ?? array() ) as $field ) {
					if ( ! empty( $field['slug'] ) && ! empty( $field['options'] ) ) {
						$cache[ $post_type ][ $field['slug'] ] = array_filter( wp_list_pluck( $field['options'], 'value' ) );
					}
				}
			}
		}

		return $cache[ $post_type ][ $meta_key ] ?? array();
	}

	/**
	 * Print the summary.
	 *
	 * @param int    $scanned Rows scanned.
	 * @param array  $changed Counts by "post_type meta_key".
	 * @param bool   $apply   Whether changes were written.
	 * @param string $verb    What happens to a row.
	 */
	private function report( $scanned, array $changed, $apply, $verb ) {
		WP_CLI::log( sprintf( 'Rows scanned: %d', $scanned ) );
		foreach ( $changed as $label => $count ) {
			WP_CLI::log( sprintf( '  %s: %d %s', $label, $count, $apply ? $verb : 'to be ' . $verb ) );
		}

		if ( $apply ) {
			wp_cache_flush();
			WP_CLI::success( 'Done.' );
		} else {
			WP_CLI::log( 'Dry run. Pass --apply to write.' );
		}
	}
}
