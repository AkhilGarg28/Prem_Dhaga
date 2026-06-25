'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  swatches: { name: string; hex: string }[];
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch products by collection slug
        const res = await fetch(`${apiUrl}/products?collectionSlug=${params.slug}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        // Also figure out collection title based on slug
        const formattedTitle = params.slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setCollectionTitle(formattedTitle);

        if (data.length > 0) {
          setProducts(data);
        } else {
          throw new Error('No products');
        }
      } catch (err) {
        // Mock static fallbacks matching our seeds
        setCollectionTitle(
          params.slug === 'summer-silk'
            ? 'Summer Silk Collection'
            : params.slug === 'janmashtami-grand-edition'
            ? 'Janmashtami Grand Edition'
            : params.slug === 'rajbhog-royal'
            ? 'Rajbhog Royal Collection'
            : 'Shayan Veshbhusha'
        );

        // Seeded products fallbacks
        const allMockProducts = [
          {
            _id: 'prod_1',
            name: 'Lotus Shringaar Poshak',
            slug: 'lotus-shringaar-poshak',
            description: 'Handcrafted in Vrindavan with delicate lotus embroidery and fine golden borders.',
            basePrice: 1200,
            images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'],
            collectionSlug: 'summer-silk',
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
            description: 'Deep royal blue velvet poshak with detailed hand-embroidered peacock feathers.',
            basePrice: 2800,
            images: ['https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop'],
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
            description: 'Heavily embellished golden Zardozi poshak with matching crown (mukut) fabric.',
            basePrice: 4500,
            images: ['https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop'],
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
            description: 'Ultra-soft ivory silk night poshak with minimal floral embroidery.',
            basePrice: 950,
            images: ['https://images.unsplash.com/photo-1508615070457-7baeba4003ab?q=80&w=600&auto=format&fit=crop'],
            collectionSlug: 'shayan-veshbhusha',
            swatches: [
              { name: 'Ivory White', hex: '#FAF6EF' },
              { name: 'Lotus Pink', hex: '#D4788A' },
            ],
          },
        ];

        setProducts(allMockProducts.filter((p) => p.collectionSlug === params.slug));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.slug]);

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      {/* Back button */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 font-utility text-[9px] tracking-widest uppercase text-warm-beige/60 hover:text-royal-gold transition-colors mb-8"
      >
        <Icons.Close size={12} className="rotate-45" /> Back to Galleries
      </Link>

      {/* Header */}
      <div className="max-w-3xl space-y-3 mb-16">
        <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Gallery Category</span>
        <h1 className="font-display text-4xl md:text-5xl text-ivory">{collectionTitle}</h1>
        <p className="font-body text-xs md:text-sm text-warm-beige/70 italic">
          Explore devotional couture, custom stitched in sizes 0 to 8.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center h-64">
          <Icons.PeacockFeather className="text-royal-gold animate-bounce" size={48} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="font-display text-lg text-warm-beige/50 italic">"No items are currently in this gallery."</p>
          <Link href="/collections" className="font-utility text-xs bg-royal-gold text-temple-black px-6 py-2">
            Back to Collections
          </Link>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="group bg-deep-charcoal border border-royal-gold/10 overflow-hidden flex flex-col rounded-sm hover:border-royal-gold/30 transition-all duration-300 shadow-md"
            >
              {/* Image box */}
              <div className="w-full aspect-[4/5] bg-temple-black overflow-hidden relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                />
              </div>

              {/* Info panel */}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-display text-lg text-ivory group-hover:text-royal-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="font-body text-[11px] text-warm-beige/60 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-utility text-xs text-royal-gold">From ₹{product.basePrice}</span>
                  
                  {/* Swatches indicator */}
                  <div className="flex gap-1.5">
                    {product.swatches?.map((swatch, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-royal-gold/25"
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
