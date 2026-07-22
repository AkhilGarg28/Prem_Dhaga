'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import DeityScene from './DeityScene';
import LotusRain from './LotusRain';
import GoldenParticles from './GoldenParticles';

export const MainCanvas = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 2.5, 9] }}
        gl={{ antialias: false, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
        performance={{ min: 0.55 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0d0b08, 0);
        }}
      >
        <GoldenParticles count={180} />
        <LotusRain count={45} />
        <DeityScene />
      </Canvas>
    </div>
  );
};

export default MainCanvas;
