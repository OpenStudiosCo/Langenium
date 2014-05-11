varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() 
{
    vNormal = normalize( normalMatrix * normal );

    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}