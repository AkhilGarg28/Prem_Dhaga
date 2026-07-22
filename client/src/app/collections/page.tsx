'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/Icons';

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  mood?: string;
  ritual?: string;
}

const fallbackCollections: Collection[] = [
  {
    _id: 'col_1',
    title: 'Morning Darshan',
    slug: 'morning-darshan',
    description: 'Light ivory silks, pearl borders and fresh floral details for the first seva of the day.',
    coverImage: '/images/prem-dhaga-hero.png',
    mood: 'Golden sunrise',
    ritual: 'Mangala',
  },
  {
    _id: 'col_2',
    title: 'Janmashtami Grand Edition',
    slug: 'janmashtami-grand-edition',
    description: 'Ceremonial zardozi, mukuts and heirloom finishing for the most awaited midnight darshan.',
    coverImage: '/images/janmashtami-poshak.png',
    mood: 'Temple gold',
    ritual: 'Festival',
  },
  {
    _id: 'col_3',
    title: 'Rajbhog Royal Collection',
    slug: 'rajbhog-royal',
    description: 'Peacock velvets, kundan accents and richer afternoon silhouettes for royal seva.',
    coverImage: '/images/janmashtami-poshak.png',
    mood: 'Peacock blue',
    ritual: 'Rajbhog',
  },
  {
    _id: 'col_4',
    title: 'Shayan Veshbhusha',
    slug: 'shayan-veshbhusha',
    description: 'Feather-soft silk and moonlit tones for the quiet final offering of the day.',
    coverImage: '/images/shayan-poshak.png',
    mood: 'Moon ivory',
    ritual: 'Shayan',
  },
  {
    _id: 'col_5',
    title: 'Winter Seva',
    slug: 'winter-seva',
    description: 'Layered velvet, warm brocade and brass-toned accents for colder months.',
    coverImage: '/images/shayan-poshak.png',
    mood: 'Amber dusk',
    ritual: 'Sandhya',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(fallbackCollections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products/collections`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data.map((item: Collection, index: number) => ({
            ...fallbackCollections[index % fallbackCollections.length],
            ...item,
          })));
        }
      } catch (err) {
        setCollections(fallbackCollections);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((rect.height / 2 - y) / (rect.height / 2)) * 3;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 3;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <div className="min-h-screen bg-temple-black text-ivory">
      <section className="relative flex min-h-[78svh] items-end overflow-hidden px-5 pb-20 pt-36 sm:px-10 lg:px-16">
        <Image src="/images/prem-dhaga-hero.png" alt="Prem Dhaga temple darshan" fill priority sizes="100vw" className="absolute inset-0 object-cover object-[65%_center] opacity-48" />
        <div className="absolute inset-0 hero-veil" />
        <div className="absolute inset-0 temple-grain opacity-30" />
        <div className="relative mx-auto w-full max-w-[1450px]">
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.9 }} className="max-w-4xl">
            <p className="eyebrow">The atelier galleries</p>
            <h1 className="mt-6 font-display text-6xl font-light leading-[0.88] tracking-normal sm:text-8xl lg:text-[8.5rem]">
              Sacred collections,
              <span className="block italic text-gold-gradient">not product grids.</span>
            </h1>
            <p className="mt-8 max-w-xl font-body text-sm leading-7 text-cream/68">
              Each collection is a darshan mood: a season of light, texture, fragrance and handcrafted detail for your beloved Laddu Gopal.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          {loading ? (
            <div className="grid min-h-[320px] place-items-center">
              <Icons.PeacockFeather className="animate-pulse text-royal-gold" size={48} />
            </div>
          ) : (
            <div className="space-y-7">
              {collections.map((collection, index) => (
                <motion.article
                  key={collection._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: Math.min(index * 0.06, 0.24) }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="collection-cinema group relative min-h-[620px] overflow-hidden border border-royal-gold/12 bg-deep-charcoal transition-transform duration-300 ease-out"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Image src={collection.coverImage} alt={collection.title} fill sizes="(min-width: 1024px) 1200px, 100vw" className="absolute inset-0 object-cover opacity-72 transition duration-[1.5s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-temple-black/94 via-temple-black/48 to-temple-black/12" />
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-temple-black to-transparent" />

                  <div className="relative flex min-h-[620px] flex-col justify-between p-7 sm:p-10 lg:p-14">
                    <div className="flex items-center justify-between gap-5">
                      <span className="font-utility text-[9px] uppercase tracking-[0.28em] text-cream/55">0{index + 1} / {collection.ritual || 'Seva'}</span>
                      <span className="hidden font-utility text-[9px] uppercase tracking-[0.28em] text-royal-gold sm:block">{collection.mood || 'Vrindavan mood'}</span>
                    </div>

                    <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
                      <div className="max-w-3xl">
                        <h2 className="font-display text-5xl font-light leading-none tracking-normal sm:text-7xl lg:text-[7.2rem]">{collection.title}</h2>
                        <p className="mt-6 max-w-lg font-body text-sm leading-7 text-cream/66">{collection.description}</p>
                      </div>
                      <Link href={`/collections/${collection.slug}`} className="particle-button luxury-button self-start lg:self-end">
                        Explore collection
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
