/**
 * Web Audio API Engine for NotaSakti Maestro
 * Polyphonic Acoustic Piano Synthesizer, Metronome, SFX (Sound Benar & Salah), and Pitch Detection
 */

import { HitRating } from '../types/music';

// Mapping MIDI note to frequency
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Note name to MIDI
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function pitchToMidi(pitch: string): number {
  const clean = pitch.trim();
  const match = clean.match(/^([A-G])([#b]?)(-?\d+)$/);
  if (!match) return 60; // Default C4

  const [, step, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  let semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[step] ?? 0;
  if (accidental === '#') semitone += 1;
  else if (accidental === 'b') semitone -= 1;

  return (octave + 1) * 12 + semitone;
}

export function midiToPitch(midi: number): { pitch: string; step: string; octave: number; accidental: '#' | null } {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];
  const step = noteName[0];
  const accidental = noteName.includes('#') ? '#' : null;
  return {
    pitch: `${noteName}${octave}`,
    step,
    octave,
    accidental,
  };
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private activeVoices: Map<number, { stop: () => void }> = new Map();
  private isUnlocked = false;

  // Pitch detector members
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private isListeningPitch = false;
  private pitchDetectionCallback: ((data: { pitch: string; midi: number; hz: number; cents: number; volume: number } | null) => void) | null = null;
  private pitchAnimationId: number | null = null;

  constructor() {
    // Automatically bind global listeners to resume AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
      };
      window.addEventListener('click', unlock, { once: false, passive: true });
      window.addEventListener('keydown', unlock, { once: false, passive: true });
      window.addEventListener('touchstart', unlock, { once: false, passive: true });
      window.addEventListener('pointerdown', unlock, { once: false, passive: true });
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master dynamics compressor to ensure punchy, clear sound without distortion
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.95; // Clear, loud piano volume
      this.masterGain.connect(this.compressor);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.85; // Distinct, clear SFX volume
      this.sfxGain.connect(this.compressor);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlockAudio(): void {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  /**
   * Synthesize a realistic, warm, expressive acoustic piano sound
   */
  public playNote(midi: number, durationSec: number = 1.0, velocity: number = 0.95): void {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const freq = midiToFrequency(midi);
    const now = this.ctx.currentTime;

    // Cut off previous voice on same pitch smoothly if exists
    if (this.activeVoices.has(midi)) {
      this.activeVoices.get(midi)?.stop();
      this.activeVoices.delete(midi);
    }

    // Voice Gain Node
    const voiceGain = this.ctx.createGain();
    voiceGain.connect(this.masterGain);

    // Warm piano body resonant lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 7, 7500), now);
    filter.Q.setValueAtTime(1.1, now);
    filter.connect(voiceGain);

    // 1. Fundamental oscillator (triangle wave)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // 2. Fundamental body (sine wave)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, now);

    // 3. Second harmonic (sine wave at 2 * freq)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, now);

    // 4. Third harmonic (subtle overtone at 3 * freq)
    const osc4 = this.ctx.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(freq * 3.008, now);

    // Gains for harmonic mixing
    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    const g3 = this.ctx.createGain();
    const g4 = this.ctx.createGain();

    g1.gain.value = 0.55 * velocity;
    g2.gain.value = 0.35 * velocity;
    g3.gain.value = 0.22 * velocity;
    g4.gain.value = 0.08 * velocity;

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    osc4.connect(g4);

    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);
    g4.connect(filter);

    // Felt hammer strike click transient
    const clickOsc = this.ctx.createOscillator();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(Math.min(freq * 4.5, 4000), now);
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.2 * velocity, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(filter);

    // ADSR Envelope: Instant punchy attack, natural piano decay
    const attackTime = 0.005;
    const decayTime = Math.min(durationSec * 0.85, 1.4);
    const releaseTime = 0.2;

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(1.0 * velocity, now + attackTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.35 * velocity, now + attackTime + decayTime);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + decayTime + releaseTime);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc4.start(now);
    clickOsc.start(now);

    const stopTime = now + attackTime + decayTime + releaseTime + 0.05;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
    osc4.stop(stopTime);
    clickOsc.stop(now + 0.025);

    const voiceEntry = {
      stop: () => {
        try {
          voiceGain.gain.cancelScheduledValues(this.ctx!.currentTime);
          voiceGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.06);
        } catch {
          // voice ended
        }
      },
    };
    this.activeVoices.set(midi, voiceEntry);

    setTimeout(() => {
      this.activeVoices.delete(midi);
    }, (stopTime - now) * 1000);
  }

  /**
   * Sound Penanda BENAR (Joyful, crystal-clear success chime & ding)
   * Plays a distinct, bright 2-step chime + sparkle (G5 -> C6 -> E6 shimmer)
   */
  public playCorrectSound(): void {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    const now = this.ctx.currentTime;

    // Chime notes: G5 (784Hz) -> C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1568Hz)
    const chimePitches = [
      { f: 783.99, delay: 0.0, dur: 0.28, vol: 0.35 },
      { f: 1046.5, delay: 0.06, dur: 0.35, vol: 0.45 },
      { f: 1318.5, delay: 0.12, dur: 0.4, vol: 0.4 },
      { f: 1568.0, delay: 0.18, dur: 0.45, vol: 0.3 },
    ];

    chimePitches.forEach(({ f, delay, dur, vol }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Sound Penanda SALAH (Distinct, unmistakable educational buzzer "Tet-tot!")
   * Dual-pulse dissonant buzzer with warm filter (clearly audible on all speakers)
   */
  public playWrongSound(): void {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    const now = this.ctx.currentTime;

    // Pulse 1: Low dissonant buzz (220 Hz + 233 Hz)
    // Pulse 2: Lower descending buzz (165 Hz + 175 Hz)
    const pulses = [
      { f1: 220, f2: 233, delay: 0.0, dur: 0.12, vol: 0.45 },
      { f1: 165, f2: 175, delay: 0.14, dur: 0.18, vol: 0.5 },
    ];

    pulses.forEach(({ f1, f2, delay, dur, vol }) => {
      // Filter to soften the harshness of raw sawtooth
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + delay);
      filter.connect(this.sfxGain!);

      // Primary tone
      const osc1 = this.ctx!.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(f1, now + delay);

      // Dissonant minor second overtone
      const osc2 = this.ctx!.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(f2, now + delay);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);

      osc1.start(now + delay);
      osc2.start(now + delay);
      osc1.stop(now + delay + dur + 0.05);
      osc2.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Sound effects dispatcher for game timing rating
   */
  public playHitSound(rating: HitRating): void {
    if (rating === 'PERFECT' || rating === 'GOOD') {
      this.playCorrectSound();
    } else if (rating === 'MISS') {
      this.playWrongSound();
    }
  }

  /**
   * Metronome Click Sound
   */
  public playMetronome(isDownbeat: boolean = false): void {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq = isDownbeat ? 1400 : 900;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(isDownbeat ? 0.35 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Test audio immediately to ensure user hears both sounds
   */
  public testAudio(type: 'piano' | 'correct' | 'wrong'): void {
    this.unlockAudio();
    if (type === 'piano') {
      this.playNote(60, 0.8, 1.0); // Middle C
    } else if (type === 'correct') {
      this.playCorrectSound();
    } else if (type === 'wrong') {
      this.playWrongSound();
    }
  }

  /**
   * Microphone Pitch Detection using Autocorrelation
   */
  public async startPitchDetection(
    callback: (data: { pitch: string; midi: number; hz: number; cents: number; volume: number } | null) => void
  ): Promise<boolean> {
    try {
      this.init();
      if (!this.ctx) return false;

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.ctx.createAnalyser();
      this.micAnalyser.fftSize = 2048;
      this.micSource.connect(this.micAnalyser);

      this.isListeningPitch = true;
      this.pitchDetectionCallback = callback;

      const buffer = new Float32Array(this.micAnalyser.fftSize);

      const detectLoop = () => {
        if (!this.isListeningPitch || !this.micAnalyser) return;

        this.micAnalyser.getFloatTimeDomainData(buffer);

        // Calculate Root Mean Square (RMS) volume
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSquares / buffer.length);

        // Noise gate: ignore quiet background ambience
        if (rms < 0.012) {
          if (this.pitchDetectionCallback) this.pitchDetectionCallback(null);
          this.pitchAnimationId = requestAnimationFrame(detectLoop);
          return;
        }

        // Autocorrelation Pitch Detection
        const hz = this.autoCorrelate(buffer, this.ctx!.sampleRate);
        if (hz !== -1 && hz >= 65 && hz <= 1200) {
          const midiFloat = 69 + 12 * Math.log2(hz / 440);
          const nearestMidi = Math.round(midiFloat);
          const cents = Math.round((midiFloat - nearestMidi) * 100);
          const { pitch } = midiToPitch(nearestMidi);

          if (this.pitchDetectionCallback) {
            this.pitchDetectionCallback({
              pitch,
              midi: nearestMidi,
              hz: Math.round(hz * 10) / 10,
              cents,
              volume: Math.min(1, rms * 5),
            });
          }
        } else {
          if (this.pitchDetectionCallback) this.pitchDetectionCallback(null);
        }

        this.pitchAnimationId = requestAnimationFrame(detectLoop);
      };

      this.pitchAnimationId = requestAnimationFrame(detectLoop);
      return true;
    } catch (err) {
      console.warn('Microphone access denied or pitch detector error:', err);
      return false;
    }
  }

  public stopPitchDetection(): void {
    this.isListeningPitch = false;
    if (this.pitchAnimationId) {
      cancelAnimationFrame(this.pitchAnimationId);
      this.pitchAnimationId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.micAnalyser = null;
    if (this.pitchDetectionCallback) {
      this.pitchDetectionCallback(null);
      this.pitchDetectionCallback = null;
    }
  }

  /**
   * Fast Normalized Autocorrelation Algorithm
   */
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }

    const rootMeanSquare = Math.sqrt(sumOfSquares / SIZE);
    if (rootMeanSquare < 0.01) return -1; // Not enough signal

    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.2;

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }

    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Float32Array(trimmedBuffer.length).fill(0);

    for (let i = 0; i < trimmedBuffer.length; i++) {
      for (let j = 0; j < trimmedBuffer.length - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxVal = -1;
    let maxPos = -1;

    for (let i = d; i < trimmedBuffer.length; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxPos = i;
      }
    }

    let T0 = maxPos;

    if (T0 > 0 && T0 < trimmedBuffer.length - 1) {
      const x1 = c[T0 - 1];
      const x2 = c[T0];
      const x3 = c[T0 + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a) {
        T0 = T0 - b / (2 * a);
      }
    }

    return sampleRate / T0;
  }
}

export const soundEngine = new SoundEngine();
