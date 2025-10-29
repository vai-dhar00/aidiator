export class AudioReactive {
    constructor() {
      this.audioCtx = null;
      this.analyser = null;
      this.dataArray = null;
      this.isPlaying = false;
    }
    async start() {
      if (this.isPlaying) return;
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      // Load and play audio
      const audio = new Audio('assets/audio/background.mp3');
      audio.crossOrigin = 'anonymous';
      const source = this.audioCtx.createMediaElementSource(audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      audio.loop = true;
      audio.play();
      this.isPlaying = true;
    }
    getFrequency() {
      if (!this.analyser) return 0;
      this.analyser.getByteFrequencyData(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++)
        sum += this.dataArray[i];
      return sum / this.dataArray.length / 255;
    }
  }
  