import { create } from 'zustand';

interface AudioState {
  isMuted: boolean;
  isInitialized: boolean;
  activeLayer: string;
  initAudio: () => void;
  toggleMute: () => void;
  updateMix: (progress: number) => void;
}

// Module-level Web Audio API references (all browser-only, never accessed on server)
let audioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let synthGain: GainNode | null = null;

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const initSynth = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    // C3 + G3 drone for temple atmosphere
    osc1 = audioCtx.createOscillator();
    osc2 = audioCtx.createOscillator();
    filterNode = audioCtx.createBiquadFilter();
    synthGain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(196.0, audioCtx.currentTime); // G3

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(300, audioCtx.currentTime);

    synthGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

    osc1.connect(filterNode);
    osc2.connect(filterNode);
    filterNode.connect(synthGain);
    synthGain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
  } catch (err) {
    console.warn('[Audio] Web Audio Synthesizer failed to initialize:', err);
  }
};

const triggerSynthBell = (freq = 523.25, volume = 0.05) => {
  if (!audioCtx || audioCtx.state === 'suspended') return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 3);
};

export const useAudio = create<AudioState>((set, get) => ({
  isMuted: true,
  isInitialized: false,
  activeLayer: 'entrance',

  initAudio: () => {
    if (get().isInitialized) return;
    if (typeof window === 'undefined') return;

    initSynth();

    if (audioCtx && !get().isMuted) {
      audioCtx.resume().catch(() => {});
    }

    set({ isInitialized: true });
  },

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prem-dhaga-mute', String(nextMuted));
    }

    if (nextMuted) {
      if (synthGain && audioCtx) {
        synthGain.gain.setValueAtTime(0, audioCtx.currentTime);
      }
    } else {
      if (!get().isInitialized) {
        get().initAudio();
      }

      if (audioCtx) {
        audioCtx.resume().catch(() => {});
        if (synthGain) {
          synthGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        }
      }

      // Opening temple chime
      triggerSynthBell(392.0, 0.1); // G4
      setTimeout(() => triggerSynthBell(523.25, 0.1), 150); // C5
    }
  },

  updateMix: (progress: number) => {
    if (get().isMuted) return;
    if (!get().isInitialized) return;
    if (!audioCtx || !synthGain) return;

    // Modulate filter cutoff based on scroll to create atmosphere transitions
    if (filterNode) {
      if (progress < 0.2) {
        // Scene 1: Temple Entrance - darker drone
        filterNode.frequency.setTargetAtTime(200, audioCtx.currentTime, 1.5);
        synthGain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 1.5);
      } else if (progress < 0.4) {
        // Scene 2: Vrindavan Garden - slightly brighter
        filterNode.frequency.setTargetAtTime(350, audioCtx.currentTime, 1.5);
        synthGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 1.5);
      } else if (progress < 0.65) {
        // Scene 3: Divine Darshan - open sound
        filterNode.frequency.setTargetAtTime(500, audioCtx.currentTime, 1.5);
        synthGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 1.5);
      } else {
        // Scene 4: Seva Timeline - warm presence
        filterNode.frequency.setTargetAtTime(300, audioCtx.currentTime, 1.5);
        synthGain.gain.setTargetAtTime(0.07, audioCtx.currentTime, 1.5);
      }
    }

    // Trigger periodic synth chimes at scroll transitions
    if (progress > 0.19 && progress < 0.21 && Math.random() < 0.03) {
      triggerSynthBell(440.0, 0.06);
    }
    if (progress > 0.39 && progress < 0.41 && Math.random() < 0.03) {
      triggerSynthBell(587.33, 0.06);
    }
    if (progress > 0.64 && progress < 0.66 && Math.random() < 0.03) {
      triggerSynthBell(659.25, 0.08);
    }
  },
}));
