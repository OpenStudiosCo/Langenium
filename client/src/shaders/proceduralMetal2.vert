uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; // Lacunarity controls the gap between frequencies

varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;         // Varying variable to voronoi value to the fragment shader

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewPosition = cameraPosition - worldPosition.xyz;
    vUv = uv;
    vTexCoord3D = scale * position.xyz * lacunarity;    
}
