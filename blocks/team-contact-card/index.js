/**
 * Team Contact Card — minimal editor registration.
 *
 * No build step required. This file uses the wp.* globals that WordPress
 * already loads in the block editor. It registers the block client-side so
 * the editor recognises it (fixes the "site doesn't include support" warning)
 * and shows a styled placeholder while editing. The actual card is rendered
 * server-side by render.php via the PHP render_callback.
 */
( function () {
	var el             = wp.element.createElement;
	var useBlockProps  = wp.blockEditor.useBlockProps;
	var __             = wp.i18n.__;

	wp.blocks.registerBlockType( 'ati/team-contact-card', {
		edit: function () {
			var blockProps = useBlockProps( { className: 'lsx-to-contact-widget' } );

			return el(
				'div',
				blockProps,
				/* Image placeholder */
				el( 'div', {
					className: 'lsx-to-contact-thumb',
					style: { background: 'rgba(255,255,255,0.25)' },
				} ),
				/* Text placeholder */
				el( 'div', { className: 'lsx-to-contact-info' },
					el( 'small', { className: 'lsx-to-contact-prefix' },
						__( 'Your travel expert:', 'ati-theme-2026' )
					),
					el( 'h4', { className: 'lsx-to-contact-name' },
						__( 'Team Member Name', 'ati-theme-2026' )
					)
				)
			);
		},

		/* Server-rendered block — save returns null. */
		save: function () {
			return null;
		},
	} );
} )();
