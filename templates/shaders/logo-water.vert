varying vec3 vNormal;
varying vec3 vTexCoord3D;
varying vec3 vViewPosition;

uniform float time;

void main() 
{
    vNormal = normalize( normalMatrix * normal );

    vec4 mvPosition = modelMatrix * vec4( position, 1.0 );
    vViewPosition = cameraPosition - mvPosition.xyz;

    vTexCoord3D = 11.1 * ( position.xyz + vec3( -time, -time, -time ) );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}