/**
 * SomnoPulse AI - Native Web Audio Sleep Relaxation Synthesizer
 * Zero external audio files. Generates Pink Noise, Brown Noise, and Binaural Delta Waves.
 */

export class SleepAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.activeNodes = [];
    this.timerId = null;
    this.currentMode = 'brown'; // 'pink' | 'brown' | 'binaural'
    this.volume = 0.15;
    this.masterGain = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (this.isPlaying) {
      this.stop();
      this.play(mode);
    }
  }

  play(mode = this.currentMode, durationMinutes = 30) {
    this.initContext();
    this.stop();

    this.currentMode = mode;
    const ctx = this.audioCtx;

    // Master Gain Node
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(this.volume, ctx.currentTime + 1.5);
    this.masterGain.connect(ctx.destination);

    if (mode === 'pink') {
      this.generatePinkNoise(ctx, this.masterGain);
    } else if (mode === 'brown') {
      this.generateBrownNoise(ctx, this.masterGain);
    } else if (mode === 'binaural') {
      this.generateBinauralDelta(ctx, this.masterGain);
    }

    this.isPlaying = true;

    // Optional timer to auto-stop after duration
    if (durationMinutes > 0) {
      if (this.timerId) clearTimeout(this.timerId);
      this.timerId = setTimeout(() => {
        this.stop();
      }, durationMinutes * 60 * 1000);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);
      } catch (e) {}
    }

    setTimeout(() => {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
      this.isPlaying = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }, 900);
  }

  // Pink Noise Generator (Paul Kellet's filter method)
  generatePinkNoise(ctx, output) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Subtle low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    noiseSource.connect(filter);
    filter.connect(output);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter);
  }

  // Brown Noise Generator (integrated white noise)
  generateBrownNoise(ctx, output) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for volume drop
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noiseSource.connect(filter);
    filter.connect(output);
    noiseSource.start();

    this.activeNodes.push(noiseSource, filter);
  }

  // Binaural Delta Waves (Stage 3 Deep Delta Frequency: 216Hz & 218.5Hz -> 2.5Hz beat)
  generateBinauralDelta(ctx, output) {
    const merger = ctx.createChannelMerger(2);

    // Left Ear (Base frequency: 216 Hz)
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 216;

    // Right Ear (Carrier + 2.5 Hz Delta Differential: 218.5 Hz)
    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 218.5;

    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel

    merger.connect(output);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, merger);
  }
}
