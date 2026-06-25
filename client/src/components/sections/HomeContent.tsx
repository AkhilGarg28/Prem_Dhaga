'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useScene } from '../../store/useScene';
import { useAudio } from '../../store/useAudio';
import LoadingScreen from './LoadingScreen';
import { Icons } from '../Icons';

export const HomeContent = () => {
  const {
    scrollProgress,
    setScrollProgress,
    activePoshakIndex,
    setActivePoshakIndex,
    isLoading,
  } = useScene();

  const { updateMix } = useAudio();

  // Bind scroll progress to Zustand store and trigger audio mixes
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Scroll limit
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      
      setScrollProgress(progress);
      updateMix(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial calculation
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress, updateMix]);

  const handleBeginDarshan = () => {
    // Scroll smoothly to Darshan section
    const darshanEl = document.getElementById('darshan-section');
    if (darshanEl) {
      darshanEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const poshakList = [
    { name: 'Vrindavan Green Poshak', desc: 'Summer Silk Series' },
    { name: 'Lotus Pink Veshbhusha', desc: 'Phool Bangla Offering' },
    { name: 'Swarna Janmashtami Poshak', desc: 'Heavily Embroidered Royal Gold' },
    { name: 'Peacock Blue Rajbhog Attire', desc: 'Afternoon Offering Special' },
    { name: 'Ivory Nidhra Nightdress', desc: 'Shayan Silk Essentials' },
    { name: 'Temple Bronze Silk Dress', desc: 'Daily Darshan Collection' },
    { name: 'Saffron Aarti Poshak', desc: 'Sandhya Mangal Special' },
  ];

  return (
    <div className="relative w-full z-10">
      {/* 3-4s Portal Doors Loading Intro */}
      <LoadingScreen />

      {/* SECTION 1: HERO OVERLAY (100vh) */}
      <section className="min-h-screen w-full flex flex-col justify-center px-6 md:px-24 bg-gradient-to-b from-transparent to-temple-black/40">
        <div className="max-w-3xl space-y-6">
          {/* Eyebrow */}
          <p className="font-utility text-xs md:text-sm tracking-[0.25em] text-royal-gold uppercase animate-fade-in">
            Handcrafted Devotional Fashion
          </p>
          
          {/* Title with SplitText effect simulated */}
          <h1 className="font-display text-5xl md:text-8xl font-light tracking-wide text-ivory leading-none">
            Threads Woven <br />
            <span className="font-display italic text-royal-gold font-normal">with Devotion.</span>
          </h1>

          {/* Body */}
          <p className="font-body text-sm md:text-base text-warm-beige/80 max-w-lg leading-relaxed">
            Poshaks, Mukuts & Seva Essentials crafted for your beloved Laddu Gopal. Weaved in the sacred lands of Vrindavan.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/collections"
              className="font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black px-8 py-3.5 hover:bg-ivory hover:text-temple-black transition-all border border-royal-gold font-semibold"
            >
              Explore Collections
            </Link>
            <button
              onClick={handleBeginDarshan}
              className="font-utility text-xs tracking-widest uppercase border border-royal-gold/40 text-royal-gold px-8 py-3.5 hover:bg-royal-gold hover:text-temple-black transition-all font-semibold"
            >
              Begin Darshan
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-warm-beige/40">
          <span className="font-utility text-[9px] tracking-[0.3em] uppercase">Scroll to Enter</span>
          <div className="w-[1px] h-12 bg-royal-gold/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-royal-gold animate-bounce" />
          </div>
        </div>
      </section>

      {/* SECTION 2: VRINDAVAN GARDEN (100vh) */}
      <section className="min-h-screen w-full flex items-center justify-end px-6 md:px-24 py-24 bg-temple-black/20">
        <div className="w-full max-w-md md:max-w-xl glass-panel p-8 md:p-12 space-y-6 border border-royal-gold/10">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">The Spirit of the Atelier</span>
          <h2 className="font-display text-3xl md:text-4xl text-ivory">
            Woven in Vrindavan, <br />
            Blessed by the Holy Name.
          </h2>
          <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
            Every thread is an offering. Our materials are hand-sourced pure organic silk, decorated with real gold laces (gota patti) and weaved in the divine presence of Vrindavan.
          </p>
          <div className="h-[1px] bg-royal-gold/15 w-full my-4" />
          <p className="font-hindi text-sm italic text-royal-gold">
            “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-utility text-[10px] tracking-widest uppercase text-royal-gold hover:text-ivory transition-colors mt-4"
          >
            Discover our artisans <Icons.ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* SECTION 3: DIVINE DARSHAN - POSHAK MORPH (150vh) */}
      <section
        id="darshan-section"
        className="min-h-[150vh] w-full relative flex items-start px-6 md:px-24 py-24 bg-gradient-to-b from-transparent via-temple-black/60 to-temple-black"
      >
        <div className="sticky top-28 left-0 max-w-sm space-y-8 z-20">
          <div>
            <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Divine Interactive</span>
            <h2 className="font-display text-4xl text-ivory mt-2">Divine Darshan</h2>
            <p className="font-body text-xs text-warm-beige/70 mt-3 leading-relaxed">
              Interact with the swatches below to dress our abstract deity model and preview seasonal collections.
            </p>
          </div>

          {/* Interactive Morph Selector Swatches */}
          <div className="space-y-3">
            <span className="font-utility text-[10px] text-warm-beige/40 uppercase tracking-widest">Select Veshbhusha</span>
            <div className="flex flex-col gap-2">
              {poshakList.map((poshak, index) => (
                <button
                  key={index}
                  onClick={() => setActivePoshakIndex(index)}
                  className={`w-full text-left p-3 border transition-all duration-300 flex items-center justify-between group ${
                    activePoshakIndex === index
                      ? 'border-royal-gold bg-royal-gold/5 text-royal-gold'
                      : 'border-royal-gold/15 text-warm-beige/60 hover:border-royal-gold/50'
                  }`}
                >
                  <div>
                    <h4 className="font-display text-sm tracking-wide group-hover:text-ivory transition-colors">
                      {poshak.name}
                    </h4>
                    <span className="text-[10px] font-utility tracking-widest opacity-60">
                      {poshak.desc}
                    </span>
                  </div>
                  <span className="font-utility text-xs italic opacity-40">0{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEVA TIMELINE (150vh) */}
      <section className="min-h-[150vh] w-full px-6 md:px-24 py-32 bg-temple-black flex flex-col justify-start">
        <div className="max-w-xl space-y-4 mb-16">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Daily Devotional Routine</span>
          <h2 className="font-display text-4xl text-ivory">The Five Sevas</h2>
          <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
            As you scroll down, experience the shifting temperatures of Vrindavan's sky and the changing sounds of local mandirs.
          </p>
        </div>

        {/* Vertical Timeline Editorial Cards */}
        <div className="space-y-24 max-w-2xl relative border-l border-royal-gold/15 pl-6 md:pl-12 ml-4">
          {/* Card 1 */}
          <div className="relative space-y-3 group">
            {/* Timeline node */}
            <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-4 h-4 rounded-full border-2 border-royal-gold bg-temple-black group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl italic text-royal-gold/50">01</span>
              <h3 className="font-display text-2xl text-ivory">Mangala Darshan (Dawn)</h3>
            </div>
            <p className="font-utility text-[10px] text-royal-gold tracking-widest uppercase">Deep pre-dawn sky  ·  Soft flute</p>
            <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
              Wakening your beloved deity with gentle morning prayers. Attire is light and soft, comforting the lord as he enters the new day.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative space-y-3 group">
            <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-4 h-4 rounded-full border-2 border-royal-gold bg-temple-black group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl italic text-royal-gold/50">02</span>
              <h3 className="font-display text-2xl text-ivory">Shringar Seva (Sunrise)</h3>
            </div>
            <p className="font-utility text-[10px] text-royal-gold tracking-widest uppercase">Golden sunrise sky  ·  Chimes & bells</p>
            <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
              Ornamenting Laddu Gopal with exquisite necklaces, wristbands, waistbands, and the royal crown. A ritual of absolute beauty.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative space-y-3 group">
            <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-4 h-4 rounded-full border-2 border-royal-gold bg-temple-black group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl italic text-royal-gold/50">03</span>
              <h3 className="font-display text-2xl text-ivory">Rajbhog Seva (Afternoon)</h3>
            </div>
            <p className="font-utility text-[10px] text-royal-gold tracking-widest uppercase">Warm bright noon  ·  Temple courtyard chatter</p>
            <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
              Offering the mid-day feast. Attire is grand and formal, woven in royal brocades to denote the king of kings.
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative space-y-3 group">
            <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-4 h-4 rounded-full border-2 border-royal-gold bg-temple-black group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl italic text-royal-gold/50">04</span>
              <h3 className="font-display text-2xl text-ivory">Sandhya Aarti (Dusk)</h3>
            </div>
            <p className="font-utility text-[10px] text-royal-gold tracking-widest uppercase">Amber evening sky  ·  Bells & conch shells</p>
            <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
              Waving the golden ghee lamps, calling all devotees home. Richly saturated velvet and silk poshaks capture the lamp light.
            </p>
          </div>

          {/* Card 5 */}
          <div className="relative space-y-3 group">
            <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-4 h-4 rounded-full border-2 border-royal-gold bg-temple-black group-hover:scale-125 transition-transform" />
            
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl italic text-royal-gold/50">05</span>
              <h3 className="font-display text-2xl text-ivory">Shayan Seva (Night)</h3>
            </div>
            <p className="font-utility text-[10px] text-royal-gold tracking-widest uppercase">Deep starry indigo  ·  Fading flute music</p>
            <p className="font-body text-xs text-warm-beige/70 leading-relaxed">
              Preparing the lord for sleep. Poshaks are changed to the softest cotton or ivory silk nightwear, ensuring peaceful rest.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CALL TO ACTION (80vh) */}
      <section className="min-h-[80vh] w-full flex flex-col justify-center items-center text-center px-6 bg-gradient-to-t from-deep-charcoal to-temple-black relative overflow-hidden">
        {/* Floating background chimes / aura */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-royal-gold/5 blur-[120px] pointer-events-none" />

        <div className="max-w-2xl space-y-8 z-10">
          <Icons.PeacockFeather className="text-royal-gold mx-auto animate-pulse" size={48} />
          
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-wide text-ivory leading-tight">
            Complete the Seva. <br />
            <span className="italic text-royal-gold">Adorn the Divine.</span>
          </h2>
          
          <p className="font-body text-sm text-warm-beige/80 max-w-md mx-auto leading-relaxed">
            Browse our curated collections or consult with our master artisans to weave a bespoke poshak for your home mandir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/collections"
              className="w-full sm:w-auto font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black px-8 py-4 hover:bg-ivory hover:text-temple-black transition-all border border-royal-gold font-semibold"
            >
              Browse Collections
            </Link>
            <Link
              href="/custom"
              className="w-full sm:w-auto font-utility text-xs tracking-widest uppercase border border-royal-gold/40 text-royal-gold px-8 py-4 hover:bg-royal-gold hover:text-temple-black transition-all font-semibold"
            >
              Bespoke Atelier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomeContent;
