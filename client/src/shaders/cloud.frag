varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D noiseTexture;

uniform float time;
varying vec2 vUv;

float blendOverlay(float base, float blend) {
    return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.1 - blend ) ) );
}

float snoise ( vec3 coord, float scale, float time_factor ) {
    vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0.0, 0.0, -time / time_factor));

    vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y) + vec2( -0.7, 1.5 ) * time / time_factor * 0.015;
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

float limitColor( float min, float max, float channel) {
    if (channel < min) {
        channel = min;
    }
    if (channel > max) {
        channel = max;
    }
    return channel;
}

vec4 colorFilter (float n, vec3 coord) {

    vec4 color = vec4( vec3( 0, .0, 0 )  , 1.0 );

    if (coord.y > -0.1) {

        if ( n >= 0.3 ) {
            color.r = limitColor(0.5, 0.85, color.r) ;
            color.g = limitColor(0.5, 0.85, color.g) ;
            color.b = limitColor (0.5, 0.85, color.b) ;

        }
        else {
            if ( n >= 0.2 ) {
                color.r = dot(color.r, n) / 1.5 + 0.0;
                color.g = color.g * n / 1.5 + 0.5 - coord.y * 1.12;
                color.b = color.b * n / 1.5 + .95 - coord.y * 1.12;
            }
            else {
                color.r = color.r * n / 3.5 + 0.0;
                color.g = color.g * n  / 3.5 + 0.5 - coord.y * 1.12;
                color.b = color.b * n  / 3.5 + .95 - coord.y * 1.12;
            }
        }

        // targetting the grey parts of the clouds
        if (n < 1.0 && n > 0.3) {
        
            color.r = pow(color.r , 0.1);
            color.g = pow(color.g  , 0.6 ) ;
            color.b = pow(color.b , 1.0 ) ;
        }
    }
    else {
        color = vec4( vec3( 0, 34, 68 )  , .65 );
    }
    return color;
}

void main(void) {

    // height

    float n = heightMap( vTexCoord3D );

    vec4 texColor = colorFilter( n, vTexCoord3D );

    // color
    gl_FragColor = texColor;

    // normal

     if ((vTexCoord3D.y > -0.1) && (n > 0.3 ) ) {

        const float e = .005926;

        float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
        float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
        float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

        vec3 normal = normalize( vNormal + .5 * vec3( n - nx, n - ny, n - nz ) / e );

        // diffuse light
        vec3 vLightWeighting = vec3( 0.0015926 );

        vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );
        float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.15 + 0.85;
        vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

        // specular light

        vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );

        float dirDotNormalHalf = dot( normal, dirHalfVector );

        float dirSpecularWeight = 0.0;
        if ( dirDotNormalHalf >= 0.0 )
            dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 5.0 );

        vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n / 3.1415926;
        //vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n * 2.0;

        gl_FragColor *= vec4( vLightWeighting, 1.0 ); //
    }
}