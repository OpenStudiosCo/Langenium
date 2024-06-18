uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float roughness;  // Roughness affects the smoothness of the Voronoi texture
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; // Lacunarity controls the gap between frequencies
varying vec3 vUv;
varying float displacement;
varying vec3 vColor;         // Varying variable to pass color value to the fragment shader

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {
    vUv = position;

    vec3 uvScaled = vUv * scale * lacunarity;   
    // Calculate Voronoi value for displacement and color
    vec4 voronoiResult = voronoi(uvScaled);
    
    // // Calculate displacement
    // if ( voronoiResult.r < 0.5 && voronoiResult.g < 0.5 && voronoiResult.b < 0.5  ) {
    //     voronoiResult.rgb *= vec3(-1.0); //(voronoiResult.a) ;
    // }

    // float displacementScale = .2;

    // // Displace the vertex along its normal
    // vec3 displacedPosition = position + normal * voronoiResult.rgb * displacementScale;

    // // Pass color value to fragment shader
    vColor = voronoiResult.rgb;

    // Standard transformations
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
