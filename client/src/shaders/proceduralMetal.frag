uniform float scale;      // Scale to adjust the size of the Voronoi cells
uniform float roughness;  // Roughness affects the smoothness of the Voronoi texture
uniform float lacunarity; // Lacunarity controls the gap between frequencies
uniform float randomness; 
varying vec3 vUv;
varying float displacement;
varying vec3 vColor;         // Varying variable to pass color value to the fragment shader

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {

    vec3 uvScaled = vUv * scale * lacunarity;   
    vec4 voronoiValue = voronoi(uvScaled); // Get the distance from Voronoi function

    vec3 baseColor = getGradient(
        vec4( .02, .02, .02, 0.41 ),
        vec4( .05, .05, .05, 0.43 ),
        vec4( 0.02, 0.02, 0.02, 0.44 ),
        voronoiValue.a
    );

    vec3 emissionColor = getGradient(
        vec4( 0., 0., 0., 0.61 ),
        vec4( 1., 0., 0., 0.63 ),
        voronoiValue.a
    );
    
    gl_FragColor = vec4(baseColor, 1.0) + vec4(emissionColor, 1.0);
    //gl_FragColor = vec4(vColor, 1.0);
}
