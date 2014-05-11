varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() 
{
	vec3 worldCameraToVertex = cameraPosition - vWorldPosition;
	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
	viewCameraToVertex	= normalize(viewCameraToVertex);
	float intensity = pow( 0.65 - dot( vNormal, viewCameraToVertex  ), 4.0 ); 
    gl_FragColor = vec4( 1.0, 0.6, 0.0, 1.0 ) * intensity;
}