'use client';

import React, { useEffect, useRef } from 'react';

type LenisInstance = {
  raf: (time: number) => void;
  stop: () => void;
  start: () => void;
  destroy: () => void;
};

export const LenisProvider = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let rafId = 0;

    const startLenis = async () => {
      const { default: Lenis } = await import('lenis');
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      }) as LenisInstance;

      lenisRef.current = lenis;
      (window as any).lenis = lenis;

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    startLenis().catch(() => {});

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      (window as any).lenis = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;