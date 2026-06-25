'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aAngle;
  varying float vLife;

  void main() {
    vec3 pos = position;

    // Drifting upward
    pos.y += uTime * aSpeed * 0.5;
    // Oscillate on X & Z
    pos.x += sin(uTime * 0.3 + aAngle) * 0.4;
    pos.z += cos(uTime * 0.25 + aAngle) * 0.4;

    // Boundary Loop
    pos.y = mod(pos.y + 5.0, 10.0) - 5.0;
    pos.x = mod(pos.x + 5.0, 10.0) - 5.0;
    pos.z = mod(pos.z + 5.0, 10.0) - 5.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    vLife = (pos.y + 5.0) / 10.0;
  }
`;

const fragmentShader = `
  varying float vLife;

  void main() {
    // Circle mask
    vec2 pt = gl_PointCoord - vec2(0.5);
    if (dot(pt, pt) > 0.25) discard;

    // Royal Gold tone (#C9A84C)
    vec3 gold = vec3(0.788, 0.658, 0.298);
    // Add subtle glow in center
    float dist = 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0;
    vec3 glow = gold + vec3(0.2) * smoothstep(0.0, 1.0, dist);

    // Fade boundaries
    float alpha = smoothstep(0.0, 0.2, vLife) * smoothstep(1.0, 0.8, vLife) * 0.7;

    gl_FragColor = vec4(glow, alpha);
  }
`;

export const GoldenParticles = ({ count = 500 }) => {
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
      blending: THREE.AdditiveBlending, // additive glow
    });
  }, []);

  const [positions, speeds, sizes, angles] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    const sz = new Float32Array(count);
    const ang = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      sp[i] = 0.2 + Math.random() * 0.6; // slow floating upward
      sz[i] = 0.08 + Math.random() * 0.18; // size
      ang[i] = Math.random() * 6.28; // starting angle offset
    }
    return [pos, sp, sz, ang];
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
          attach="attributes-aAngle"
          args={[angles, 1]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};
export default GoldenParticles;
