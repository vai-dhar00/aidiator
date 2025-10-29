import * as THREE from 'three';
import vertexShader from '/src/shaders/brain/vertex.glsl';
import fragmentShader from '/src/shaders/brain/fragment.glsl';

console.log('vertex:', vertexShader);
console.log('fragment:', fragmentShader);

export class ParticleSystem {
  constructor(canvas) {
    this.particleCount = 100000;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    this.init();
  }

  init() {
    // Setup attributes: positions, colors, etc.
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      // Color gradient
      colors[i * 3] = Math.random() * 0.4 + 0.1;
      colors[i * 3 + 1] = Math.random() * 0.8 + 0.1;
      colors[i * 3 + 2] = Math.random() * 0.6 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3));


    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0.0 } },
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.camera.position.z = 25;
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.particles.material.uniforms.uTime.value += 0.016;
    this.renderer.render(this.scene, this.camera);
  }
}
