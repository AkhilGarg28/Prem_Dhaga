'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products/collections`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.ok ? await res.json() : [];
        if (data.length > 0) {
          setCollections(data);
        } else {
          throw new Error('Empty');
        }
      } catch (err) {
        // Fallback static mock data
        setCollections([
          {
            _id: 'col_1',
            title: 'Summer Silk Collection',
            slug: 'summer-silk',
            description: 'Lightweight, breathable pure silk poshaks for the warm Vrindavan summers.',
            coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
          },
          {
            _id: 'col_2',
            title: 'Janmashtami Grand Edition',
            slug: 'janmashtami-grand-edition',
            description: "Exquisite heavily embroidered royal attire for Kanha's appearance day.",
            coverImage: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
          },
          {
            _id: 'col_3',
            title: 'Rajbhog Royal Collection',
            slug: 'rajbhog-royal',
            description: 'Grand attire in deep shades decorated with detailed Zardozi work.',
            coverImage: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
          },
          {
            _id: 'col_4',
            title: 'Shayan Veshbhusha',
            slug: 'shayan-veshbhusha',
            description: 'Soft, comfortable silk and cotton nightwear designed for peaceful rest.',
            coverImage: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?q=80&w=600&auto=format&fit=crop',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Parallax tilt logic on mousemove
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max 5 degrees rotation
    const rotateX = ((centerY - y) / centerY) * 4;
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    const glow = card.querySelector('.glare-effect') as HTMLDivElement;
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(201, 168, 76, 0.15) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    const glow = card.querySelector('.glare-effect') as HTMLDivElement;
    if (glow) {
      glow.style.background = 'transparent';
    }
  };

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4 mb-16">
        <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">The Atelier Galleries</span>
        <h1 className="font-display text-4xl md:text-6xl text-ivory">The Sacred Collections</h1>
        <p className="font-body text-sm text-warm-beige/70 leading-relaxed max-w-xl">
          Every poshak is weaved with continuous chants of the holy names, transforming premium organic fabrics into devotional offerings for your home mandir.
        </p>
      </div>

      {/* Grid: flows horizontally on desktop, vertical list on mobile */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center h-64">
          <Icons.PeacockFeather className="text-royal-gold animate-bounce" size={48} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-8 md:scrollbar-thin scroll-smooth snap-x">
          {collections.map((col) => (
            <div
              key={col._id}
              onMouseMove={(e) => handleMouseMove(e, col._id)}
              onMouseLeave={handleMouseLeave}
              className="snap-start flex-shrink-0 w-full md:w-[480px] h-[550px] relative rounded-sm bg-deep-charcoal border border-royal-gold/10 overflow-hidden cursor-pointer transition-all duration-300 ease-out golden-draw-card group shadow-lg"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Parallax inner image */}
              <div className="absolute inset-0 z-0 scale-[1.03] transition-transform duration-700 ease-out group-hover:scale-[1.08]">
                <img
                  src={col.coverImage}
                  alt={col.title}
                  className="w-full h-full object-cover opacity-60"
                />
              </div>

              {/* Glare effect */}
              <div className="glare-effect absolute inset-0 z-10 pointer-events-none transition-all duration-100" />

              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-temple-black via-temple-black/20 to-transparent z-10" />

              {/* Text info positioned bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-4">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl md:text-3xl text-ivory tracking-wide group-hover:text-royal-gold transition-colors duration-300">
                    {col.title}
                  </h2>
                  <p className="font-body text-xs text-warm-beige/80 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="inline-flex items-center gap-2 font-utility text-[10px] tracking-widest uppercase bg-royal-gold text-temple-black group-hover:bg-ivory px-5 py-2.5 transition-all font-semibold"
                  >
                    View Offerings <Icons.ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
