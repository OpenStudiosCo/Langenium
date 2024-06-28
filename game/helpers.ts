/**
 * Helpers
 */

/**
 * Get speed delta from ideal of 60FPS
 * 
 * All in game speeds are calculated to 60 FPS, this function checks what the current delta is 
 * 
 * @param 
 * 
 * @returns 
 */
export function normaliseSpeedDelta(time_delta: number): number {
    return 1.;
}


/**
 * Ease out exponentially
 * 
 * @see https://easings.net/#easeOutExpo
 * 
 * @param x
 * 
 * @returns number eased out number
 */
export function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * Ease in quadratrically
 * 
 * @see https://easings.net/#easeOutExpo
 * 
 * @param x
 * 
 * @returns number eased out number
 */
export function easeInQuad(x: number): number {
    return x * x;
}

/**
 * Ease in and out expotentially
 * 
 * @see https://easings.net/#easeOutExpo
 * 
 * @param x
 * 
 * @returns number eased out number
 */
export function easeInOutExpo(x: number): number {
    return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2;
}