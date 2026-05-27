( function() {
	function scaleImageMap( image ) {
		if ( ! image || ! image.useMap ) {
			return;
		}

		var mapName = image.useMap.replace( '#', '' );
		var map = document.getElementById( mapName ) || document.querySelector( 'map[name="' + mapName + '"]' );

		if ( ! map || ! image.naturalWidth || ! image.naturalHeight || ! image.clientWidth || ! image.clientHeight ) {
			return;
		}

		var widthRatio = image.clientWidth / image.naturalWidth;
		var heightRatio = image.clientHeight / image.naturalHeight;
		var areas = map.querySelectorAll( 'area[coords]' );

		areas.forEach( function( area ) {
			var originalCoords = area.dataset.originalCoords || area.getAttribute( 'coords' );

			if ( ! area.dataset.originalCoords ) {
				area.dataset.originalCoords = originalCoords;
			}

			var scaledCoords = originalCoords.split( ',' ).map( function( coordinate, index ) {
				var numericCoordinate = Number.parseFloat( coordinate.trim() );

				if ( Number.isNaN( numericCoordinate ) ) {
					return coordinate.trim();
				}

				return Math.round( numericCoordinate * ( index % 2 === 0 ? widthRatio : heightRatio ) );
			} );

			area.setAttribute( 'coords', scaledCoords.join( ',' ) );
		} );
	}

	function normaliseResponsiveStyles( image ) {
		if ( ! image ) {
			return;
		}

		var mapWrapper = image.closest( '.destination-map' );
		var viewport = image.closest( '.ati-home-page-destinations-section__viewport' );

		if ( viewport ) {
			viewport.style.width = '100%';
			viewport.style.overflowX = 'visible';
			viewport.style.overflowY = 'visible';
		}

		if ( mapWrapper ) {
			mapWrapper.style.marginInline = 'auto';
			mapWrapper.style.maxWidth = image.naturalWidth ? image.naturalWidth + 'px' : '520px';
			mapWrapper.style.width = '100%';
			mapWrapper.style.textAlign = 'center';
		}

		image.style.display = 'block';
		image.style.width = '100%';
		image.style.height = 'auto';
		image.style.maxWidth = image.naturalWidth ? image.naturalWidth + 'px' : '520px';
		image.removeAttribute( 'sizes' );
	}

	function initialiseResponsiveImageMaps() {
		var images = document.querySelectorAll( 'img[usemap="#m-map-destinations"], .ati-home-page-destinations-section img[usemap]' );

		images.forEach( function( image ) {
			var updateMap = function() {
				normaliseResponsiveStyles( image );
				scaleImageMap( image );
			};

			if ( image.complete ) {
				updateMap();
			} else {
				image.addEventListener( 'load', updateMap, { once: true } );
			}

			window.addEventListener( 'resize', updateMap );

			if ( 'ResizeObserver' in window ) {
				var resizeObserver = new ResizeObserver( updateMap );
				resizeObserver.observe( image );
			}
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initialiseResponsiveImageMaps );
		return;
	}

	initialiseResponsiveImageMaps();
}() );