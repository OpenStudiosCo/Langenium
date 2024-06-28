varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; // Lacunarity controls the gap between frequencies
varying vec3 vUv;         // Varying variable to voronoi value to the fragment shader

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {
    vUv = position;

    // mirror stuff
    vec4 mvPosition = modelMatrix * vec4( position, 1.0 );

    vNormal = normalize( normalMatrix * normal );
    vViewPosition = cameraPosition - mvPosition.xyz;
    vTexCoord3D = lacunarity * scale * ( position.xyz + vec3( 0.0, 0.0, 0.0 ) );    

    // Standard transformations
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
