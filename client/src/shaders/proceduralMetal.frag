uniform float randomness; 
varying vec3 vUv;       

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {

    vec4 voronoiValue = voronoi(vUv); // Get the distance from Voronoi function

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

    //vec3 color = mix(vVoronoiColor.rgb, voronoiValue.rgb, 0.5);
    // gl_FragColor = vec4(vVoronoiColor.rgb, 1.0);
    // gl_FragColor = vec4(voronoiValue.rgb, 1.0);
}
