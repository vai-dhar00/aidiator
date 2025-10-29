import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Create complete shader objects for post-processing
const bloomShader = {
  uniforms: {
    tDiffuse: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float brightness = max(color.r, max(color.g, color.b));
      if (brightness > 0.8) color.rgb += brightness * 0.2;
      gl_FragColor = color;
    }
  `
};

const chromaticShader = {
  uniforms: {
    tDiffuse: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      float offset = 0.006;
      vec4 color;
      color.r = texture2D(tDiffuse, vUv + vec2(offset, 0.0)).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - vec2(offset, 0.0)).b;
      color.a = 1.0;
      gl_FragColor = color;
    }
  `
};

const distortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.x += sin(uTime + vUv.y * 10.0) * 0.01;
      uv.y += cos(uTime + vUv.x * 10.0) * 0.01;
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `
};

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    
    // Add custom shader passes
    this.composer.addPass(new ShaderPass(bloomShader));
    this.composer.addPass(new ShaderPass(chromaticShader));
    
    this.distortionPass = new ShaderPass(distortionShader);
    this.composer.addPass(this.distortionPass);
  }
  
  update(time) {
    // Update distortion time uniform
    if (this.distortionPass.uniforms.uTime) {
      this.distortionPass.uniforms.uTime.value = time;
    }
  }
  
  render() {
    this.composer.render();
  }
}
