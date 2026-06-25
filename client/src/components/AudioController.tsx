'use client';

import React, { useEffect } from 'react';
import { useAudio } from '../store/useAudio';
import { Icons } from './Icons';

export const AudioController = () => {
  const { isMuted, isInitialized, initAudio, toggleMute } = useAudio();

  useEffect(() => {
    // Automatically retrieve user preference from localStorage
    const savedMute = localStorage.getItem('prem-dhaga-mute');
    if (savedMute === 'false') {
      // If user had unmuted previously, try to init on first event
      const triggerInit = () => {
        initAudio();
        // Remove listeners
        window.removeEventListener('click', triggerInit);
        window.removeEventListener('scroll', triggerInit);
      };
      window.addEventListener('click', triggerInit);
      window.addEventListener('scroll', triggerInit);
      
      return () => {
        window.removeEventListener('click', triggerInit);
        window.removeEventListener('scroll', triggerInit);
      };
    }
  }, [initAudio]);

  const handleToggle = () => {
    if (!isInitialized) {
      initAudio();
    }
    toggleMute();
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={handleToggle}
        className={`relative p-3 rounded-full border bg-temple-black/90 backdrop-blur-md transition-all duration-500 flex items-center justify-center group ${
          isMuted
            ? 'border-royal-gold/20 text-warm-beige/40 hover:border-royal-gold/60'
            : 'border-royal-gold text-royal-gold shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:scale-110'
        }`}
        aria-label="Toggle Temple Atmosphere Sound"
      >
        {/* Animated halo behind unmuted icon */}
        {!isMuted && (
          <span className="absolute inset-0 rounded-full border border-royal-gold/30 animate-ping opacity-75"></span>
        )}

        <div className="flex items-center gap-1">
          <Icons.PeacockFeather
            className={`transition-transform duration-700 ${
              isMuted ? 'opacity-50' : 'animate-bounce'
            }`}
            size={22}
          />
          <span className="sr-only">Toggle Audio</span>
        </div>
      </button>
    </div>
  );
};
export default AudioController;
