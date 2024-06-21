varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D noiseTexture;
uniform vec4 diffuseColour1;
uniform vec4 diffuseColour2;
uniform vec4 diffuseColour3;
uniform vec4 emitColour1;
uniform vec4 emitColour2;

uniform float randomness; 
varying vec3 vUv;       

#include <gradient> // Include the gradient functions
#include <normal>       // Include the normal functions
#include <voronoi> // Include the voronoi functions

void main() {

    vec4 voronoiValue = voronoi(vUv); // Get the distance from Voronoi function

    vec3 baseColor = getGradient(
        diffuseColour1,
        diffuseColour2,
        diffuseColour3,
        voronoiValue.a
    );

    vec3 emissionColor = getGradient(
        emitColour1,
        emitColour2,
        voronoiValue.a
    );
    
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));
    gray = ( gray - 0.5 ) * 0.2;

    // Mix with gray
    baseColor = mix(baseColor, vec3(gray), 0.5);

    baseColor = mix(baseColor, emissionColor, 0.5);

    gl_FragColor = vec4( baseColor, 1.0) ;
    // gl_FragColor = vec4( voronoiValue.rgb, 1.0 );

    // @todo: Implement a switch so this is off on fast mode / low power gpus
    if ((baseColor.r > 0.05 ) ) {

        vec3 lightWeighting = computeLightWeighting( gray, 0.25 );
        gl_FragColor *= vec4( lightWeighting, 1.0 ); //
    }

}
