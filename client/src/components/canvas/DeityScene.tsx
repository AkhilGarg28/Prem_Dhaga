'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScene } from '../../store/useScene';
import * as THREE from 'three';

export const DeityScene = () => {
  const { scrollProgress, activePoshakIndex } = useScene();

  const cameraRef = useRef<THREE.Group>(null);
  const deityRef = useRef<THREE.Group>(null);
  const poshakMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Diyas flickering refs
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);

  // SpotLight and ambient light refs for Seva timeline
  const mainSpotLightRef = useRef<THREE.SpotLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);

  // Poshak color list for morphing transition
  const poshakColors = useMemo(
    () => [
      new THREE.Color('#3B6B3B'), // Vrindavan Green
      new THREE.Color('#D4788A'), // Lotus Pink
      new THREE.Color('#C9A84C'), // Royal Gold
      new THREE.Color('#1B5E6E'), // Peacock Blue
      new THREE.Color('#FAF6EF'), // Ivory Silk
      new THREE.Color('#8B6914'), // Temple Bronze
      new THREE.Color('#E27D22'), // Saffron Orange
    ],
    []
  );

  const targetColor = useMemo(() => new THREE.Color(), []);

  // Update target poshak color when activePoshakIndex shifts
  useEffect(() => {
    const idx = Math.min(Math.max(0, activePoshakIndex), poshakColors.length - 1);
    targetColor.copy(poshakColors[idx]);
  }, [activePoshakIndex, poshakColors, targetColor]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Morph Poshak Fabric color smoothly
    if (poshakMaterialRef.current) {
      poshakMaterialRef.current.color.lerp(targetColor, 0.05);
    }

    // 2. Slow idle rotation of deity
    if (deityRef.current) {
      deityRef.current.rotation.y = time * 0.15;
    }

    // 3. Emissive Flame & Diya Point light flickering (sine waves)
    const flicker1 = Math.sin(time * 15) * 0.15 + Math.cos(time * 23) * 0.1 + 1.0;
    const flicker2 = Math.cos(time * 12) * 0.15 + Math.sin(time * 27) * 0.1 + 1.0;

    if (light1Ref.current) light1Ref.current.intensity = flicker1 * 1.5;
    if (light2Ref.current) light2Ref.current.intensity = flicker2 * 1.5;
    
    if (flame1Ref.current) {
      flame1Ref.current.scale.set(
        1 + Math.sin(time * 20) * 0.1,
        1.2 + Math.cos(time * 15) * 0.2,
        1 + Math.sin(time * 20) * 0.1
      );
    }
    if (flame2Ref.current) {
      flame2Ref.current.scale.set(
        1 + Math.cos(time * 18) * 0.1,
        1.2 + Math.sin(time * 22) * 0.2,
        1 + Math.cos(time * 18) * 0.1
      );
    }

    // 4. Scroll-Driven Camera & Lighting Interpolation
    // Map scrollProgress (0 to 1) to three-dimensional paths
    if (state.camera) {
      let targetCamX = 0;
      let targetCamY = 1.8;
      let targetCamZ = 7.5;
      
      let targetLookAtY = 1.0;

      // Color/Lights parameters
      let ambientColor = new THREE.Color('#1A1610');
      let spotColor = new THREE.Color('#FDFAF4');
      let spotIntensity = 12.0;

      if (scrollProgress < 0.2) {
        // Scene 1: Temple Entrance (Zooming in through doors)
        const progress = scrollProgress / 0.2; // 0 to 1
        targetCamZ = 9.0 - progress * 2.0; // 9 -> 7
        targetCamY = 2.5 - progress * 0.8; // 2.5 -> 1.7
        targetCamX = 0;
        targetLookAtY = 1.0;
      } else if (scrollProgress >= 0.2 && scrollProgress < 0.4) {
        // Scene 2: Vrindavan Garden (Slight Pan/Tilt to the side)
        const progress = (scrollProgress - 0.2) / 0.2; // 0 to 1
        targetCamZ = 7.0;
        targetCamX = progress * 1.5; // Pan right
        targetCamY = 1.7 + progress * 0.5; // Move slightly up
        targetLookAtY = 1.0;
      } else if (scrollProgress >= 0.4 && scrollProgress < 0.65) {
        // Scene 3: Divine Darshan (Close-up lock on Deity)
        const progress = (scrollProgress - 0.4) / 0.25; // 0 to 1
        targetCamZ = 7.0 - progress * 3.5; // 7.0 -> 3.5 (Extreme close-up)
        targetCamX = 1.5 * (1 - progress); // Return center
        targetCamY = 2.2 * (1 - progress) + 1.2 * progress; // Lower camera height
        targetLookAtY = 0.9;
      } else {
        // Scene 4: Seva Timeline (Orbit and Dynamic lighting temperatures)
        const progress = (scrollProgress - 0.65) / 0.35; // 0 to 1
        
        // Circular orbit
        const angle = progress * Math.PI * 0.5; // 90 degree orbit
        targetCamX = Math.sin(angle) * 3.5;
        targetCamZ = Math.cos(angle) * 3.5;
        targetCamY = 1.2 + progress * 0.4;
        targetLookAtY = 0.9;

        // Dynamic light spectrum transitions based on timeline
        if (progress < 0.25) {
          // Mangala: Deep pre-dawn blue (2800K warm)
          const p = progress / 0.25;
          ambientColor.setHSL(0.6, 0.4, 0.05 + p * 0.05); // pre-dawn blue -> warm gold sunrise
          spotColor.set('#E8D9BE');
          spotIntensity = 6.0;
        } else if (progress >= 0.25 && progress < 0.5) {
          // Shringar: Golden sunrise (4500K)
          const p = (progress - 0.25) / 0.25;
          ambientColor.set('#8B6914');
          spotColor.set('#C9A84C');
          spotIntensity = 12.0;
        } else if (progress >= 0.5 && progress < 0.75) {
          // Rajbhog: Warm afternoon (5500K bright)
          const p = (progress - 0.5) / 0.25;
          ambientColor.set('#FAF6EF').multiplyScalar(0.2);
          spotColor.set('#FDFAF4');
          spotIntensity = 16.0;
        } else {
          // Sandhya Aarti to Shayan: Amber dusk -> Deep indigo night (3200K -> 2200K)
          const p = (progress - 0.75) / 0.25;
          ambientColor.lerp(new THREE.Color('#0D0B08'), p);
          spotColor.lerp(new THREE.Color('#3B6B3B').multiplyScalar(0.2), p); // Fade to candle-lit aura
          spotIntensity = 16.0 * (1 - p) + 3.0 * p;
        }
      }

      // Smoothly interpolate camera position using simple lerping
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetCamX, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 0.05);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.05);
      
      const targetLookAt = new THREE.Vector3(0, targetLookAtY, 0);
      state.camera.lookAt(targetLookAt);

      // Lerp light parameters
      if (ambientLightRef.current) {
        ambientLightRef.current.color.lerp(ambientColor, 0.05);
      }
      if (mainSpotLightRef.current) {
        mainSpotLightRef.current.color.lerp(spotColor, 0.05);
        mainSpotLightRef.current.intensity = THREE.MathUtils.lerp(mainSpotLightRef.current.intensity, spotIntensity, 0.05);
      }
    }
  });

  return (
    <group ref={cameraRef}>
      {/* Lights */}
      <ambientLight ref={ambientLightRef} intensity={0.6} color="#1A1610" />
      <directionalLight
        ref={sunLightRef}
        position={[5, 10, 5]}
        intensity={0.8}
        color="#F2EAD3"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        ref={mainSpotLightRef}
        position={[0, 8, 4]}
        angle={0.4}
        penumbra={1}
        intensity={10}
        color="#FDFAF4"
        castShadow
      />

      {/* --- DEVOTIONAL 3D DIORAMA --- */}

      {/* Temple Sandstone Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#362E25" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Yamuna Water Plane (Scrolling Normal Maps Simulated) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1B5E6E" roughness={0.1} metalness={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Sandstone Altar Pedestal Steps */}
      <group position={[0, 0, 0]}>
        {/* Step 1 */}
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.2, 4]} />
          <meshStandardMaterial color="#E8D9BE" roughness={0.6} />
        </mesh>
        {/* Step 2 */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.2, 3]} />
          <meshStandardMaterial color="#D9C7A5" roughness={0.6} />
        </mesh>
      </group>

      {/* Ornate Gold Throne */}
      <group position={[0, 0.4, 0]} castShadow>
        {/* Base */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.9, 1.0, 0.2, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Velvet Cushion */}
        <mesh position={[0, 0.23, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
          <meshStandardMaterial color="#8B6914" roughness={0.8} />
        </mesh>
        {/* Ornate Golden Halo/Backrest Arch */}
        <mesh position={[0, 0.9, -0.6]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.7, 0.12, 12, 32]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Halo spikes/sunray details */}
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (i - 4) * 0.35;
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * 0.85, 0.9 + Math.cos(angle) * 0.85, -0.6]}
              rotation={[0, 0, -angle]}
            >
              <coneGeometry args={[0.04, 0.3, 4]} />
              <meshStandardMaterial color="#C9A84C" metalness={0.95} roughness={0.1} />
            </mesh>
          );
        })}
      </group>

      {/* Stylized Abstract Brass Deity representation (Laddu Gopal) */}
      <group ref={deityRef} position={[0, 0.75, 0]}>
        {/* Polished Brass Body (Ellipsoid) */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.25, 32, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <sphereGeometry args={[0.15, 32, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Right arm (holding abstract butter ball) */}
        <mesh position={[0.2, 0.28, 0.1]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.25, 0.29, 0.17]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FAF6EF" roughness={0.8} /> {/* Butter blob */}
        </mesh>
        {/* Left arm */}
        <mesh position={[-0.2, 0.28, 0.1]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Crown (Mukut) */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <coneGeometry args={[0.1, 0.22, 16]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.98} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.85, 0.02]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#D4788A" emissive="#D4788A" emissiveIntensity={0.5} /> {/* Crown ruby */}
        </mesh>

        {/* Morphing Poshak Fabric (draped fabric cloth effect surrounding body) */}
        <mesh position={[0, 0.18, 0.05]} castShadow>
          <torusGeometry args={[0.27, 0.09, 8, 24]} />
          <meshStandardMaterial
            ref={poshakMaterialRef}
            color="#3B6B3B" // starts green
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Sandstone Temple Pillars (Framing depth) */}
      <group>
        {/* Left Pillar */}
        <mesh position={[-3, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6, 8]} />
          <meshStandardMaterial color="#4A3F33" roughness={0.8} />
        </mesh>
        <mesh position={[-3, 5.6, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <meshStandardMaterial color="#4A3F33" roughness={0.8} />
        </mesh>
        {/* Right Pillar */}
        <mesh position={[3, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6, 8]} />
          <meshStandardMaterial color="#4A3F33" roughness={0.8} />
        </mesh>
        <mesh position={[3, 5.6, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <meshStandardMaterial color="#4A3F33" roughness={0.8} />
        </mesh>
      </group>

      {/* Brass Diyas with Point Lights and flame meshes */}
      <group position={[-1.3, 0.45, 1.2]} castShadow>
        {/* Diya Cup */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.1, 0.08, 12]} />
          <meshStandardMaterial color="#8B6914" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Flame */}
        <mesh ref={flame1Ref} position={[0, 0.08, 0]}>
          <coneGeometry args={[0.025, 0.08, 8]} />
          <meshBasicMaterial color="#E27D22" />
        </mesh>
        {/* Point Light */}
        <pointLight
          ref={light1Ref}
          color="#E27D22"
          intensity={1.5}
          distance={3}
          castShadow
          shadow-bias={-0.002}
        />
      </group>

      <group position={[1.3, 0.45, 1.2]} castShadow>
        {/* Diya Cup */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.1, 0.08, 12]} />
          <meshStandardMaterial color="#8B6914" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Flame */}
        <mesh ref={flame2Ref} position={[0, 0.08, 0]}>
          <coneGeometry args={[0.025, 0.08, 8]} />
          <meshBasicMaterial color="#E27D22" />
        </mesh>
        {/* Point Light */}
        <pointLight
          ref={light2Ref}
          color="#E27D22"
          intensity={1.5}
          distance={3}
          castShadow
          shadow-bias={-0.002}
        />
      </group>
    </group>
  );
};
export default DeityScene;
