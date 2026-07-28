'use client';

import dynamic from 'next/dynamic';

const AudioController = dynamic(() => import('./AudioController'), { ssr: false });
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });

export default function ClientChrome() {
  return (
    <>
      <AudioController />
      <CartDrawer />
    </>
  );
}