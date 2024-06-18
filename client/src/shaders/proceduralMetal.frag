varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D noiseTexture;
uniform vec3 emitColour;

uniform float randomness; 
varying vec3 vUv;       

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

void main() {

    vec4 voronoiValue = voronoi(vUv); // Get the distance from Voronoi function

    vec3 baseColor = getGradient(
        vec4( vec3(0.02), 0.40 ),
        vec4( vec3(0.5), 0.43 ),
        vec4( vec3(0.02), 0.44 ),
        voronoiValue.a
    );

    vec3 emissionColor = getGradient(
        vec4( vec3(0.02), 0.61 ),
        vec4( emitColour, 0.63 ),
        voronoiValue.a
    );
    
    float gray = dot(voronoiValue.rgb, vec3(0.2126, 0.7152, 0.0722));
    gray = ( gray - 0.5 ) * 0.2;

    baseColor = mix(baseColor, vec3(gray), 0.5);

    gl_FragColor = mix(vec4(baseColor, 1.0), vec4(emissionColor, 1.0), 0.5);

    if ((baseColor.r > 0.05 ) ) {

        float n = gray;

        const float e = .001;

        float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
        float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
        float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

        vec3 normal = normalize( vNormal + .5 * vec3( n - nx, n - ny, n - nz ) / e );

        // diffuse light
        vec3 vLightWeighting = vec3( 0.001 );

        vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
        float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.5 + 0.5;
        vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

        // specular light

        vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );

        float dirDotNormalHalf = dot( normal, dirHalfVector );

        float dirSpecularWeight = 0.0;
        if ( dirDotNormalHalf >= 0.0 )
            dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 5.0 );

        //vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n / 3.1415926;
        vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n * 2.0;

        gl_FragColor *= vec4( vLightWeighting, 1.0 ); //
    }

}
