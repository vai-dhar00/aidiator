uniform sampler2D tDiffuse;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  uv.x += sin(uTime + vUv.y * 10.0) * 0.01;
  uv.y += cos(uTime + vUv.x * 10.0) * 0.01;
  gl_FragColor = texture2D(tDiffuse, uv);
}
