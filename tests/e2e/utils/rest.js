/**
 * Public, read-only REST lookups used to learn what a rendered row SHOULD show.
 *
 * Tour Operator hides a `lsx-<key>-wrapper` row when the key's data is empty,
 * so "the row is absent" is only a bug if the data exists. Core REST exposes
 * the meta TO registers (price, duration, number_of_rooms, rating, tagline, …)
 * and the post's terms, with no authentication.
 *
 * @package ATI_Theme_2026
 * @subpackage Tests
 */

const REST_BASE = {
	tour: 'tour',
	accommodation: 'accommodation',
	destination: 'destination',
	review: 'review',
	special: 'special',
	team: 'team',
	post: 'posts',
};

/**
 * @param {import('@playwright/test').APIRequestContext} request Request context.
 * @param {string}                                       type    Post type key.
 * @param {string|number}                                id      Post id.
 * @return {Promise<{meta: Object, terms: Object}|null>} Meta and term-id arrays, or null.
 */
async function postData( request, type, id ) {
	const response = await request.get(
		`/wp-json/wp/v2/${ REST_BASE[ type ] }/${ id }?_fields=meta,travel-style,accommodation-type,accommodation-brand`
	);

	if ( ! response.ok() ) {
		return null;
	}

	const json = await response.json();

	return {
		meta: json.meta || {},
		terms: {
			styles: json[ 'travel-style' ] || [],
			type: json[ 'accommodation-type' ] || [],
			brand: json[ 'accommodation-brand' ] || [],
		},
	};
}

/**
 * @param {*} value Meta value.
 * @return {boolean} True when the value is non-empty by Tour Operator's test.
 */
function filled( value ) {
	if ( Array.isArray( value ) ) {
		return value.some( Boolean );
	}

	return null !== value && undefined !== value && '' !== value && 'none' !== value && false !== value;
}

module.exports = { postData, filled, REST_BASE };
