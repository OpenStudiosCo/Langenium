import l from '@/helpers/l.js';

/**
 * Set camera FOV based on desired aspect ratio
 * 
 * @param {Float} aspect 
 * @returns {Float} fov
 */
export function setCameraFOV( aspect ) {
    var fov;

    var threshold = 0.88;

    if ( aspect < threshold ) {
        // Portrait or square orientation
        fov = mapRange( aspect, 0.5, threshold, 60, 60 );
    } else {
        // Widescreen orientation
        if ( aspect < 2 ) {
            // Tolerance for square to widescreen transition
            fov = mapRange( aspect, threshold, 2, 60, 45 );
        } else {
            if ( aspect < 2.25 ) {
                fov = mapRange( aspect, 2, 2.25, 45, 40 );
            } else {
                if ( aspect < 3 ) {
                    fov = mapRange( aspect, 2.25, 5, 40, 90 );
                } else {
                    fov = 90;
                }
            }
        }
    }

    return fov;
}



/**
 * Function to map a value from one range to another
 */
export function mapRange( value, inMin, inMax, outMin, outMax ) {
    return ( ( value - inMin ) * ( outMax - outMin ) ) / ( inMax - inMin ) + outMin;
}

/**
 * Helper to calculate the desired gap size
 * 
 * Used to determine office room dimensions on different screen sizes/aspect ratios.
 */
export function calculateAdjustedGapSize() {
    var width = l.scenograph.width;
    var height = l.scenograph.height;

    // Adjust gap size based on the aspect ratio
    var adjustedGapSize =
        l.current_scene.settings.gap * l.current_scene.settings.scale;
    if ( width < height ) {
        adjustedGapSize *= height / width;
    }

    return adjustedGapSize;
}
