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
    vec4 voronoiValue = voronoi(vTexCoord3D * 0.75);
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec3 baseColor = brick_color(vTexCoord3D * 3.21 * gray, 0.5, 1.5, false);

    // Using the bump mapping function
    vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), bumpScale, 0.75, 0.0, baseColor.r, baseColor.r, true);

    vec3 lightWeighting = calculateMergedLighting(baseColor, perturbedNormal, baseColor.r, 0.35);

    vec3 finalColor = mix( baseColor, lightWeighting, 0.25 );

    gl_FragColor = vec4(finalColor, 1.0);

    gl_FragColor += vec4(baseColor * lightWeighting, 1.0);

    
}