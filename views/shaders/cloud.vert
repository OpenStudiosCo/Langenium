varying vec3 vTexCoord3D;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float time;
uniform float scale;

varying vec2 vUv;

void main() 
{ 
    vUv = uv;

  // mirror stuff
  vec4 mvPosition = modelMatrix * vec4( position, 1.0 );

  vNormal = normalize( normalMatrix * normal );
  vViewPosition = cameraPosition - mvPosition.xyz;
  vTexCoord3D = scale * ( position.xyz + vec3( 0.0, 0.0, -time ) );
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}