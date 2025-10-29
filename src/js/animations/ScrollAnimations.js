import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

console.log(gsap, ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimations {
  constructor(brainScene, particleSystem) {
    this.brainScene = brainScene;
    this.particleSystem = particleSystem;
    this.init();
  }
  init() {
    ScrollTrigger.create({
      trigger: "#brain-section",
      start: "top top",
      end: "bottom bottom",
      pin: "#brain-canvas",
      scrub: true,
      onUpdate: self => this.brainScene.setScrollProgress(self.progress)
    });

    gsap.to(this.brainScene, {
      morphProgress: 1,
      scrollTrigger: {
        trigger: "#services",
        start: "top bottom",
        end: "top top",
        scrub: 1
      }
    });

    gsap.utils.toArray(".service-card").forEach(card => {
      gsap.from(card, {
        y: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "top 30%",
          scrub: 1
        }
      });
    });
  }
}
