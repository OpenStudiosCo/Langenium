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

#include <brick> // Include the brick functions
#include <gradient> // Include the gradient functions
#include <voronoi> // Include the voronoi functions

float snoise ( vec3 coord, float scale, float time_factor ) {
    vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0.0, 0.0, 0.0));

    vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y) + vec2( -0.7, 1.5 ) * 0.0 * 0.015;
    vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
    vec2 uvNoiseTimeShift = vec2(scaledCoord.x, scaledCoord.y) + 0.5 * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );
    vec4 baseColor = texture2D( noiseTexture, uvNoiseTimeShift * vec2(4.0, 4.0) );

    return baseColor.b;
}

float heightMap( vec3 coord ) {
    float n = abs(snoise(coord , 1.0 , 1800.0));
    n -= 0.75 * abs(snoise(coord , 4.0 , 2500.0));
    n += 0.125 * abs(snoise(coord , 14.0 , 3500.0));
    n *= 0.7;
    return n;
}

vec3 computeNormal( float height ) {
    const float e = .001;

    float heightX = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
    float heightY = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
    float heightZ = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

    vec3 normal = normalize( vNormal + .5 * vec3( height - heightX, height - heightY, height - heightZ ) / e );

    return normal;    
}

vec3 computeLightWeighting( float height ) {
    vec3 normal = computeNormal( height );
    // diffuse light
    vec3 vLightWeighting = vec3( 0.001 );

    vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
    float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.25 + 0.75;
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

void main() {

    vec4 voronoiValue = voronoi(vTexCoord3D); // Get the distance from Voronoi function

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

        vec3 lightWeighting = computeLightWeighting( gray );
        gl_FragColor *= vec4( lightWeighting, 1.0 ); //
    }

    gl_FragColor = vec4(brick_color( vTexCoord3D ) , 1.0);

}
