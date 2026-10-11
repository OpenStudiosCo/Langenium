uniform sampler2D noiseTexture;
uniform float randomness; 

varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

#include <brick>        // Include the brick functions
#include <gradient>     // Include the gradient functions
#include <normal>       // Include the normal functions
#include <voronoi>      // Include the voronoi functions

const float panelBevel = 4.5;

void main() {
    vec4 voronoiValue = voronoi(vTexCoord3D * 0.75);
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec3 baseColor = brick_color(vTexCoord3D * 3.21 * gray, 0.5, 1.5, false);

    // Faces stay flat. Height only falls across the brick seams and the
    // voronoi cell borders, which is the chamfer on sci-fi panel edges.
    // voronoiEdge is written by the voronoi() call above.
    float plates = brick_height(vTexCoord3D * 3.21 * gray, 0.5, 1.5);
    float cellLip = smoothstep(0.0, 0.0075, voronoiEdge);
    float height = min(plates, cellLip);

    float pixel = max(length(dFdx(vViewPosition)), length(dFdy(vViewPosition)));

    vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), 0.5, pixel * panelBevel, 0.0, dFdx(height), dFdy(height), false);

    vec3 lightWeighting = calculateMergedLighting(baseColor, perturbedNormal, baseColor.r, 0.35);

    vec3 finalColor = mix( baseColor, lightWeighting, 0.25 );

    gl_FragColor = vec4(finalColor, 1.0);

    gl_FragColor += vec4(baseColor * lightWeighting, 1.0);
}