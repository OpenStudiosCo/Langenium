uniform sampler2D noiseTexture;
uniform vec4 diffuseColour1;
uniform vec4 diffuseColour2;
uniform vec4 diffuseColour3;
uniform vec4 emitColour1;
uniform vec4 emitColour2;
uniform float randomness;
uniform float time;

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
    vec3 scaledCoord = vTexCoord3D *(vNormal + vec3(-time / 2., time / 3., -time / 4.));

    // Sample the noise texture with scaled UV coordinates for better visibility
    float emission_noise = abs(snoise(scaledCoord / 5000., 14.0 , 3500.0)) * 0.95 + 0.05;

    vec4 voronoiValue = voronoi(vTexCoord3D);

    vec3 buildingSegments = brick_color(vTexCoord3D.xzy * voronoiValue.a * 3.92, 0.5, 1.5, false) ;

    float gray = dot(buildingSegments, vec3(0.2126, 0.7152, 0.0722));

    vec3 buildingSurface = getGradient(
        vec4( vec3( 0.0 ), 0.0),
        vec4( vec3( 1.0 ), 0.164),
        vec4( vec3( 0.0 ), 0.791),
        vec4( vec3( 1.0 ), 0.907),
        vec4( vec3( 0.0 ), 1.0),
        buildingSegments.r
    );

    vec3 emissionColor = getGradient(
        emitColour1,
        emitColour2,
        emission_noise
    );

    emissionColor *= 10.;

    emissionColor *= emitColour2.rgb;

    float baseShade = snoise(vTexCoord3D.xzy / 1000., 14.0 , 35.0) * 0.15 + 0.15;

    vec3 baseColor = vec3( baseShade ) * buildingSurface;

    if ( buildingSurface.r < 0.089 ) {
        baseColor = emissionColor;
    }

    //baseColor = buildingSegments;

    //baseColor += emissionColor;

    // vec3 bricks = brick_color(vTexCoord3D * 100., 0.85, 0.0);

    // float lightRatio = 0.15;

    // if ( baseColor.r < bricks.r ) {
    //     baseColor = baseColor * bricks;
    //     baseColor = mix( baseColor, vec3( 0.05, 0.15, 0.4), 0.65) ;
    //     lightRatio = 0.55;
    // }
    // else {
    //     baseColor = mix( baseColor, vec3( 0.0), 0.8) ;
    // }

    // // Add some noise.
    // baseColor += ( nrand( vTexCoord3D.xz ) * 0.001);

    // // // Using the bump mapping function
    // vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), bumpScale, 1.0, 0.0, baseColor.r, baseColor.r, true);

    // vec3 lightWeighting = calculateMergedLighting(baseColor, perturbedNormal, baseColor.r, lightRatio);

    // baseColor = mix( baseColor, lightWeighting, lightRatio == 0.55 ? 0.25 : 0.09 );

    gl_FragColor = vec4(baseColor, 1.0);
    //gl_FragColor = vec4(vec3(baseShade), 1.0);

    // if (lightRatio == 0.55) {
    //     gl_FragColor += vec4(baseColor * lightWeighting, 1.0);
    // }


    // Output the noise texture color
    //gl_FragColor = vec4(emissionColor, 1.0);
}
