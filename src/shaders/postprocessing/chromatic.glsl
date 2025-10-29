uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  float offset = 0.006;
  vec4 color;
  color.r = texture2D(tDiffuse, vUv + vec2(offset, 0.0)).r;
  color.g = texture2D(tDiffuse, vUv).g;
  color.b = texture2D(tDiffuse, vUv - vec2(offset, 0.0)).b;
  gl_FragColor = color;
}
