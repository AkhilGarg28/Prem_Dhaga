'use client';

import React, { useEffect, useState, useRef } from 'react';

export const PeacockCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [angle, setAngle] = useState(0);

  // Keep track of mouse velocity to rotate the feather dynamically
  const prevMouse = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    // Hide default cursor on desktop
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    document.documentElement.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setPosition({ x, y });
      setIsVisible(true);

      // Calculate movement velocity vector to tilt the feather
      const now = performance.now();
      const dt = now - prevMouse.current.time;
      if (dt > 10) {
        const dx = x - prevMouse.current.x;
        const dy = y - prevMouse.current.y;
        
        // Calculate velocity angle in radians
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          const moveAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45; // base offset
          setAngle(moveAngle);
        }
        
        prevMouse.current = { x, y, time: now };
      }

      // Check if mouse is over interactive element
      const target = e.target as HTMLElement;
      const hoverable = target.closest('a, button, select, input, [role="button"], .group');
      setIsHovered(!!hoverable);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.documentElement.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const isMobileDevice = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  if (isMobileDevice || !isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-[400ms] cubic-bezier(0.1, 0.8, 0.3, 1)"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isHovered ? 1.4 : 1}) rotate(${angle}deg)`,
      }}
    >
      {isHovered ? (
        /* Glowing Peacock Feather SVG pointer */
        <svg
          width="40"
          height="40"
          viewBox="0 0 64 64"
          fill="none"
          stroke="var(--royal-gold)"
          strokeWidth="1.5"
          className="drop-shadow-[0_0_8px_rgba(201,168,76,0.8)] filter transition-all duration-300"
        >
          <path d="M32 58C32 58 32 30 32 6" />
          <path d="M32 6C20 18 16 30 32 44C48 30 44 18 32 6Z" fill="var(--royal-gold)" fillOpacity="0.25" />
          <path d="M32 14C24 22 22 28 32 36C42 28 40 22 32 14Z" fill="var(--peacock-blue)" fillOpacity="0.4" />
          <path d="M32 20C28 24 28 28 32 32C36 28 36 24 32 20Z" fill="var(--lotus-pink)" fillOpacity="0.6" />
        </svg>
      ) : (
        /* Clean minimalist golden cursor ring */
        <div className="w-6 h-6 rounded-full border border-royal-gold/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-royal-gold" />
        </div>
      )}
    </div>
  );
};
export default PeacockCursor;
