'use client';

import { useEffect, useState } from 'react';
import { useScene } from '../../store/useScene';

const disableIntro = process.env.NODE_ENV === 'development';

export default function LoadingScreen() {
  const isLoading = useScene((state) => state.isLoading);
  const setIsLoading = useScene((state) => state.setIsLoading);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (disableIntro || window.sessionStorage.getItem('prem-dhaga-intro-seen') === 'true') {
      setIsLoading(false);
      return;
    }

    const readyTimer = window.setTimeout(() => setReady(true), 90);
    const openTimer = window.setTimeout(() => {
      setOpening(true);
      window.sessionStorage.setItem('prem-dhaga-intro-seen', 'true');
      window.setTimeout(() => setIsLoading(false), 360);
    }, 420);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(openTimer);
    };
  }, [setIsLoading]);

  const enter = () => {
    if (opening) return;
    setOpening(true);
    window.sessionStorage.setItem('prem-dhaga-intro-seen', 'true');
    window.setTimeout(() => setIsLoading(false), 360);
  };

  if (disableIntro || !isLoading) return null;

  return (
    <div
      className={`loading-screen fixed inset-0 z-[100] overflow-hidden bg-[#080705] ${opening ? 'is-opening' : ''}`}
      aria-label="Prem Dhaga entrance"
    >
      <div className="absolute inset-0 temple-grain opacity-30" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-royal-gold/15" />

      <div className="temple-door temple-door-left left-0 origin-left">
        <div className="door-panel door-panel-left"><span className="door-ring" /></div>
      </div>
      <div className="temple-door temple-door-right right-0 origin-right">
        <div className="door-panel door-panel-right"><span className="door-ring" /></div>
      </div>

      <div className="intro-content relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <svg
          viewBox="0 0 80 104"
          className="intro-mark mb-7 h-24 w-20 text-royal-gold"
          aria-hidden="true"
        >
          <path
            d="M40 99C39 78 37 61 40 44M40 44C18 36 17 17 38 5C58 20 60 39 40 44ZM39 14C29 22 29 31 40 36C49 29 48 21 39 14ZM40 44C30 54 22 59 12 61M40 47C50 55 59 59 69 59"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-utility text-[9px] uppercase tracking-[0.42em] text-cream/45">Vrindavan / India</p>
        <h2 className="mt-5 font-display text-4xl font-light tracking-[0.2em] text-ivory sm:text-5xl">PREM DHAGA</h2>
        <p className="mt-3 font-display text-lg italic text-royal-gold/80">Threads woven with devotion</p>

        <button
          type="button"
          onClick={enter}
          disabled={!ready || opening}
          className={`intro-enter mt-14 disabled:cursor-wait disabled:opacity-35 ${ready ? 'is-ready' : ''}`}
        >
          <span>Begin darshan</span>
          <span className="h-px w-8 bg-current" />
        </button>
      </div>
    </div>
  );
}