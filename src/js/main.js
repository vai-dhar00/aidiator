import '../css/main.css';
import '../css/animations.css';
import '../css/responsive.css';

import { BrainScene } from './webgl/BrainScene.js';
import { ParticleSystem } from './webgl/ParticleSystem.js';
import { PostProcessing } from './webgl/PostProcessing.js';
import { AudioReactive } from './webgl/AudioReactive.js';
import { ScrollAnimations } from './animations/ScrollAnimations.js';
import { TextAnimations } from './animations/TextAnimations.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const brainCanvas = document.getElementById('brain-canvas');
  const audioReactive = new AudioReactive();
  const brainScene = new BrainScene(brainCanvas, audioReactive);
  const particleSystem = new ParticleSystem(canvas);
  const postProcessing = new PostProcessing(
    brainScene.renderer,
    brainScene.scene,
    brainScene.camera
  );
  new ScrollAnimations(brainScene, particleSystem);
  new TextAnimations();
});
