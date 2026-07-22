'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/Icons';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  collectionSlug?: string;
  swatches: { name: string; hex: string }[];
}

const allMockProducts: Product[] = [
  {
    _id: 'prod_1',
    name: 'Lotus Shringaar Poshak',
    slug: 'lotus-shringaar-poshak',
    description: 'Delicate lotus embroidery, soft silk and fine golden borders for morning shringar.',
    basePrice: 1200,
    images: ['/images/prem-dhaga-hero.png'],
    collectionSlug: 'morning-darshan',
    swatches: [
      { name: 'Vrindavan Green', hex: '#3B6B3B' },
      { name: 'Lotus Pink', hex: '#D4788A' },
      { name: 'Royal Gold', hex: '#C9A84C' },
    ],
  },
  {
    _id: 'prod_2',
    name: 'Morpankh Velvet Poshak',
    slug: 'morpankh-velvet-poshak',
    description: 'Deep peacock velvet with hand-embroidered feather details and kundan accents.',
    basePrice: 2800,
    images: ['/images/janmashtami-poshak.png'],
    collectionSlug: 'rajbhog-royal',
    swatches: [
      { name: 'Peacock Blue', hex: '#1B5E6E' },
      { name: 'Royal Gold', hex: '#C9A84C' },
    ],
  },
  {
    _id: 'prod_3',
    name: 'Swarna Janmashtami Poshak',
    slug: 'swarna-janmashtami-poshak',
    description: 'Heavily embellished zardozi poshak with matching mukut fabric and festival finishing.',
    basePrice: 4500,
    images: ['/images/janmashtami-poshak.png'],
    collectionSlug: 'janmashtami-grand-edition',
    swatches: [
      { name: 'Royal Gold', hex: '#C9A84C' },
      { name: 'Lotus Pink', hex: '#D4788A' },
    ],
  },
  {
    _id: 'prod_4',
    name: 'Nidhra Silk Night Dress',
    slug: 'nidhra-silk-night-dress',
    description: 'Ultra-soft ivory silk night poshak with minimal floral embroidery for shayan seva.',
    basePrice: 950,
    images: ['/images/shayan-poshak.png'],
    collectionSlug: 'shayan-veshbhusha',
    swatches: [
      { name: 'Ivory White', hex: '#FAF6EF' },
      { name: 'Lotus Pink', hex: '#D4788A' },
    ],
  },
];

const titleFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const initialProducts = useMemo(() => {
    const matched = allMockProducts.filter((p) => p.collectionSlug === params.slug);
    return matched.length > 0 ? matched : allMockProducts;
  }, [params.slug]);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [collectionTitle, setCollectionTitle] = useState(titleFromSlug(params.slug));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products?collectionSlug=${params.slug}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        setCollectionTitle(titleFromSlug(params.slug));
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        // Keeps initial products seamlessly
      }
    };

    fetchProducts();
  }, [params.slug]);

  const heroImage = useMemo(() => products[0]?.images?.[0] || '/images/prem-dhaga-hero.png', [products]);

  return (
    <div className="min-h-screen bg-temple-black text-ivory">
      <section className="relative flex min-h-[64svh] items-end overflow-hidden px-5 pb-16 pt-32 sm:px-10 lg:px-16">
        <Image src={heroImage} alt={collectionTitle} fill priority sizes="100vw" className="absolute inset-0 object-cover object-center opacity-45" />
        <div className="absolute inset-0 hero-veil" />
        <div className="absolute inset-0 temple-grain opacity-30" />
        <div className="relative mx-auto w-full max-w-[1450px]">
          <Link href="/collections" className="sacred-link group mb-10 inline-flex">
            <Icons.Close size={12} className="rotate-45" /> Back to galleries
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
            <p className="eyebrow">Collection story</p>
            <h1 className="mt-5 font-display text-6xl font-light leading-none tracking-normal sm:text-8xl lg:text-[8rem]">{collectionTitle}</h1>
            <p className="mt-7 max-w-xl font-body text-sm leading-7 text-cream/66">
              Explore devotional couture custom stitched in sizes 0 to 8, with materials, colors and matching accessories chosen for this darshan mood.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          {loading ? (
            <div className="grid min-h-[320px] place-items-center">
              <Icons.PeacockFeather className="animate-pulse text-royal-gold" size={48} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="font-display text-lg text-warm-beige/50 italic">No offerings are currently in this gallery.</p>
              <Link href="/collections" className="luxury-button">Back to collections</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <motion.article
                  key={product._id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.75, delay: index * 0.06 }}
                  className="group overflow-hidden border border-royal-gold/12 bg-deep-charcoal"
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-temple-black">
                      <Image src={product.images[0] || '/images/prem-dhaga-hero.png'} alt={product.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-82 transition duration-1000 group-hover:scale-105 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-5 left-5 font-utility text-[9px] uppercase tracking-[0.24em] text-cream/72">Fabric zoom / 360 mood</span>
                    </div>
                    <div className="space-y-5 p-6">
                      <div>
                        <h2 className="font-display text-3xl font-light text-ivory transition-colors duration-300 group-hover:text-royal-gold">{product.name}</h2>
                        <p className="mt-2 line-clamp-2 font-body text-xs leading-6 text-warm-beige/62">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-utility text-[10px] uppercase tracking-[0.18em] text-royal-gold">From INR {product.basePrice}</span>
                        <div className="flex gap-1.5">
                          {product.swatches?.map((swatch, swatchIndex) => (
                            <span key={`${swatch.name}-${swatchIndex}`} className="h-3 w-3 rounded-full border border-royal-gold/25" style={{ backgroundColor: swatch.hex }} title={swatch.name} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
