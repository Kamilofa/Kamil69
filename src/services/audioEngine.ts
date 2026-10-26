import { VoiceStyle } from '../types/voice';

// Pure Web Audio API & Speech Synthesis Engine
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: DynamicsCompressorNode | null = null;
  private outputGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  
  // Audio Nodes for real-time DSP
  private lowFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highFilter: BiquadFilterNode | null = null;
  private formantF1: BiquadFilterNode | null = null;
  private formantF2: BiquadFilterNode | null = null;
  private waveshaper: WaveShaperNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private robotOsc: OscillatorNode | null = null;
  private robotModGain: GainNode | null = null;
  private chorusDelay: DelayNode | null = null;
  private chorusLfo: OscillatorNode | null = null;
  private chorusGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Live mic and buffer sources
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private currentBufferSource: AudioBufferSourceNode | null = null;
  private isMicActive = false;

  // Media Recorder
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private recordingStartTime = 0;

  // Synthetic phonetic formant profiles for "Mu-ni-ra"
  // F1 & F2 frequencies for vowels [u] (ou), [i], [a]
  private readonly PHONEMES = [
    { label: 'M', duration: 0.12, f1: 250, f2: 1000, gain: 0.6 },
    { label: 'ou', duration: 0.22, f1: 320, f2: 800, gain: 1.0 },
    { label: 'n', duration: 0.10, f1: 280, f2: 1400, gain: 0.5 },
    { label: 'i', duration: 0.20, f1: 280, f2: 2300, gain: 0.95 },
    { label: 'r', duration: 0.08, f1: 450, f2: 1700, gain: 0.7 },
    { label: 'a', duration: 0.35, f1: 750, f2: 1300, gain: 1.0 }
  ];

  constructor() {
    // Lazy initialized on first user interaction to satisfy browser autoplay
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.buildDspGraph();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser) {
      this.getAudioContext();
    }
    return this.analyser;
  }

  private buildDspGraph(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Analyser for real-time visualization
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;

    // Master Output & Stream Destination for recording
    this.outputGain = ctx.createGain();
    this.outputGain.gain.setValueAtTime(0.9, ctx.currentTime);

    this.destinationNode = ctx.createMediaStreamDestination();

    // 3-Band Equalizer
    this.lowFilter = ctx.createBiquadFilter();
    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.setValueAtTime(180, ctx.currentTime);

    this.midFilter = ctx.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.setValueAtTime(1600, ctx.currentTime);
    this.midFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    this.highFilter = ctx.createBiquadFilter();
    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.setValueAtTime(6500, ctx.currentTime);

    // Formant Peaking Resonators (shifts vocal tract identity)
    this.formantF1 = ctx.createBiquadFilter();
    this.formantF1.type = 'peaking';
    this.formantF1.frequency.setValueAtTime(700, ctx.currentTime);
    this.formantF1.Q.setValueAtTime(2.5, ctx.currentTime);
    this.formantF1.gain.setValueAtTime(3, ctx.currentTime);

    this.formantF2 = ctx.createBiquadFilter();
    this.formantF2.type = 'peaking';
    this.formantF2.frequency.setValueAtTime(2100, ctx.currentTime);
    this.formantF2.Q.setValueAtTime(3.0, ctx.currentTime);
    this.formantF2.gain.setValueAtTime(3, ctx.currentTime);

    // Warmth / Saturation WaveShaper
    this.waveshaper = ctx.createWaveShaper();
    this.waveshaper.curve = this.makeDistortionCurve(10);
    this.waveshaper.oversample = '2x';

    // Dynamics Compressor
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    this.compressor.knee.setValueAtTime(12, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.015, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.18, ctx.currentTime);

    // Delay / Echo
    this.delayNode = ctx.createDelay(1.5);
    this.delayNode.delayTime.setValueAtTime(0.2, ctx.currentTime);
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.2, ctx.currentTime);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Reverb Convolver & Dry/Wet
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.createImpulseResponse('studio', 1.5, 2.0);
    this.reverbGain = ctx.createGain();
    this.reverbGain.gain.setValueAtTime(0.25, ctx.currentTime);
    this.dryGain = ctx.createGain();
    this.dryGain.gain.setValueAtTime(0.85, ctx.currentTime);

    // Robot / Vocoder Ring Modulator setup
    this.robotOsc = ctx.createOscillator();
    this.robotOsc.type = 'sawtooth';
    this.robotOsc.frequency.setValueAtTime(220, ctx.currentTime);
    this.robotModGain = ctx.createGain();
    this.robotModGain.gain.setValueAtTime(0, ctx.currentTime); // 0 = off, 1 = on
    this.robotOsc.connect(this.robotModGain.gain);
    try {
      this.robotOsc.start();
    } catch {
      // already started or ignored
    }

    // Chorus Modulation
    this.chorusDelay = ctx.createDelay(0.1);
    this.chorusDelay.delayTime.setValueAtTime(0.02, ctx.currentTime);
    this.chorusGain = ctx.createGain();
    this.chorusGain.gain.setValueAtTime(0.1, ctx.currentTime);
    this.chorusLfo = ctx.createOscillator();
    this.chorusLfo.frequency.setValueAtTime(1.2, ctx.currentTime);
    const chorusLfoDepth = ctx.createGain();
    chorusLfoDepth.gain.setValueAtTime(0.003, ctx.currentTime);
    this.chorusLfo.connect(chorusLfoDepth);
    chorusLfoDepth.connect(this.chorusDelay.delayTime);
    try {
      this.chorusLfo.start();
    } catch {
      // ignore
    }

    // Connect core DSP pipeline
    // lowFilter -> midFilter -> highFilter -> formantF1 -> formantF2 -> waveshaper -> compressor
    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);
    this.highFilter.connect(this.formantF1);
    this.formantF1.connect(this.formantF2);
    this.formantF2.connect(this.waveshaper);
    this.waveshaper.connect(this.compressor);

    // Split from compressor to Dry, Reverb, Delay, Chorus
    this.compressor.connect(this.dryGain);

    // Reverb branch
    this.compressor.connect(this.convolver);
    this.convolver.connect(this.reverbGain);

    // Delay branch
    this.compressor.connect(this.delayNode);
    this.delayNode.connect(this.reverbGain);

    // Chorus branch
    this.compressor.connect(this.chorusDelay);
    this.chorusDelay.connect(this.chorusGain);

    // Sum to master output
    this.dryGain.connect(this.outputGain);
    this.reverbGain.connect(this.outputGain);
    this.chorusGain.connect(this.outputGain);

    // Output to speakers and recording destination and visualizer analyser
    this.outputGain.connect(ctx.destination);
    this.outputGain.connect(this.destinationNode);
    this.outputGain.connect(this.analyser);
  }

  // Update DSP graph live with VoiceStyle settings
  public applyVoiceStyle(style: VoiceStyle): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Equalizer 3-Bands
    if (this.lowFilter) {
      this.lowFilter.gain.setTargetAtTime(style.bassGain, now, 0.05);
    }
    if (this.midFilter) {
      this.midFilter.gain.setTargetAtTime(style.midGain, now, 0.05);
    }
    if (this.highFilter) {
      this.highFilter.gain.setTargetAtTime(style.trebleGain, now, 0.05);
    }

    // 2. Formant Shifts (vocal tract length & gender/identity simulation)
    const baseF1 = 650;
    const baseF2 = 2100;
    const shift = Math.max(0.6, Math.min(1.8, style.formantShift));
    if (this.formantF1) {
      this.formantF1.frequency.setTargetAtTime(baseF1 * shift, now, 0.05);
      this.formantF1.gain.setTargetAtTime(style.timbreWarmth > 60 ? 5 : 2, now, 0.05);
    }
    if (this.formantF2) {
      this.formantF2.frequency.setTargetAtTime(baseF2 * shift, now, 0.05);
      this.formantF2.gain.setTargetAtTime(style.breathiness > 50 ? 5 : 2, now, 0.05);
    }

    // 3. Warmth / Saturation
    if (this.waveshaper) {
      const drive = Math.max(1, Math.min(60, (style.timbreWarmth / 100) * 45));
      this.waveshaper.curve = this.makeDistortionCurve(drive);
    }

    // 4. Dynamics Compressor
    if (this.compressor) {
      const compVal = style.compression; // 0 to 1
      this.compressor.threshold.setTargetAtTime(-12 - compVal * 28, now, 0.05);
      this.compressor.ratio.setTargetAtTime(2 + compVal * 12, now, 0.05);
    }

    // 5. Reverb
    if (this.convolver && this.reverbGain && this.dryGain) {
      if (style.reverbType !== 'none') {
        this.convolver.buffer = this.createImpulseResponse(style.reverbType, 2.0, 2.5);
        this.reverbGain.gain.setTargetAtTime(style.reverbMix, now, 0.05);
        this.dryGain.gain.setTargetAtTime(1.0 - style.reverbMix * 0.4, now, 0.05);
      } else {
        this.reverbGain.gain.setTargetAtTime(0, now, 0.05);
        this.dryGain.gain.setTargetAtTime(1.0, now, 0.05);
      }
    }

    // 6. Delay / Echo
    if (this.delayNode && this.delayFeedback) {
      this.delayNode.delayTime.setTargetAtTime(Math.max(0.01, style.echoTime), now, 0.05);
      this.delayFeedback.gain.setTargetAtTime(style.echoFeedback, now, 0.05);
    }

    // 7. Chorus
    if (this.chorusGain) {
      this.chorusGain.gain.setTargetAtTime(style.chorusMix * 0.45, now, 0.05);
    }

    // 8. Robot / Vocoder Modulator
    if (this.robotOsc && this.robotModGain) {
      if (style.robotMod) {
        this.robotOsc.frequency.setTargetAtTime(style.robotFreq, now, 0.05);
        this.robotModGain.gain.setTargetAtTime(0.85, now, 0.05);
      } else {
        this.robotModGain.gain.setTargetAtTime(0, now, 0.05);
      }
    }
  }

  // Play Speech Synthesis using Web Speech API, with real-time audio animation
  public speakText(text: string, style: VoiceStyle, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      // Fallback to pure Web Audio phonetic synthesis
      this.synthesizePhoneticVocal(text, style, onEnd);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick best matching French / multilingual voice
    const voices = window.speechSynthesis.getVoices();
    const frVoices = voices.filter(v => v.lang.startsWith('fr') || v.lang.startsWith('en'));
    const femaleVoice = frVoices.find(v => v.name.toLowerCase().includes('celine') || 
                                          v.name.toLowerCase().includes('julie') || 
                                          v.name.toLowerCase().includes('amélie') || 
                                          v.name.toLowerCase().includes('female') || 
                                          v.name.toLowerCase().includes('woman') ||
                                          v.name.toLowerCase().includes('hortense'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else if (frVoices.length > 0) {
      utterance.voice = frVoices[0];
    }

    // Pitch mapping: semitones (-12 to +12) -> pitch (0.5 to 2.0)
    // standard formula: 2 ^ (semitones / 12)
    const pitchMultiplier = Math.pow(2, style.pitch / 12);
    utterance.pitch = Math.max(0.2, Math.min(2.0, pitchMultiplier));
    utterance.rate = Math.max(0.5, Math.min(2.0, style.speed));
    utterance.volume = 1.0;

    // Trigger synthetic audio accompaniment & visualizer dance
    const synthToneStop = this.triggerVocalAcousticEnergy(text.length * 65 * (1 / style.speed), style);

    utterance.onend = () => {
      synthToneStop();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      synthToneStop();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Pure Web Audio API Vocal Formant Synthesizer: produces resonant harmonic vowels
  // Guarantees audio playback through DSP filters and visualizer even if TTS is muted/unavailable!
  public synthesizePhoneticVocal(text: string, style: VoiceStyle, onEnd?: () => void): void {
    const ctx = this.getAudioContext();
    this.applyVoiceStyle(style);

    const now = ctx.currentTime;
    const baseFreq = 220 * Math.pow(2, style.pitch / 12); // A3 baseline tuned
    const speedRatio = 1 / Math.max(0.5, style.speed);

    // Vocal cord glottal oscillator (rich harmonic pulse)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);

    // Sub-oscillator for warmth
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);

    const oscMix = ctx.createGain();
    oscMix.gain.setValueAtTime(0.35, now);

    // Phoneme envelopes
    const vocalGain = ctx.createGain();
    vocalGain.gain.setValueAtTime(0, now);

    // Connect to input of DSP graph (lowFilter)
    osc1.connect(oscMix);
    osc2.connect(oscMix);
    subOsc.connect(oscMix);
    oscMix.connect(vocalGain);

    if (this.lowFilter) {
      vocalGain.connect(this.lowFilter);
    }

    // Sequence the phonemes of "Munira" or text syllables
    let timeOffset = 0.05;
    const phonemeSequence = text.toLowerCase().includes('munira') ? this.PHONEMES : [
      { label: 'syl1', duration: 0.18, f1: 450, f2: 1200, gain: 0.8 },
      { label: 'syl2', duration: 0.22, f1: 300, f2: 2100, gain: 0.9 },
      { label: 'syl3', duration: 0.25, f1: 650, f2: 1400, gain: 0.85 },
      { label: 'syl4', duration: 0.35, f1: 750, f2: 1100, gain: 1.0 }
    ];

    phonemeSequence.forEach((ph, idx) => {
      const dur = ph.duration * speedRatio;
      const phStart = now + timeOffset;
      const phPeak = phStart + dur * 0.2;
      const phEnd = phStart + dur;

      // Slight natural pitch inflection for expression
      const pitchInflection = idx === phonemeSequence.length - 1 ? 0.95 : (1.0 + Math.sin(idx) * 0.06);
      osc1.frequency.setValueAtTime(baseFreq * pitchInflection, phStart);
      osc2.frequency.setValueAtTime(baseFreq * 2 * pitchInflection, phStart);

      // Amplitude envelope
      vocalGain.gain.setValueAtTime(0.001, phStart);
      vocalGain.gain.exponentialRampToValueAtTime(Math.max(0.01, ph.gain * 0.4), phPeak);
      vocalGain.gain.exponentialRampToValueAtTime(0.001, phEnd);

      timeOffset += dur;
    });

    const totalDuration = timeOffset + 0.3;

    try {
      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);
      osc1.stop(now + totalDuration);
      osc2.stop(now + totalDuration);
      subOsc.stop(now + totalDuration);
    } catch {
      // ignore
    }

    setTimeout(() => {
      if (onEnd) onEnd();
    }, totalDuration * 1000);
  }

  // Generates harmonic vocal presence audio into DSP chain during speech
  private triggerVocalAcousticEnergy(durationMs: number, style: VoiceStyle): () => void {
    const ctx = this.getAudioContext();
    this.applyVoiceStyle(style);

    const now = ctx.currentTime;
    const baseFreq = 210 * Math.pow(2, style.pitch / 12);

    const tone = ctx.createOscillator();
    tone.type = style.robotMod ? 'sawtooth' : 'sine';
    tone.frequency.setValueAtTime(baseFreq, now);

    // Subtle gentle vibrato
    const vibrato = ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.2, now);
    const vibGain = ctx.createGain();
    vibGain.gain.setValueAtTime(4.0, now);
    vibrato.connect(vibGain);
    vibGain.connect(tone.frequency);

    const envelope = ctx.createGain();
    // Keep ambient tone low so speech synthesis voice dominates
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.linearRampToValueAtTime(0.05, now + 0.1);

    tone.connect(envelope);
    if (this.lowFilter) {
      envelope.connect(this.lowFilter);
    }

    try {
      tone.start(now);
      vibrato.start(now);
    } catch {
      // ignore
    }

    const stop = () => {
      try {
        const stopTime = ctx.currentTime;
        envelope.gain.linearRampToValueAtTime(0.001, stopTime + 0.05);
        tone.stop(stopTime + 0.06);
        vibrato.stop(stopTime + 0.06);
      } catch {
        // ignore
      }
    };

    const timer = setTimeout(stop, Math.max(800, durationMs));

    return () => {
      clearTimeout(timer);
      stop();
    };
  }

  // Live Microphone morphing
  public async startMicrophone(style: VoiceStyle): Promise<boolean> {
    const ctx = this.getAudioContext();
    this.applyVoiceStyle(style);

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.micSource = ctx.createMediaStreamSource(this.micStream);
      if (this.lowFilter) {
        this.micSource.connect(this.lowFilter);
      }
      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn("Microphone access not granted or unavailable", err);
      this.isMicActive = false;
      return false;
    }
  }

  public stopMicrophone(): void {
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // ignore
      }
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.isMicActive = false;
  }

  public isMicRunning(): boolean {
    return this.isMicActive;
  }

  // Play audio file buffer through DSP
  public async playAudioBuffer(buffer: AudioBuffer, style: VoiceStyle, onEnd?: () => void): Promise<void> {
    const ctx = this.getAudioContext();
    this.stopAudioBuffer();
    this.applyVoiceStyle(style);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Pitch & speed variation on playback
    const pitchRatio = Math.pow(2, style.pitch / 12);
    source.playbackRate.value = pitchRatio * style.speed;

    if (this.lowFilter) {
      source.connect(this.lowFilter);
    }

    source.onended = () => {
      this.currentBufferSource = null;
      if (onEnd) onEnd();
    };

    this.currentBufferSource = source;
    source.start(0);
  }

  public stopAudioBuffer(): void {
    if (this.currentBufferSource) {
      try {
        this.currentBufferSource.stop();
        this.currentBufferSource.disconnect();
      } catch {
        // ignore
      }
      this.currentBufferSource = null;
    }
  }

  public stopAll(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopAudioBuffer();
  }

  // Live Recording of morphed audio
  public startRecording(): boolean {
    if (!this.destinationNode) {
      this.getAudioContext();
    }
    if (!this.destinationNode) return false;

    this.recordedChunks = [];
    try {
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
      const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';

      this.mediaRecorder = supportedMime 
        ? new MediaRecorder(this.destinationNode.stream, { mimeType: supportedMime })
        : new MediaRecorder(this.destinationNode.stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      return true;
    } catch (err) {
      console.error("Recording start failed", err);
      return false;
    }
  }

  public stopRecording(): Promise<{ blob: Blob; duration: number } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      const duration = (Date.now() - this.recordingStartTime) / 1000;

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.isRecording = false;
        resolve({ blob, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // Synthetic Reverb impulse generator
  private createImpulseResponse(type: 'studio' | 'chamber' | 'hall' | 'cathedral', duration = 2.0, decay = 2.0): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext required");
    const rate = this.ctx.sampleRate;
    const durSec = type === 'studio' ? 0.8 : type === 'chamber' ? 1.4 : type === 'hall' ? 2.4 : 4.0;
    const decayFactor = type === 'studio' ? 3.5 : type === 'chamber' ? 2.8 : type === 'hall' ? 1.8 : 1.2;
    const length = rate * durSec;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const envelope = Math.exp(-n * decayFactor);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }

    return impulse;
  }

  // Soft analog distortion / warmth transfer curve
  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = typeof amount === 'number' ? amount : 50;
    const nSamples = 44100;
    const buffer = new ArrayBuffer(nSamples * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

// Global Singleton for application
export const audioEngine = new AudioEngine();
