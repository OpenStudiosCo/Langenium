uniform float randomness; 
varying vec3 vUv;       

#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

void main() {

    vec4 voronoiValue = voronoi(vUv); // Get the distance from Voronoi function

    vec3 baseColor = getGradient(
        vec4( .02, .02, .02, 0.40 ),
        vec4( .1, .1, .1, 0.43 ),
        vec4( 0.02, 0.02, 0.02, 0.44 ),
        voronoiValue.a
    );

    vec3 emissionColor = getGradient(
        vec4( 0., 0., 0., 0.61 ),
        vec4( 1., 0., 0., 0.63 ),
        voronoiValue.a
    );
    
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));
    gray = ( gray - 0.5 ) * 0.2;

    baseColor = mix(baseColor, vec3(gray), 0.5);

    gl_FragColor = mix(vec4(baseColor, 1.0), vec4(emissionColor, 1.0), 0.5);

}
