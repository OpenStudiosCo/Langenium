varying vec3 vNormal;
varying vec3 vTexCoord3D;
varying vec3 vViewPosition;

uniform sampler2D noiseTexture;
uniform float time;

float snoise ( vec3 coord, float scale, float time_factor ) {
    vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0., 0.0, -time / time_factor));

    vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y) + vec2( -0.7, 1.5 ) * time / time_factor * 0.015;
    vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
    vec2 uvNoiseTimeShift = vec2(scaledCoord.x, scaledCoord.z) + 0.5 * vec2( noiseGeneratorTimeShift.g, noiseGeneratorTimeShift.b );
    vec4 baseColor = texture2D( noiseTexture, uvNoiseTimeShift * vec2(4.0, 4.0) );

    return baseColor.b;
}

float heightMap( vec3 coord ) {
  float n = 0.0125 * abs(snoise(coord, 0.0625, -15000. ));
  n += 0.1125 * abs(snoise(coord, 5., -1500. ));
  n += 0.125 * abs(snoise(coord, 5., -750. ));
  n += 0.25 * abs(snoise(coord, 0.125, -500. ));
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

  vec4 color = vec4( vec3( 0.25 *n, 0.25 * n, 0.25 * n )  , 1.0 );

  color.r = limitColor(0.1, 0.9, color.r);
  color.g = limitColor(0.1, 0.9, color.g);
  color.b = limitColor (0.1, 0.9, color.b);

  return color;
}

void main() 
{
  float n = heightMap( vTexCoord3D );

  vec4 texColor = colorFilter( n );

  // color
  gl_FragColor = texColor;
  
  // normal
  const float e = .01;

  float nz = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
  float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
  float nx = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

  vec3 normal = normalize( vNormal + .085 * vec3( n - nx, n - ny, n - nz ) / e );

  // diffuse light

  vec3 vLightWeighting = vec3( -0.111 );

  vec4 lDirection = viewMatrix * vec4( normalize( vec3( 0.0, -1.0, 1.5 ) ), 0.0 );
  float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.35 + 0.65;
  vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

  // specular light

  vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );

  float dirDotNormalHalf = dot( normal, dirHalfVector );

  float dirSpecularWeight = 0.0;
  if ( dirDotNormalHalf >= 0.0 )
      dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 6.0 );

  vLightWeighting += vec3( 0.75, 0.75, 0.75 ) * dirSpecularWeight * n * 11.0;

  gl_FragColor *= vec4( vLightWeighting, 1.0 ); //
}