'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScene } from '../../store/useScene';

export default function LoadingScreen() {
  const { isLoading, setIsLoading } = useScene();
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem('prem-dhaga-intro-seen') === 'true') {
      setIsLoading(false);
      return;
    }

    const readyTimer = window.setTimeout(() => setReady(true), 250);
    const openTimer = window.setTimeout(() => {
      setOpening(true);
      window.sessionStorage.setItem('prem-dhaga-intro-seen', 'true');
      window.setTimeout(() => setIsLoading(false), 520);
    }, 850);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(openTimer);
    };
  }, [setIsLoading]);

  const enter = () => {
    if (opening) return;
    setOpening(true);
    window.sessionStorage.setItem('prem-dhaga-intro-seen', 'true');
    window.setTimeout(() => setIsLoading(false), 520);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-[#080705]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Prem Dhaga entrance"
        >
          <div className="absolute inset-0 temple-grain opacity-30" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-royal-gold/15" />

          <motion.div
            className="temple-door left-0 origin-left"
            animate={{ x: opening ? '-101%' : '0%', rotateY: opening ? -13 : 0 }}
            transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="door-panel door-panel-left"><span className="door-ring" /></div>
          </motion.div>
          <motion.div
            className="temple-door right-0 origin-right"
            animate={{ x: opening ? '101%' : '0%', rotateY: opening ? 13 : 0 }}
            transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="door-panel door-panel-right"><span className="door-ring" /></div>
          </motion.div>

          <motion.div
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
            animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.04 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.svg
              viewBox="0 0 80 104"
              className="mb-7 h-24 w-20 text-royal-gold"
              initial="hidden"
              animate="visible"
              aria-hidden="true"
            >
              <motion.path
                d="M40 99C39 78 37 61 40 44M40 44C18 36 17 17 38 5C58 20 60 39 40 44ZM39 14C29 22 29 31 40 36C49 29 48 21 39 14ZM40 44C30 54 22 59 12 61M40 47C50 55 59 59 69 59"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
                transition={{ duration: 0.85, ease: 'easeInOut' }}
              />
            </motion.svg>
            <p className="font-utility text-[9px] uppercase tracking-[0.42em] text-cream/45">Vrindavan / India</p>
            <h2 className="mt-5 font-display text-4xl font-light tracking-[0.2em] text-ivory sm:text-5xl">PREM DHAGA</h2>
            <p className="mt-3 font-display text-lg italic text-royal-gold/80">Threads woven with devotion</p>

            <motion.button
              type="button"
              onClick={enter}
              disabled={!ready || opening}
              className="intro-enter mt-14 disabled:cursor-wait disabled:opacity-35"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
              transition={{ duration: 0.35 }}
            >
              <span>Begin darshan</span>
              <span className="h-px w-8 bg-current" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}