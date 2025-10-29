attribute float size;
attribute vec3 particleColor;
uniform float uTime;
varying vec3 vColor;

void main() {
  vColor = color;
  vec3 pos = position;
  pos.x += sin(uTime + pos.y) * 0.2;
  pos.y += cos(uTime + pos.z) * 0.15;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 2.0 * (300.0 / length(pos));
}
