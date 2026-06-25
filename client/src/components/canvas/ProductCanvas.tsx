'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ProductMeshProps {
  color: string;
}

const ProductMesh = ({ color }: ProductMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Wave ripple on poshak fabric
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  const parsedColor = new THREE.Color(color);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Velvet Pedestal */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.6, 32]} />
        <meshStandardMaterial color="#5C131F" roughness={0.8} /> {/* Deep ruby velvet */}
      </mesh>
      {/* Gold pedestal border trim */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.22, 1.22, 0.05, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Draped Poshak Fabric (represented as a layered wavy dome) */}
      <mesh ref={meshRef} position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial
          color={parsedColor}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Gold borders on Poshak */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.67, 0.04, 8, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Matching Golden Crown (Mukut) sitting above the Poshak */}
      <group ref={crownRef} position={[0, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.15, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Tiny ruby jewel on crown */}
        <mesh position={[0, 0.28, 0.11]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#D4788A" />
        </mesh>
      </group>
    </group>
  );
};

export const ProductCanvas = ({ color }: ProductMeshProps) => {
  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[500px] bg-[#110E0A] border border-royal-gold/10 relative">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 3.8], fov: 40 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} color="#FAF6EF" />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          color="#FDFAF4"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#1B5E6E" />

        <ProductMesh color={color} />

        <OrbitControls
          enableZoom={true}
          maxDistance={6}
          minDistance={2}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 font-utility text-[9px] tracking-widest text-warm-beige/40 uppercase pointer-events-none">
        ← Drag to Orbit  ·  Scroll to Zoom →
      </div>
    </div>
  );
};
export default ProductCanvas;
