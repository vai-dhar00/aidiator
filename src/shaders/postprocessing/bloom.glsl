// Adapted from Three.js UnrealBloom
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float brightness = max(color.r, max(color.g, color.b));
  if (brightness > 0.8) color.rgb += brightness * 0.2;
  gl_FragColor = color;
}
