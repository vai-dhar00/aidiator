import '../css/main.css';
import '../css/animations.css';
import '../css/responsive.css';

import { ParticleSystem } from './webgl/ParticleSystem.js';
import { AudioReactive } from './webgl/AudioReactive.js';
import { ScrollAnimations } from './animations/ScrollAnimations.js';
import { TextAnimations } from './animations/TextAnimations.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const audioReactive = new AudioReactive();
  const particleSystem = new ParticleSystem(canvas);
  new ScrollAnimations(particleSystem);
  new TextAnimations();
});
