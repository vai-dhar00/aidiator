import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Import shaders
import brainVertexShader from '/src/shaders/brain/vertex.glsl';
import brainFragmentShader from '/src/shaders/brain/fragment.glsl';
import noiseShader from '/src/shaders/brain/noise.glsl';

// Import PostProcessing (required!)
import { PostProcessing } from './PostProcessing.js';

// LOG all shader imports for debugging
console.log('vertex:', brainVertexShader);
console.log('fragment:', brainFragmentShader);
console.log('noise:', noiseShader);

export class BrainScene {
    constructor(canvas, audioReactive) {
        this.canvas = canvas;
        this.audioReactive = audioReactive;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 8);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // State
        this.brainMesh = null;
        this.brainMaterial = null;
        this.mousePosition = new THREE.Vector3();
        this.scrollProgress = 0;
        this.morphProgress = 0;
        this.time = 0;

        // DEBUG: Test render with basic box if all else fails
        //this.scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })));

        this.init();
    }

    async init() {
        await this.loadBrainModel();
        this.setupLights();
        this.setupPostProcessing();
        this.addEventListeners();
        this.animate();
    }

    async loadBrainModel() {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);

        try {
            const gltf = await loader.loadAsync('/models/brain.glb');
            let brainGeometry = null;
            gltf.scene.traverse(obj => {
                if (obj.isMesh && obj.geometry && !brainGeometry) {
                    brainGeometry = obj.geometry;
                }
            });
            if (!brainGeometry) throw new Error('No geometry in brain.glb');
            // DEBUG: Log geometry attributes
            console.log('Brain geometry:', brainGeometry);

            // Custom brain region attribute
            const regionAttribute = new Float32Array(brainGeometry.attributes.position.count);
            for (let i = 0; i < regionAttribute.length; i++) {
                const vertex = new THREE.Vector3().fromBufferAttribute(brainGeometry.attributes.position, i);
                if (vertex.x < -0.3) regionAttribute[i] = 0.0;
                else if (vertex.x > 0.3) regionAttribute[i] = 1.0;
                else regionAttribute[i] = 0.5;
            }
            brainGeometry.setAttribute('brainRegion', new THREE.BufferAttribute(regionAttribute, 1));

            // --- DEBUG MATERIAL TOGGLE ---
            // Comment out custom shader for now to confirm render:
            // this.brainMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });

            // Custom shader (uncomment this after MeshBasicMaterial test)
            this.brainMaterial = new THREE.ShaderMaterial({
                vertexShader: brainVertexShader,
                fragmentShader: brainFragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uMorphProgress: { value: 0 },
                    uAudioFrequency: { value: 0 },
                    uMousePosition: { value: new THREE.Vector3() },
                    uScrollProgress: { value: 0 },
                    uColorLeft: { value: new THREE.Color(0x7A5AF8) },
                    uColorRight: { value: new THREE.Color(0x00D9D9) },
                    uColorCorpus: { value: new THREE.Color(0x00F0FF) },
                    uMetalness: { value: 0.3 },
                    uRoughness: { value: 0.4 },
                    uGlowIntensity: { value: 1.5 },
                    uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
                    cameraPosition: { value: this.camera.position },
                },
                side: THREE.DoubleSide,
                transparent: false,
            });

            this.brainMesh = new THREE.Mesh(brainGeometry, this.brainMaterial);

            // --- DEBUG: Force BrainMesh Center and Scale ---
            this.brainMesh.position.set(0, 0, 0);
            this.brainMesh.scale.set(1, 1, 1);
            this.scene.add(this.brainMesh);
            console.log('BrainMesh:', this.brainMesh);

            // --- DEBUG: Inspect bounding box ---
            const bbox = new THREE.Box3().setFromObject(this.brainMesh);
            console.log('BrainMesh bbox:', bbox);

            // Add neural connection lines
            this.createNeuralConnections(brainGeometry);

        } catch (error) {
            console.error('Error loading brain model:', error);
            this.createProceduralBrain();
        }
    }

    createProceduralBrain() {
        // Create left hemisphere
        const leftGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
        const leftMesh = new THREE.Mesh(leftGeometry, this.brainMaterial);
        leftMesh.position.x = -0.4;
        this.scene.add(leftMesh);
        // Create right hemisphere
        const rightGeometry = new THREE.SphereGeometry(1.5, 64, 64, Math.PI, Math.PI);
        const rightMesh = new THREE.Mesh(rightGeometry, this.brainMaterial);
        rightMesh.position.x = 0.4;
        this.scene.add(rightMesh);
        // Create corpus callosum
        const corpusGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32);
        corpusGeometry.rotateZ(Math.PI / 2);
        const corpusMesh = new THREE.Mesh(corpusGeometry, this.brainMaterial);
        this.scene.add(corpusMesh);
        this.brainMesh = new THREE.Group();
        this.brainMesh.add(leftMesh, rightMesh, corpusMesh);

        // DEBUG:
        console.log('Procedural fallback brain added:', this.brainMesh);
    }

    createNeuralConnections(brainGeometry) {
        const positions = brainGeometry.attributes.position;
        const connectionPoints = [];
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            if (Math.abs(x) < 0.2 && Math.random() > 0.95) {
                connectionPoints.push(
                    new THREE.Vector3(
                        positions.getX(i),
                        positions.getY(i),
                        positions.getZ(i)
                    )
                );
            }
        }
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00D9D9,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        });
        for (let i = 0; i < connectionPoints.length - 1; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                connectionPoints[i],
                connectionPoints[i + 1],
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            this.brainMesh.add(line);
        }
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);
        const keyLight = new THREE.PointLight(0x7A5AF8, 2, 20);
        keyLight.position.set(5, 5, 5);
        this.scene.add(keyLight);
        const fillLight = new THREE.PointLight(0x00D9D9, 1.5, 20);
        fillLight.position.set(-5, -3, 5);
        this.scene.add(fillLight);
        const rimLight = new THREE.PointLight(0x00F0FF, 1, 15);
        rimLight.position.set(0, 0, -5);
        this.scene.add(rimLight);
    }

    setupPostProcessing() {
        this.postProcessing = new PostProcessing(this.renderer, this.scene, this.camera);
    }

    injectNoiseShader(shader) {
        return noiseShader + '\n' + shader;
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mousePosition.z = 0;
            this.mousePosition.unproject(this.camera);
            this.mousePosition.sub(this.camera.position).normalize();
            const distance = -this.camera.position.z / this.mousePosition.z;
            this.mousePosition.copy(this.camera.position).add(
                this.mousePosition.multiplyScalar(distance)
            );
        });
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateUniforms() {
        if (!this.brainMaterial) return;
        const uniforms = this.brainMaterial.uniforms;
        uniforms.uTime.value = this.time;
        uniforms.uMousePosition.value.copy(this.mousePosition);
        uniforms.uScrollProgress.value = this.scrollProgress;
        uniforms.uMorphProgress.value = this.morphProgress;
        if (this.audioReactive) {
            uniforms.uAudioFrequency.value = this.audioReactive.getFrequency();
        }
    }

    setScrollProgress(progress) {
        this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
    }

    setMorphProgress(progress) {
        this.morphProgress = THREE.MathUtils.clamp(progress, 0, 1);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        if (this.brainMesh) {
            this.brainMesh.rotation.y += 0.001;
            this.brainMesh.rotation.x = Math.sin(this.time * 0.3) * 0.1;
        }
        this.updateUniforms();

        // -- DEBUG: REMOVE POSTPROCESSING TO ISOLATE --
        // this.renderer.render(this.scene, this.camera);

        // Default render logic (re-enable after all debug is done)
        if (this.postProcessing) {
            this.postProcessing.update(this.time);
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((mat) => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        this.renderer.dispose();
        this.renderer.forceContextLoss();
    }
}
