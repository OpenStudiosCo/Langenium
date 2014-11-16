  attribute vec3 pos;
  attribute vec3 tex;
  
  varying vec3 texOut;

  void main(void) {
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    texOut = tex;
  }
