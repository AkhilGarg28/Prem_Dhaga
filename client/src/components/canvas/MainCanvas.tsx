'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import DeityScene from './DeityScene';
import LotusRain from './LotusRain';
import GoldenParticles from './GoldenParticles';

export const MainCanvas = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 2.5, 9] }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0d0b08, 1); // #0D0B08 (temple black)
        }}
      >
        {/* Meditative floating particles (Golden dust and Lotus petal rain) */}
        <GoldenParticles count={400} />
        <LotusRain count={120} />

        {/* Dynamic 3D Scene */}
        <DeityScene />
      </Canvas>
    </div>
  );
};
export default MainCanvas;
