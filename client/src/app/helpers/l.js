/**
 * Provides an interface to the core "l" variable, attached to the browser window.
 */

// Check if window.l is defined
if (typeof window.l === 'undefined') {
    throw new Error('window.l is not defined');
}

// Create a shortcut to window.l
const l = window.l;

export default l;
