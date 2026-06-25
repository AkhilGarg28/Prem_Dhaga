'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../store/useCart';
import { Icons } from './Icons';

export const Navbar = () => {
  const { getCartCount, setIsOpen } = useCart();
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 left-0 w-full z-40 transition-all duration-300 glass-panel border-b border-royal-gold/15 py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Identity / Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <Icons.PeacockFeather className="text-royal-gold group-hover:rotate-12 transition-transform duration-500 ease-out" size={28} />
        <div className="flex flex-col">
          <span className="font-display text-xl md:text-2xl font-medium tracking-[0.15em] text-ivory group-hover:text-royal-gold transition-colors duration-300">
            PREM DHAGA
          </span>
          <span className="font-hindi text-[9px] text-warm-beige/70 tracking-wider">
            सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/collections" className="font-utility text-xs tracking-[0.2em] uppercase text-ivory/80 hover:text-royal-gold nav-link-hover transition-colors">
          Collections
        </Link>
        <Link href="/custom" className="font-utility text-xs tracking-[0.2em] uppercase text-ivory/80 hover:text-royal-gold nav-link-hover transition-colors">
          Custom Atelier
        </Link>
        <Link href="/seva-guide" className="font-utility text-xs tracking-[0.2em] uppercase text-ivory/80 hover:text-royal-gold nav-link-hover transition-colors">
          Seva Guide
        </Link>
        <Link href="/about" className="font-utility text-xs tracking-[0.2em] uppercase text-ivory/80 hover:text-royal-gold nav-link-hover transition-colors">
          Our Journey
        </Link>
      </nav>

      {/* Right Tools */}
      <div className="flex items-center gap-4">
        {/* Admin Link */}
        <Link
          href="/admin"
          className="font-utility text-[10px] tracking-[0.15em] uppercase border border-royal-gold/30 hover:border-royal-gold px-3 py-1 text-warm-beige hover:text-royal-gold transition-all"
        >
          Admin
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 hover:text-royal-gold transition-colors"
          aria-label="Open Cart"
        >
          <Icons.Cart size={22} className="text-ivory hover:text-royal-gold transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-lotus-pink text-off-white text-[9px] font-utility font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
export default Navbar;
