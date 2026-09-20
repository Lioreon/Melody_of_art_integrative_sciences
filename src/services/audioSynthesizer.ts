/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private stringOsc1: OscillatorNode | null = null;
  private stringOsc2: OscillatorNode | null = null;
  private stringFilter: BiquadFilterNode | null = null;
  private stringGain: GainNode | null = null;
  private isOrchestraPlaying: boolean = false;

  constructor() {
    // Lazy init context on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a metronome click on beat
  public playClick(isFirstBeat: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFirstBeat ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFirstBeat ? 880 : 440, this.ctx.currentTime); // A5 or A4

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Play a specific pitch note (e.g. C4=261.63, D4=293.66, etc.) with duration and musical ADSR envelope
  public playPitchNote(freq: number, durationSec: number = 0.5, timbre: 'warm' | 'flute' | 'bell' = 'warm') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = Math.max(0.08, durationSec);

    // Primary fundamental oscillator
    const osc1 = this.ctx.createOscillator();
    // Subtle second harmonic for acoustic warmth
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    if (timbre === 'bell') {
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, now); // Metallic chime ratio
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
    } else if (timbre === 'flute') {
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now); // Octave overtone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
    } else {
      // Warm acoustic tone
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
    }

    osc1.frequency.setValueAtTime(freq, now);

    // Calculate attack, sustain and release times proportionally
    const attackTime = Math.min(0.035, dur * 0.15);
    const releaseTime = Math.min(0.12, dur * 0.25);
    const sustainEnd = Math.max(now + attackTime, now + dur - releaseTime);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(0.35, now + attackTime);
    noteGain.gain.setValueAtTime(0.30, sustainEnd);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc2.onended = () => { osc1.disconnect(); osc2.disconnect(); filter.disconnect(); noteGain.disconnect(); };
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }

  // Play success feedback chime when target distance reached
  public playHitSound(precisionScore: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High precision gets a brighter pentatonic chime
    const baseFreq = precisionScore > 90 ? 1046.50 : precisionScore > 75 ? 880 : 659.25; // C6, A5, E5
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start();
    osc.stop(now + 0.25);
  }

  // Start continuous orchestra synth whose timbre/volume responds to palm distance
  public startOrchestraDrone() {
    if (this.isOrchestraPlaying) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Sawtooth / Warm triangle string section emulation
    this.stringOsc1 = this.ctx.createOscillator();
    this.stringOsc2 = this.ctx.createOscillator();
    this.stringFilter = this.ctx.createBiquadFilter();
    this.stringGain = this.ctx.createGain();

    // Chord: D Major / A Major orchestral pad (D3 = 146.83, A3 = 220)
    this.stringOsc1.type = 'sawtooth';
    this.stringOsc1.frequency.setValueAtTime(146.83, now);

    this.stringOsc2.type = 'triangle';
    this.stringOsc2.frequency.setValueAtTime(220, now);

    this.stringFilter.type = 'lowpass';
    this.stringFilter.frequency.setValueAtTime(400, now); // Initial dim sound

    this.stringGain.gain.setValueAtTime(0.05, now);

    this.stringOsc1.connect(this.stringFilter);
    this.stringOsc2.connect(this.stringFilter);
    this.stringFilter.connect(this.stringGain);
    this.stringGain.connect(this.masterGain);

    this.stringOsc1.start();
    this.stringOsc2.start();
    this.isOrchestraPlaying = true;
  }

  // Dynamically update orchestra brightness and volume based on palm distance (10cm - 100cm)
  public updateOrchestraFromDistance(distanceCm: number) {
    if (!this.isOrchestraPlaying || !this.ctx || !this.stringFilter || !this.stringGain) return;

    // Normalize distance 10cm -> 100cm to 0 -> 1
    const norm = Math.max(0, Math.min(1, (distanceCm - 10) / 90));

    // Filter frequency: 300Hz (piano/tight palms) -> 3500Hz (forte/wide palms)
    const filterFreq = 300 + norm * 3200;
    // Volume: 0.05 -> 0.35
    const volume = 0.03 + norm * 0.30;

    const now = this.ctx.currentTime;
    this.stringFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.stringGain.gain.setTargetAtTime(volume, now, 0.05);
  }

  public stopOrchestraDrone() {
    if (!this.isOrchestraPlaying) return;
    if (this.stringOsc1) {
      try { this.stringOsc1.stop(); } catch {}
      this.stringOsc1.disconnect();
    }
    if (this.stringOsc2) {
      try { this.stringOsc2.stop(); } catch {}
      this.stringOsc2.disconnect();
    }
    this.stringFilter?.disconnect();
    this.stringGain?.disconnect();
    this.stringOsc1 = null; this.stringOsc2 = null;
    this.stringFilter = null; this.stringGain = null;
    this.isOrchestraPlaying = false;
  }
}

export const audioSynthesizer = new AudioSynthesizer();
