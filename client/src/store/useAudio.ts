import { create } from 'zustand';

interface AudioState {
  isMuted: boolean;
  isInitialized: boolean;
  activeLayer: string;
  initAudio: () => void;
  toggleMute: () => void;
  updateMix: (progress: number) => void;
}

let HowlClass: any = null;
let ambientSound: any = null;
let bellsSound: any = null;
let fluteSound: any = null;

// Synthesizer Fallback using Web Audio API (in case external mp3s don't load or browser blocks)
let audioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let synthGain: GainNode | null = null;

const initSynth = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    
    // Create a low drone for temple atmosphere (C3 + G3)
    osc1 = audioCtx.createOscillator();
    osc2 = audioCtx.createOscillator();
    filter = audioCtx.createBiquadFilter();
    synthGain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(196.00, audioCtx.currentTime); // G3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);

    synthGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // Very quiet base drone

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(synthGain);
    synthGain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    console.log('[Audio Synth] Devotional temple drone synthesizer initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Web Audio Synthesizer fallback:', err);
  }
};

const triggerSynthBell = (freq = 523.25, volume = 0.05) => {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  
  // Make a beautiful sweet chime/bell sound
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  // exponential decay for bell strike
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

  initAudio: async () => {
    if (get().isInitialized) return;

    if (typeof window !== 'undefined') {
      try {
        // Dynamic import of howler to avoid SSR errors
        const howler = await import('howler');
        HowlClass = howler.Howl;

        // Load ambient audio layers with royalty free atmospheric urls
        // If files are missing, the synth fallback will cover it
        ambientSound = new HowlClass({
          src: ['https://assets.mixkit.co/active_storage/sfx/123/123-200.wav'], // Temple wind chime / ambient
          loop: true,
          volume: 0.1,
          html5: true,
        });

        bellsSound = new HowlClass({
          src: ['https://assets.mixkit.co/active_storage/sfx/1971/1971-200.wav'], // Bells chime
          loop: true,
          volume: 0.0,
          html5: true,
        });

        fluteSound = new HowlClass({
          src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'], // Soft music flute drone
          loop: true,
          volume: 0.0,
          html5: true,
        });

        if (!get().isMuted) {
          ambientSound.play();
          bellsSound.play();
          fluteSound.play();
        }
      } catch (err) {
        console.warn('Howler load failed or blocked. Using fallback web audio synthesizer.');
      }

      // Initialize Web Audio Drone Synth
      initSynth();
      if (audioCtx && !get().isMuted) {
        audioCtx.resume();
      }

      set({ isInitialized: true });
    }
  },

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });

    // Save preference
    localStorage.setItem('prem-dhaga-mute', String(nextMuted));

    if (nextMuted) {
      if (ambientSound) {
        ambientSound.volume(0);
        bellsSound.volume(0);
        fluteSound.volume(0);
      }
      if (synthGain && audioCtx) {
        synthGain.gain.setValueAtTime(0, audioCtx.currentTime);
      }
    } else {
      if (!get().isInitialized) {
        get().initAudio();
      }
      
      if (ambientSound) {
        ambientSound.play();
        bellsSound.play();
        fluteSound.play();
      }
      
      if (audioCtx) {
        audioCtx.resume();
        if (synthGain) {
          synthGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        }
      }
      // Trigger an opening temple chime
      triggerSynthBell(392.00, 0.1); // G4
      setTimeout(() => triggerSynthBell(523.25, 0.1), 150); // C5
    }
  },

  updateMix: (progress: number) => {
    // Crossfade volumes according to scroll position (0 to 1)
    if (get().isMuted) return;

    if (!get().isInitialized) return;

    if (ambientSound && bellsSound && fluteSound) {
      if (progress < 0.2) {
        // Scene 1: Temple Entrance
        ambientSound.volume(0.2);
        bellsSound.volume(0.02);
        fluteSound.volume(0.0);
        set({ activeLayer: 'entrance' });
      } else if (progress >= 0.2 && progress < 0.4) {
        // Scene 2: Vrindavan Garden
        const factor = (progress - 0.2) / 0.2; // 0 to 1
        ambientSound.volume(0.2 * (1 - factor) + 0.1 * factor);
        bellsSound.volume(0.02 * (1 - factor) + 0.1 * factor);
        fluteSound.volume(0.1 * factor);
        set({ activeLayer: 'garden' });
      } else if (progress >= 0.4 && progress < 0.65) {
        // Scene 3: Divine Darshan
        const factor = (progress - 0.4) / 0.25;
        ambientSound.volume(0.1 * (1 - factor) + 0.05 * factor);
        bellsSound.volume(0.1 * (1 - factor) + 0.02 * factor);
        fluteSound.volume(0.1 * (1 - factor) + 0.3 * factor);
        set({ activeLayer: 'darshan' });
      } else {
        // Scene 4: Seva Timeline
        const factor = (progress - 0.65) / 0.35;
        ambientSound.volume(0.05 * (1 - factor) + 0.15 * factor);
        bellsSound.volume(0.02 * (1 - factor) + 0.1 * factor);
        fluteSound.volume(0.3 * (1 - factor) + 0.05 * factor);
        set({ activeLayer: 'seva' });
      }
    }

    // Play periodic bells automatically during specific transitions (e.g. crossing 20%, 40%, 65%)
    // Trigger synth chimes as physical representation
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
