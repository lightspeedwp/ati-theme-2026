<?php
/**
 * WP-CLI: move Tour Operator 1.x map coordinates to the 2.x keys.
 *
 * @package ATI_Theme_2026
 */

/**
 * Copies `location[lat|long]` (Tour Operator 1.x, and the WETU importer) to
 * `location[latitude|longitude]` (Tour Operator 2.x).
 *
 * Both keys are always written, empty when the post has no coordinates, because
 * Maps::map_output() only skips a marker whose `longitude` is set and empty. The
 * 1.x keys are kept. Tour Operator's cached map data (`{post_id}_location`
 * transients) is cleared so the maps are rebuilt from the new keys.
 *
 * Run once per site after migrating from 1.x:
 *
 *     wp ati-maps migrate-locations           # dry run: report only
 *     wp ati-maps migrate-locations --apply   # write
 */
class ATI_TO_Maps_Location_Migration {

	/**
	 * Copy 1.x coordinates to the 2.x keys.
	 *
	 * ## OPTIONS
	 *
	 * [--apply]
	 * : Write the changes. Without it, only report what would change.
	 *
	 * @subcommand migrate-locations
	 *
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Associative arguments.
	 */
	public function migrate_locations( $args, $assoc_args ) {
		global $wpdb;

		$apply = ! empty( $assoc_args['apply'] );

		$rows = $wpdb->get_results(
			"SELECT m.meta_id, p.post_type, m.meta_value FROM {$wpdb->postmeta} m
			 JOIN {$wpdb->posts} p ON p.ID = m.post_id
			 WHERE m.meta_key = 'location' AND m.meta_value LIKE 'a:%'"
		);

		$changed = array();

		foreach ( $rows as $row ) {
			$location = maybe_unserialize( $row->meta_value );

			if ( ! is_array( $location ) ) {
				continue;
			}

			$updated = $this->with_2x_keys( $location );

			if ( $updated === $location ) {
				continue;
			}

			$changed[ $row->post_type ] = ( $changed[ $row->post_type ] ?? 0 ) + 1;

			if ( $apply ) {
				update_metadata_by_mid( 'post', (int) $row->meta_id, $updated );
			}
		}

		$transients = $this->location_transients();

		if ( $apply ) {
			foreach ( $transients as $name ) {
				delete_transient( $name );
			}
			wp_cache_flush();
		}

		WP_CLI::log( sprintf( 'Location rows scanned: %d', count( $rows ) ) );
		foreach ( $changed as $type => $count ) {
			WP_CLI::log( sprintf( '  %s: %d %s', $type, $count, $apply ? 'updated' : 'to update' ) );
		}
		WP_CLI::log( sprintf( 'Cached map transients: %d %s', count( $transients ), $apply ? 'cleared' : 'to clear' ) );

		if ( $apply ) {
			WP_CLI::success( 'Map locations migrated.' );
		} else {
			WP_CLI::log( 'Dry run. Pass --apply to write.' );
		}
	}

	/**
	 * Return a location with `latitude` / `longitude` filled from `lat` / `long`.
	 *
	 * @param array $location Location meta.
	 * @return array
	 */
	public function with_2x_keys( array $location ) {
		foreach ( array( 'lat' => 'latitude', 'long' => 'longitude' ) as $from => $to ) {
			$current = isset( $location[ $to ] ) ? (string) $location[ $to ] : '';

			if ( '' === $current && isset( $location[ $from ] ) && '' !== (string) $location[ $from ] ) {
				$current = (string) $location[ $from ];
			}

			$location[ $to ] = $current;
		}

		return $location;
	}

	/**
	 * Names of Tour Operator's cached map transients.
	 *
	 * @return string[]
	 */
	private function location_transients() {
		global $wpdb;

		$options = $wpdb->get_col(
			"SELECT option_name FROM {$wpdb->options}
			 WHERE option_name LIKE '\\_transient\\_%\\_location' AND option_name NOT LIKE '\\_transient\\_timeout\\_%'"
		);

		return array_map(
			static function ( $option ) {
				return substr( $option, strlen( '_transient_' ) );
			},
			$options
		);
	}
}
