varying vec3 vNormal;
varying vec3 vViewPosition;

void main() 
{
    vNormal = normalize( normalMatrix * normal );

    vec4 mvPosition = modelMatrix * vec4( position, 1.0 );
    vViewPosition = cameraPosition - mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}