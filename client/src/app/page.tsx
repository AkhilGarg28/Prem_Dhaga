import dynamic from 'next/dynamic';
import HomeContent from '@/components/sections/HomeContent';

// Load the 3D canvas dynamically with SSR disabled to prevent server-side pre-render errors
const MainCanvas = dynamic(() => import('@/components/canvas/MainCanvas'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-temple-black">
      {/* 3D Canvas Background (React Three Fiber) */}
      <MainCanvas />

      {/* Narrative Page Scroll Overlay */}
      <HomeContent />
    </div>
  );
}
