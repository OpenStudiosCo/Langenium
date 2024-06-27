uniform sampler2D noiseTexture;
uniform vec4 diffuseColour1;
uniform vec4 diffuseColour2;
uniform vec4 diffuseColour3;
uniform vec4 emitColour1;
uniform vec4 emitColour2;
uniform float randomness;
uniform float time;
uniform float shadowFactor;
uniform float shadowOffset;

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

    // Main colour is based on a voronoi texture distance multiplied by coordinates in a brick texture.
    vec4 voronoiValue = voronoi(vTexCoord3D.xzy);
    vec3 buildingSegments = brick_color(vTexCoord3D.xzy * voronoiValue.a * 3.92, 0.5, 1.5, false) ;
    vec3 buildingSurface = getGradient(
        vec4( vec3( 0.0 ), 0.0),
        vec4( vec3( 1.0 ), 0.164),
        vec4( vec3( 0.0 ), 0.791),
        vec4( vec3( 1.0 ), 0.907),
        vec4( vec3( 0.0 ), 1.0),
        buildingSegments.r
    );

    // Add time offset to coordinates for animation.
    float timeFactor = mix(-time * voronoiValue.a / 10., -time, 1. - buildingSegments.r) ;
    vec3 scaledCoord = vTexCoord3D *(vNormal + vec3(-timeFactor / 3., timeFactor  , -timeFactor / 4.));

    // Sample the noise texture with scaled UV coordinates for better visibility
    float emission_noise = abs(snoise(scaledCoord / 250., 14.0 , 3500.0)) * 0.95 + 0.05;

    // Calculate the emission colour.
    vec3 emissionColour = getGradient(
        emitColour1,
        emitColour2,
        emission_noise
    );
    emissionColour *= 10.;

    if (emissionColour.r < .9) {
        emissionColour *= emitColour1.rgb;
    }
    else {
        if (emissionColour.r > 0.8) {
            emissionColour *= emitColour2.rgb;
        }
    }

    vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), bumpScale, 1.0, 0.0, buildingSegments.r, buildingSegments.r, true);

    // Calculate the base detailing of the building.
    float baseShade = snoise(vTexCoord3D.xzy / 1000., 14.0 , 35.0);
    vec3 baseColor = vec3(baseShade);

    // Using the bump mapping function
    float lightRatio = 0.35;
    if ( buildingSurface.r < 0.089 ) {
        baseColor = emissionColour;
        lightRatio = 0.45;
    }
    else {
        baseColor *= buildingSegments;
        baseColor += emitColour1.rgb * 0.05;
    }

    vec3 lightWeighting = calculateMergedLighting(buildingSegments, perturbedNormal, buildingSegments.r, lightRatio);
    vec3 simulatedShadow = vec3(  vTexCoord3D.y ) * shadowFactor + shadowOffset;

    // Output the noise texture color
    gl_FragColor = vec4(baseColor * simulatedShadow + lightWeighting * 0.25, 1.0);
    //gl_FragColor = vec4(simulatedShadow, 1.0);
    
}
