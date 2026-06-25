'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom GLSL Shaders for Lotus Petals
const vertexShader = `
  uniform float uTime;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aRandom;
  varying vec3 vRandom;
  varying float vLife;

  void main() {
    vRandom = aRandom;
    vec3 pos = position;

    // Simulate diagonal drift falling down and left (Yamuna wind)
    pos.y -= uTime * aSpeed * 0.8;
    pos.x += sin(uTime * 0.5 + aRandom.x * 10.0) * 0.5 - uTime * aSpeed * 0.2;
    pos.z += cos(uTime * 0.3 + aRandom.y * 10.0) * 0.3;

    // Loop coordinates within boundaries [-10, 10]
    pos.y = mod(pos.y + 10.0, 20.0) - 10.0;
    pos.x = mod(pos.x + 10.0, 20.0) - 10.0;
    pos.z = mod(pos.z + 5.0, 10.0) - 5.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Set size based on distance
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    vLife = (pos.y + 10.0) / 20.0; // Life factor based on height
  }
`;

const fragmentShader = `
  varying vec3 vRandom;
  varying float vLife;

  void main() {
    // Make particles circular
    vec2 temp = gl_PointCoord - vec2(0.5);
    float dist = dot(temp, temp);
    if (dist > 0.25) discard;

    // Lotus Pink palette (#D4788A -> #E5A3B1)
    vec3 color = vec3(0.831, 0.471, 0.541); // base pink
    color += sin(vRandom.z * 6.28) * 0.08; // slightly vary hue per petal

    // Soft fade out at bottom and top boundaries
    float alpha = smoothstep(0.0, 0.2, vLife) * smoothstep(1.0, 0.8, vLife) * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const LotusRain = ({ count = 150 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  const [positions, speeds, sizes, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    const sz = new Float32Array(count);
    const rand = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread out randomly in space
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      sp[i] = 0.5 + Math.random() * 1.5; // falling speed
      sz[i] = 0.15 + Math.random() * 0.3; // size

      rand[i * 3] = Math.random();
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random();
    }
    return [pos, sp, sz, rand];
  }, [count]);

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 3]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};
export default LotusRain;
