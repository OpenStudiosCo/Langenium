varying vec3 vNormal;
varying vec3 vTexCoord3D;
varying vec3 vViewPosition;

uniform sampler2D noiseTexture;
uniform float time;

float snoise ( vec3 coord, float scale, float time_factor ) {
    vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0.0, 0.0, -time / time_factor));

    vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y) + vec2( -0.7, 1.5 ) * time / time_factor * 0.015;
    vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
    vec2 uvNoiseTimeShift = vec2(scaledCoord.x, scaledCoord.y) + 0.5 * vec2( noiseGeneratorTimeShift.g, noiseGeneratorTimeShift.b );
    vec4 baseColor = texture2D( noiseTexture, uvNoiseTimeShift * vec2(4.0, 4.0) );

    return baseColor.b;
}

float heightMap( vec3 coord ) {
  float n = 0.0;

  n = 0.65 * abs(snoise(coord, 0.0625, 500. ));
  n += 0.5 * abs(snoise(coord, 0.125, -500. ));
  n += 0.125 * abs(snoise(coord, 5., -50. ));
  n -= 0.125 * abs(snoise(coord, 100., 150. ));
  n *= .75;

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

vec4 colorFilter(float n) {

  vec4 color = vec4( vec3( 0.01 *n, 0.25 * n, .95 * n )  , 1.0 );

  color.r = limitColor(0.0, 0.05, color.r);
  color.g = limitColor(0.015, 0.25, color.g);
  color.b = limitColor (0.025, 0.75, color.b);

  return color;
}

void main() 
{
    float n = heightMap( vTexCoord3D );

    vec4 texColor = colorFilter( n );

    // color
    gl_FragColor = texColor;
  
  // normal

  const float e = 0.01;

  float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
  float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
  float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

  vec3 normal = normalize( vNormal + 0.085 * vec3( n - nx, n - ny, n - nz ) / e );

  // diffuse light

  vec3 vLightWeighting = vec3( -0.01 );

  vec4 lDirection = viewMatrix * vec4( normalize( vec3( 0.0, -1.0, 1.0 ) ), 0.0 );
  float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.15 + 0.85;
  vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

  // specular light

  vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );

  float dirDotNormalHalf = dot( normal, dirHalfVector );

  float dirSpecularWeight = 0.0;
  if ( dirDotNormalHalf >= 0.0 )
    dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 15.0 );

  vLightWeighting += vec3( 0.5, 0.5, 1.5 ) * dirSpecularWeight * n * 12.0;

  gl_FragColor *= vec4( vLightWeighting, 1.0 ); //
}