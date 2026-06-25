import { create } from 'zustand';

interface SceneState {
  currentScene: number; // 0: loading/intro, 1: entrance, 2: garden, 3: darshan, 4: timeline
  scrollProgress: number; // 0 to 1
  isLoading: boolean;
  skipIntro: boolean;
  activePoshakIndex: number; // 0 to 6 outfit morphs
  setScrollProgress: (progress: number) => void;
  setCurrentScene: (scene: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSkipIntro: (skip: boolean) => void;
  setActivePoshakIndex: (index: number) => void;
}

export const useScene = create<SceneState>((set) => ({
  currentScene: 0,
  scrollProgress: 0,
  isLoading: true,
  skipIntro: false,
  activePoshakIndex: 0,

  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSkipIntro: (skipIntro) => set({ skipIntro, isLoading: !skipIntro }),
  setActivePoshakIndex: (activePoshakIndex) => set({ activePoshakIndex }),
}));
