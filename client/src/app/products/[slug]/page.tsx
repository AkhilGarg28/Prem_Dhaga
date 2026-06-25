'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/useCart';
import { Icons } from '@/components/Icons';
import dynamic from 'next/dynamic';

const ProductCanvas = dynamic(() => import('@/components/canvas/ProductCanvas'), {
  ssr: false,
});


interface Swatch {
  name: string;
  hex: string;
  textureUrl?: string;
}

interface SizePrice {
  size: number;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  collectionId?: { title: string; slug: string };
  sizes: SizePrice[];
  swatches: Swatch[];
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Selector states
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch | null>(null);
  const [isBundleChecked, setIsBundleChecked] = useState(false);
  
  // UI states
  const [addState, setAddState] = useState<'default' | 'adding' | 'added'>('default');
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/products/${params.slug}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        
        setProduct(data);
        if (data.swatches && data.swatches.length > 0) {
          setSelectedSwatch(data.swatches[0]);
        }
      } catch (err) {
        // Fallback mockup matching our database seeds
        const mockProducts: Record<string, Product> = {
          'lotus-shringaar-poshak': {
            _id: 'prod_1',
            name: 'Lotus Shringaar Poshak',
            slug: 'lotus-shringaar-poshak',
            description: 'Handcrafted in Vrindavan with delicate lotus embroidery and fine golden borders. Woven with love on pure organic silk.',
            basePrice: 1200,
            images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'],
            sizes: Array.from({ length: 9 }).map((_, i) => ({ size: i, price: 1200 + i * 150 })),
            swatches: [
              { name: 'Vrindavan Green', hex: '#3B6B3B' },
              { name: 'Lotus Pink', hex: '#D4788A' },
              { name: 'Royal Gold', hex: '#C9A84C' },
              { name: 'Peacock Blue', hex: '#1B5E6E' },
            ],
            collectionId: { title: 'Summer Silk Collection', slug: 'summer-silk' },
          },
          'morpankh-velvet-poshak': {
            _id: 'prod_2',
            name: 'Morpankh Velvet Poshak',
            slug: 'morpankh-velvet-poshak',
            description: 'Deep royal blue velvet poshak with detailed hand-embroidered peacock feathers. Ideal for cold seasons and grand afternoon darshans.',
            basePrice: 2800,
            images: ['https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop'],
            sizes: Array.from({ length: 9 }).map((_, i) => ({ size: i, price: 2800 + i * 150 })),
            swatches: [
              { name: 'Peacock Blue', hex: '#1B5E6E' },
              { name: 'Royal Gold', hex: '#C9A84C' },
              { name: 'Temple Bronze', hex: '#8B6914' },
            ],
            collectionId: { title: 'Rajbhog Royal Collection', slug: 'rajbhog-royal' },
          },
          'swarna-janmashtami-poshak': {
            _id: 'prod_3',
            name: 'Swarna Janmashtami Poshak',
            slug: 'swarna-janmashtami-poshak',
            description: 'Heavily embellished golden Zardozi poshak with matching crown (mukut) fabric. Crafted over 12 days by master artisans in Vrindavan.',
            basePrice: 4500,
            images: ['https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop'],
            sizes: Array.from({ length: 9 }).map((_, i) => ({ size: i, price: 4500 + i * 150 })),
            swatches: [
              { name: 'Royal Gold', hex: '#C9A84C' },
              { name: 'Lotus Pink', hex: '#D4788A' },
            ],
            collectionId: { title: 'Janmashtami Grand Edition', slug: 'janmashtami-grand-edition' },
          },
          'nidhra-silk-night-dress': {
            _id: 'prod_4',
            name: 'Nidhra Silk Night Dress',
            slug: 'nidhra-silk-night-dress',
            description: 'Ultra-soft ivory silk night poshak with minimal floral embroidery. Light, non-restrictive design ensures peaceful rest for Laddu Gopal.',
            basePrice: 950,
            images: ['https://images.unsplash.com/photo-1508615070457-7baeba4003ab?q=80&w=600&auto=format&fit=crop'],
            sizes: Array.from({ length: 9 }).map((_, i) => ({ size: i, price: 950 + i * 150 })),
            swatches: [
              { name: 'Ivory White', hex: '#FAF6EF' },
              { name: 'Lotus Pink', hex: '#D4788A' },
            ],
            collectionId: { title: 'Shayan Veshbhusha', slug: 'shayan-veshbhusha' },
          },
        };

        const fallbackProd = mockProducts[params.slug] || mockProducts['lotus-shringaar-poshak'];
        setProduct(fallbackProd);
        if (fallbackProd.swatches.length > 0) {
          setSelectedSwatch(fallbackProd.swatches[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-temple-black flex justify-center items-center">
        <Icons.PeacockFeather className="text-royal-gold animate-bounce" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-temple-black flex flex-col justify-center items-center space-y-4">
        <p className="font-display text-lg text-warm-beige/50 italic">"Poshak details are lost."</p>
        <Link href="/collections" className="font-utility text-xs bg-royal-gold text-temple-black px-6 py-2">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Calculate current price based on size
  const sizeObj = product.sizes.find((s) => s.size === selectedSize);
  const currentPrice = sizeObj ? sizeObj.price : product.basePrice;
  const bundlePrice = isBundleChecked ? 600 : 0;
  const totalPrice = currentPrice + bundlePrice;

  const handleAddToCart = () => {
    if (!selectedSwatch) return;
    setAddState('adding');

    // Add main product to cart
    addItem({
      productId: product._id,
      name: `${product.name} (Size ${selectedSize})`,
      price: currentPrice,
      size: selectedSize,
      swatchHex: selectedSwatch.hex,
      swatchName: selectedSwatch.name,
      image: product.images[0],
    });

    // Add matching crown bundle if checked
    if (isBundleChecked) {
      addItem({
        productId: `${product._id}-bundle`,
        name: `Matching Mukut + Shringaar Set (Size ${selectedSize})`,
        price: 600,
        size: selectedSize,
        swatchHex: selectedSwatch.hex,
        swatchName: selectedSwatch.name,
        image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
      });
    }

    setTimeout(() => {
      setAddState('added');
      setTimeout(() => {
        setAddState('default');
      }, 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      {/* Breadcrumbs */}
      <div className="font-utility text-[9px] tracking-widest uppercase text-warm-beige/50 flex gap-2 items-center mb-8">
        <Link href="/collections" className="hover:text-royal-gold">Shop</Link>
        <span>/</span>
        {product.collectionId && (
          <>
            <Link href={`/collections/${product.collectionId.slug}`} className="hover:text-royal-gold">
              {product.collectionId.title}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-royal-gold">{product.name}</span>
      </div>

      {/* Grid split: 3D canvas (left), checkout (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: 3D pedestals view */}
        <div className="space-y-4">
          <ProductCanvas color={selectedSwatch?.hex || '#C9A84C'} />
          
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((img, idx) => (
              <div key={idx} className="aspect-square bg-deep-charcoal border border-royal-gold/10 overflow-hidden relative rounded-sm">
                <img src={img} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: checkout forms */}
        <div className="space-y-8 lg:pl-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl text-ivory font-light tracking-wide">{product.name}</h1>
            <p className="font-utility text-xl text-royal-gold">₹{totalPrice}</p>
          </div>

          <div className="h-[1px] bg-royal-gold/15" />

          <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-utility uppercase tracking-widest text-warm-beige/50">
              <span>Select Size (0 to 8)</span>
              <button
                onClick={() => setIsSizeModalOpen(true)}
                className="text-royal-gold hover:underline cursor-pointer"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSelectedSize(s.size)}
                  className={`py-2 text-xs font-utility rounded-sm border transition-all ${
                    selectedSize === s.size
                      ? 'border-royal-gold bg-royal-gold text-temple-black font-semibold'
                      : 'border-royal-gold/15 text-warm-beige hover:border-royal-gold/45'
                  }`}
                >
                  Size {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* Swatch Color Selector */}
          <div className="space-y-3">
            <span className="font-utility text-xs text-warm-beige/50 uppercase tracking-widest block">Select Fabric Color</span>
            <div className="flex gap-4">
              {product.swatches.map((swatch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSwatch(swatch)}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all text-xs font-utility ${
                    selectedSwatch?.hex === swatch.hex
                      ? 'border-royal-gold text-royal-gold bg-royal-gold/5'
                      : 'border-royal-gold/15 text-warm-beige/80 hover:border-royal-gold/45'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-royal-gold/25"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  {swatch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Complete the Seva Bundle Add-on */}
          <div className="border border-royal-gold/20 bg-deep-charcoal/50 p-4 flex gap-4 items-center justify-between rounded-sm">
            <div className="flex gap-3 items-center">
              <input
                type="checkbox"
                id="bundleCheck"
                checked={isBundleChecked}
                onChange={(e) => setIsBundleChecked(e.target.checked)}
                className="w-4 h-4 rounded border-royal-gold/30 bg-temple-black text-royal-gold focus:ring-royal-gold"
              />
              <label htmlFor="bundleCheck" className="cursor-pointer space-y-0.5">
                <span className="block font-display text-sm text-ivory">Complete the Seva Bundle</span>
                <span className="block font-body text-[11px] text-warm-beige/60">
                  Add matching crown (Mukut) + micro jewelry set (+ ₹600)
                </span>
              </label>
            </div>
            <span className="font-utility text-xs text-royal-gold">+ ₹600</span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={addState === 'adding'}
            className="w-full font-utility text-xs tracking-widest uppercase py-4 bg-royal-gold hover:bg-cream text-temple-black font-semibold transition-all shadow-md rounded-sm"
          >
            {addState === 'default' && 'Add to Altar (Cart)'}
            {addState === 'adding' && 'Preparing Offerings...'}
            {addState === 'added' && 'Added ✓'}
          </button>
        </div>
      </div>

      {/* --- SIZE GUIDE MODAL --- */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-temple-black/80" onClick={() => setIsSizeModalOpen(false)} />
          <div className="bg-deep-charcoal border border-royal-gold/30 p-8 max-w-md w-full relative z-10 space-y-6 rounded-sm shadow-2xl">
            <button
              onClick={() => setIsSizeModalOpen(false)}
              className="absolute top-4 right-4 text-warm-beige hover:text-royal-gold"
            >
              <Icons.Close size={20} />
            </button>
            <h3 className="font-display text-2xl text-royal-gold text-center border-b border-royal-gold/15 pb-4">
              Laddu Gopal Size Guide
            </h3>
            
            <div className="space-y-3 font-body text-xs text-warm-beige/80">
              <p>Laddu Gopal deities are measured by height. Select the appropriate poshak size:</p>
              <table className="w-full text-left border-collapse mt-2">
                <thead>
                  <tr className="border-b border-royal-gold/15 font-utility text-[9px] uppercase tracking-wider text-royal-gold">
                    <th className="py-2">Poshak Size</th>
                    <th className="py-2">Deity Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-gold/5 font-utility">
                  <tr><td className="py-1.5">Size 0</td><td className="py-1.5">2 - 3 inches</td></tr>
                  <tr><td className="py-1.5">Size 1</td><td className="py-1.5">3 - 4 inches</td></tr>
                  <tr><td className="py-1.5">Size 2</td><td className="py-1.5">4 - 5 inches</td></tr>
                  <tr><td className="py-1.5">Size 3</td><td className="py-1.5">5 - 6 inches</td></tr>
                  <tr><td className="py-1.5">Size 4</td><td className="py-1.5">6 - 7 inches</td></tr>
                  <tr><td className="py-1.5">Size 5</td><td className="py-1.5">7 - 8 inches</td></tr>
                  <tr><td className="py-1.5">Size 6</td><td className="py-1.5">8 - 10 inches</td></tr>
                  <tr><td className="py-1.5">Size 7</td><td className="py-1.5">10 - 12 inches</td></tr>
                  <tr><td className="py-1.5">Size 8</td><td className="py-1.5">12 - 15 inches</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- PARCHMENT REVIEWS SECTION --- */}
      <div className="mt-24 space-y-8">
        <div className="text-center">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Devotee Testimonials</span>
          <h2 className="font-display text-3xl text-ivory mt-2">Handwritten Blessings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Review 1 */}
          <div className="parchment-card p-8 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
            {/* Golden Wax Seal */}
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r from-brass to-royal-gold shadow-md flex items-center justify-center text-[10px] text-temple-black font-utility font-bold border border-[#8B6914]/20 select-none">
              PD
            </div>
            
            <p className="font-serif-head text-sm italic text-deep-charcoal/90 leading-relaxed pr-8">
              "The fabric of the Lotus Shringaar Poshak is so soft. You can truly feel that the weavers crafted this with pure devotion in their hearts. Fits my size 2 Ladoo Gopal perfectly."
            </p>
            
            <div className="mt-6 flex justify-between items-center text-[11px] font-utility tracking-wider text-temple-bronze border-t border-[#8B6914]/15 pt-4">
              <span>Srimati Radharani Dasi, Vrindavan</span>
              <span>June 2026</span>
            </div>
          </div>

          {/* Review 2 */}
          <div className="parchment-card p-8 min-h-[160px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r from-brass to-royal-gold shadow-md flex items-center justify-center text-[10px] text-temple-black font-utility font-bold border border-[#8B6914]/20 select-none">
              PD
            </div>

            <p className="font-serif-head text-sm italic text-deep-charcoal/90 leading-relaxed pr-8">
              "I offered the Morpankh Velvet Poshak for Rajbhog darshan today. The royal blue velvet shines beautifully in the evening oil lamps. Highly recommended."
            </p>

            <div className="mt-6 flex justify-between items-center text-[11px] font-utility tracking-wider text-temple-bronze border-t border-[#8B6914]/15 pt-4">
              <span>Aarav Sharma, New Delhi</span>
              <span>May 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
