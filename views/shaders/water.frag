uniform sampler2D mirrorSampler;
varying vec4 mirrorCoord;

uniform sampler2D noiseTexture;

varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec4 worldPosition;

uniform vec3 eye;
uniform float alpha;
uniform float time;
uniform float bias;
varying vec2 vUv;

float blendOverlay(float base, float blend) {
	return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.1 - blend ) ) );
}

float snoise ( vec3 coord, float scale, float time_factor ) {
	vec3 scaledCoord = coord * scale - (vNormal / time_factor + vec3(0.0, 0.0, -time / time_factor));

	vec2 uvTimeShift = vec2((scaledCoord.x + scaledCoord.z) / 2.0, scaledCoord.y)  + vec2( -0.75, 1.5 ) * (time / time_factor);
	vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
	vec2 uvNoiseTimeShift = vec2(scaledCoord.x, scaledCoord.y) + 0.5 * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );
	vec4 baseColor = texture2D( noiseTexture, uvNoiseTimeShift * vec2(4.0, 4.0) );

	return baseColor.b;
}

float heightMap( vec3 coord ) {
	float n = 0.0;
	
	n += 0.125 * abs(snoise(coord, 2., -25. ));
	n += 0.125 * abs(snoise(coord, 4., -25. ));
	n += 0.125 * abs(snoise(coord, 8., 25. ));	
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

vec4 colorFilter (float n) {

	vec4 color = vec4( vec3( 0.001 *n, 0.015 * n, .125 * n )  , 1.0 );

	color.r = limitColor(0.0, 0.05, color.r);
	color.g = limitColor(0.025, 0.5, color.g);
	color.b = limitColor (0.15, 0.95, color.b);

	return color;
}

void main(void) {


	
	
	// height 
	float n = heightMap( vTexCoord3D );

	// normal

	const float e = 0.01;

	float nx = heightMap( vTexCoord3D + vec3( e, 0.0, 0.0 ) );
	float ny = heightMap( vTexCoord3D + vec3( 0.0, e, 0.0 ) );
	float nz = heightMap( vTexCoord3D + vec3( 0.0, 0.0, e ) );

	vec3 normal = normalize( vNormal + 0.085 * vec3( n - nx, n - ny, n - nz ) / e );

	vec3 worldToEye = eye - worldPosition.xyz;
	vec3 eyeDirection = normalize(worldToEye);
	float distance = length(worldToEye);

	// mirror
	vec2 distortion = normal.xz * 20. * sqrt(distance) * 0.07;
	vec3 mirrorDistord = mirrorCoord.xyz + vec3(distortion.x, distortion.y, 1.0);
	vec4 reflection = texture2DProj(mirrorSampler, mirrorDistord);
	reflection.a = 0.45;

	// color
	vec4 texColor = colorFilter( n );
	texColor.a = 0.35;

	gl_FragColor = texColor;
	gl_FragColor += reflection;

	// diffuse light

	vec3 vLightWeighting = vec3( -0.001 );

	vec4 lDirection = viewMatrix * vec4( normalize( vec3( 0.0, 1.0, 0.0 ) ), 0.0 );
	float directionalLightWeighting = dot( normal, normalize( lDirection.xyz ) ) * 0.25 + 0.75;
	vLightWeighting += vec3( 1.0 ) * directionalLightWeighting;

	// specular light

	vec3 dirHalfVector = normalize( lDirection.xyz + normalize( vViewPosition ) );

	float dirDotNormalHalf = dot( normal, dirHalfVector );

	float dirSpecularWeight = 0.0;
	if ( dirDotNormalHalf >= 0.0 )
		dirSpecularWeight = ( 1.0 - n ) * pow( dirDotNormalHalf, 5.0 );

	vLightWeighting += vec3( 1.0, 1.0, 1.0 ) * dirSpecularWeight * n * 4.0;

	gl_FragColor *= vec4( vLightWeighting, 1.0 ); //

	

}