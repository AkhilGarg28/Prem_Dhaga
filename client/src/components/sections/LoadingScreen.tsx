'use client';

import React, { useState, useEffect } from 'react';
import { useScene } from '../../store/useScene';
import { useAudio } from '../../store/useAudio';
import { Icons } from '../Icons';

export const LoadingScreen = () => {
  const { isLoading, setIsLoading, skipIntro, setSkipIntro } = useScene();
  const { initAudio } = useAudio();
  const [progress, setProgress] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);

  useEffect(() => {
    if (skipIntro) {
      setProgress(100);
      setDoorsOpen(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Wait for door opening animation
      return () => clearTimeout(timer);
    }

    // Simulate loading count
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDoorsOpen(true);
          // Wait for door swing animation to finish before removing loading screen
          setTimeout(() => {
            setIsLoading(false);
          }, 1200);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + step);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [skipIntro, setIsLoading]);

  const handleSkip = () => {
    initAudio(); // Trigger audio activation
    setSkipIntro(true);
  };

  if (!isLoading && doorsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex select-none">
      {/* LEFT TEMPLE DOOR */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1/2 bg-[#1C140E] border-r border-[#8B6914]/25 flex flex-col items-end justify-center transition-transform duration-[1200ms] ease-in-out ${
          doorsOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 70%)',
        }}
      >
        {/* Left half ornament */}
        <div className="mr-8 border-y-2 border-r-2 border-royal-gold/20 w-16 h-32 rounded-r-full flex items-center justify-end pr-2 pointer-events-none">
          <div className="w-4 h-12 bg-royal-gold/30 rounded-r-full" />
        </div>
      </div>

      {/* RIGHT TEMPLE DOOR */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-1/2 bg-[#1C140E] border-l border-[#8B6914]/25 flex flex-col items-start justify-center transition-transform duration-[1200ms] ease-in-out ${
          doorsOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 70%)',
        }}
      >
        {/* Right half ornament */}
        <div className="ml-8 border-y-2 border-l-2 border-royal-gold/20 w-16 h-32 rounded-l-full flex items-center justify-start pl-2 pointer-events-none">
          <div className="w-4 h-12 bg-royal-gold/30 rounded-l-full" />
        </div>
      </div>

      {/* CENTER LOADING OVERLAY */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 transition-opacity duration-500 ${
          doorsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Animated Drawing SVG Logo */}
        <div className="relative mb-6 flex flex-col items-center">
          <div className="w-20 h-20 text-royal-gold relative">
            <svg
              className="w-full h-full stroke-royal-gold stroke-[1.5] fill-none animate-[dash_3s_ease-in-out_infinite]"
              viewBox="0 0 64 64"
              strokeDasharray="300"
              strokeDashoffset="300"
              style={{
                animation: 'drawLogo 3s ease-in-out forwards',
              }}
            >
              {/* Custom SVG logo path representing standard peacock feather outline */}
              <path d="M32 58C32 58 32 30 32 6 C20 18 16 30 32 44C48 30 44 18 32 6 Z" />
              <path d="M32 14C26 20 24 26 32 34C40 26 38 20 32 14 Z" />
            </svg>
            <style jsx global>{`
              @keyframes drawLogo {
                to {
                  stroke-dashoffset: 0;
                }
              }
            `}</style>
          </div>
          <span className="font-display text-2xl tracking-[0.2em] text-ivory mt-4">
            PREM DHAGA
          </span>
          <span className="font-utility text-[9px] tracking-[0.3em] text-royal-gold uppercase mt-2">
            Devotional Atelier
          </span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 h-[1px] bg-royal-gold/15 relative overflow-hidden mb-3">
          <div
            className="h-full bg-royal-gold transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Counter */}
        <div className="font-display italic text-base text-warm-beige/80">
          {progress}%
        </div>

        {/* Skip Button */}
        {progress > 15 && (
          <button
            onClick={handleSkip}
            className="mt-12 font-utility text-[10px] tracking-[0.25em] text-warm-beige hover:text-royal-gold border border-royal-gold/25 hover:border-royal-gold px-6 py-2 transition-all duration-300 uppercase cursor-pointer"
          >
            Skip Intro
          </button>
        )}
      </div>
    </div>
  );
};
export default LoadingScreen;
