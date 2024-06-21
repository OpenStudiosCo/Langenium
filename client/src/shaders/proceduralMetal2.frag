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

vec3 metalness ( vec3 baseColor ) {
    float metallic = dot(getGradient(
        vec4(0.,0.,0.,0.),
        vec4(1.,1.,1.,0.118),
        baseColor.r
    ), vec3(0.2126, 0.7152, 0.0722));

    // Normalize the vectors
    vec3 normal = normalize(vNormal);
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

void main() {

    vec4 voronoiValue = voronoi(vTexCoord3D *.75); // Get the distance from Voronoi function
    
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec3 baseColor = brick_color( vTexCoord3D * 4.0 * gray );

    vec3 metalColor = metalness(baseColor);

    // Combine the diffuse and specular components
    baseColor = baseColor + metalColor;

    // // @todo: Implement a switch so this is off on fast mode / low power gpus
    if ((baseColor.r > 0.05 ) ) {

        vec3 lightWeighting = computeLightWeighting( baseColor.r, 0.35 );
        baseColor *= lightWeighting; //
    }

    gl_FragColor = vec4( baseColor, 1.0) ;

}
