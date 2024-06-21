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

const float bumpScale = 25.;

// Bump mapping function adapted from Blender's Cycles code
vec3 bumpMapping(vec3 P, vec3 normal, float strength, float distance, float sampleCenter, float sampleX, float sampleY, bool invert) {
    vec3 dPdx = dFdx(P);
    vec3 dPdy = dFdy(P);

    vec3 Rx = cross(dPdy, normal);
    vec3 Ry = cross(normal, dPdx);

    float det = dot(dPdx, Rx);
    vec3 surfgrad = (sampleX - sampleCenter) * Rx + (sampleY - sampleCenter) * Ry;

    float absdet = abs(det);

    if (invert)
        distance *= -1.0;

    vec3 NormalOut = normalize(absdet * normal - distance * sign(det) * surfgrad);
    NormalOut = normalize(strength * NormalOut + (1.0 - strength) * normal);

    return NormalOut;
}

vec3 calculateLighting(vec3 baseColor, vec3 normal) {
    float metallic = dot(getGradient(
        vec4(0., 0., 0., 0.),
        vec4(1., 1., 1., 0.118),
        baseColor.r
    ), vec3(0.2126, 0.7152, 0.0722));

    vec3 lightDir =  normalize( vec3( 0.1, 1.0, 0.1 ) - vViewPosition );
    vec3 viewDir = normalize(vViewPosition - vTexCoord3D);

    // Calculate the halfway vector
    vec3 halfwayDir = normalize(lightDir + viewDir);

    // Fresnel factor (Schlick's approximation)
    float fresnel = pow(1.0 - dot(viewDir, halfwayDir), 5.0);

    // Base reflectance at normal incidence for dielectric materials (approximately 4% reflectance)
    vec3 F0 = vec3(0.04);

    // Interpolate between dielectric F0 and the base color for metals
    F0 = mix(F0, baseColor, metallic);

    // Specular reflection (using Blinn-Phong model here)
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);

    // Fresnel equation for specular reflection
    vec3 specular = (1.0 - fresnel) * F0 + fresnel;

    // Lambertian diffuse reflection
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * diff * (1.0 - metallic);
    
    return diffuse;
}

vec3 computeLightWeighting2( vec3 normal, float height, float dlwRatio ) {

    // diffuse light
    vec3 vLightWeighting = vec3( 0.001 );

    vec4 lDirection = viewMatrix * vec4( normalize( vec3( 0.1, 1.0, 0.1 ) ), 0.0 );
    float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * (dlwRatio) + (1. - dlwRatio);
    vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

    // specular light
    vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );
    float dirDotNormalHalf = dot( normal, dirHalfVector );

    float dirSpecularWeight = 0.0;
    if ( dirDotNormalHalf >= 0.0 )
        dirSpecularWeight = ( 1.0 - height ) * pow( dirDotNormalHalf, 5.0 );

    //vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n / 3.1415926;
    vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * height * 2.0;

    return vLightWeighting;
}

vec3 calculateMergedLighting(vec3 baseColor, vec3 normal, float height, float dlwRatio) {
    // Calculate metallic value
    float metallic = dot(getGradient(
        vec4(0., 0., 0., 0.),
        vec4(1., 1., 1., 0.118),
        baseColor.r
    ), vec3(0.2126, 0.7152, 0.0722));

    vec3 lightDir = normalize(vec3(0.1, 1.0, 0.1) - vViewPosition);
    vec3 viewDir = normalize(vViewPosition - vTexCoord3D);

    // Calculate the halfway vector
    vec3 halfwayDir = normalize(lightDir + viewDir);

    // Fresnel factor (Schlick's approximation)
    float fresnel = pow(1.0 - dot(viewDir, halfwayDir), 5.0);

    // Base reflectance at normal incidence for dielectric materials (approximately 4% reflectance)
    vec3 F0 = vec3(0.04);

    // Interpolate between dielectric F0 and the base color for metals
    F0 = mix(F0, baseColor, metallic);

    // Specular reflection (using Blinn-Phong model here)
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);

    // Fresnel equation for specular reflection
    vec3 specular = (1.0 - fresnel) * F0 + fresnel;

    // Lambertian diffuse reflection
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * diff * (1.0 - metallic);

    // Compute light weighting
    vec3 vLightWeighting = vec3(0.001);

    vec4 lDirection = viewMatrix * vec4(normalize(vec3(0.1, 1.0, 0.1)), 0.0);
    float directionalLightWeighting = dot(normal, normalize(lDirection.xyz)) * (dlwRatio) + (1.0 - dlwRatio);
    vLightWeighting += vec3(1.0) * directionalLightWeighting;

    // Specular light component
    vec3 dirHalfVector = normalize(lDirection.xyz + normalize(vViewPosition));
    float dirDotNormalHalf = dot(normal, dirHalfVector);

    float dirSpecularWeight = 0.0;
    if (dirDotNormalHalf >= 0.0)
        dirSpecularWeight = (1.0 - height) * pow(dirDotNormalHalf, 5.0);

    vLightWeighting += vec3(1.0, 0.5, 0.0) * dirSpecularWeight * height * 2.0;

    // Combine diffuse and specular components
    vec3 finalColor = diffuse + specular * vLightWeighting;

    return finalColor;
}


void main() {
    vec4 voronoiValue = voronoi(vTexCoord3D * 0.75);
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec3 baseColor = brick_color(vTexCoord3D * 3.21 * gray);

    // Using the bump mapping function
    vec3 perturbedNormal = bumpMapping(vViewPosition, normalize(vNormal), bumpScale, 0.75, 0.0, baseColor.r, baseColor.r, false);

    vec3 lightWeighting = calculateMergedLighting(baseColor, perturbedNormal, gray, 0.35);

    gl_FragColor = vec4(baseColor * lightWeighting, 1.0);

    
}