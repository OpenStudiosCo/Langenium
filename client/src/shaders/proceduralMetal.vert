varying vec3 vUv;

void main() {
    vUv = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
