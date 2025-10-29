export class TextAnimations {
    animateHero() {
      const chars = document.querySelectorAll('.hero-title .char');
      chars.forEach((char, i) => {
        setTimeout(() => {
          char.style.opacity = '1';
          char.style.transform = 'translateY(0)';
        }, i * 35);
      });
      document.querySelector('.hero-subtitle').style.opacity = '1';
    }
  }
  