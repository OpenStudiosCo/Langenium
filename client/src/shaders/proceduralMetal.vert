uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float roughness;  // Roughness affects the smoothness of the Voronoi texture
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; // Lacunarity controls the gap between frequencies
varying vec3 vUv;         // Varying variable to voronoi value to the fragment shader

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {
    vUv = position * scale * lacunarity;

    // Standard transformations
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
