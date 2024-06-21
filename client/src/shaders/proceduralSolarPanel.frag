uniform sampler2D noiseTexture;
uniform vec4 diffuseColour1;
uniform vec4 diffuseColour2;
uniform vec4 diffuseColour3;
uniform vec4 emitColour1;
uniform vec4 emitColour2;
uniform float randomness; 

varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

#include <brick>        // Include the brick functions
#include <gradient>     // Include the gradient functions
#include <normal>       // Include the normal functions
#include <voronoi>      // Include the voronoi functions

const float bumpScale = 250.;

void main() {
    vec3 baseColor = brick_color(vTexCoord3D * 100., 0.85, 0.0, false);

    float lightRatio = 0.15;

    baseColor = mix( baseColor, vec3( 0.0, 0.0, 0.025), 0.65) ;

    if (baseColor.r < 0.0125) {
        // Add some noise.
        baseColor -= ( nrand( vTexCoord3D.xz ) * 0.005);
        lightRatio = 0.125;
    }
    

    // // Using the bump mapping function
    vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), bumpScale, 1.0, 0.0, baseColor.r, baseColor.r, false);

    vec3 lightWeighting = calculateMergedLighting(baseColor, perturbedNormal, baseColor.r, lightRatio);

    baseColor = mix( baseColor, lightWeighting, lightRatio == 0.65 ? 0.25 : 0.09 );

    gl_FragColor = vec4(baseColor, 1.0);

    if (lightRatio == 0.125) {
        gl_FragColor += vec4(baseColor * lightWeighting, 1.0);
    }

}
