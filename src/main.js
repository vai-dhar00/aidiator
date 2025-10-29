import './css/main.css';
import './css/animations.css';
import './css/responsive.css';
import { BrainScene } from './js/webgl/BrainScene.js';
import { ParticleSystem } from './js/webgl/ParticleSystem.js';
import { PostProcessing } from './js/webgl/PostProcessing.js';
import { AudioReactive } from './js/webgl/AudioReactive.js';
import { ScrollAnimations } from './js/animations/ScrollAnimations.js';
import { TextAnimations } from './js/animations/TextAnimations.js';

class App {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        //this.brainCanvas = document.getElementById('brain-canvas');
        // Initialize systems
        this.audioReactive = new AudioReactive();
        this.brainScene = new BrainScene(this.brainCanvas, this.audioReactive);
        this.particleSystem = new ParticleSystem(this.canvas);
        this.postProcessing = new PostProcessing(this.brainScene.renderer, this.brainScene.scene, this.brainScene.camera);
        // Initialize animations
        this.scrollAnimations = new ScrollAnimations(this.brainScene, this.particleSystem);
        this.textAnimations = new TextAnimations();
        // Start
        this.init();
    }

    init() {
        // Loading screen
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
                this.textAnimations.animateHero();
            }, 1500);
        });
        // Enable audio on first user interaction
        document.addEventListener('click', () => {
            this.audioReactive.start();
        }, { once: true });
    }
}
// Initialize app
new App();