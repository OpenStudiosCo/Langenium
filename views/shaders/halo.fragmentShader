varying vec3 vNormal;
void main() 
{
	float intensity = pow( 0.85 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 ); 
    gl_FragColor = vec4( 1.0, 0.7, 0.0, 1.0 ) * intensity;
}