// Simulates global illumination and bump mapping.

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

vec3 computeLightWeighting( float height, float dlwRatio ) {
    vec3 normal = computeNormal( height );
    // diffuse light
    vec3 vLightWeighting = vec3( 0.001 );

    vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
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