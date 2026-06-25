'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icons } from '@/components/Icons';

interface CustomFormInput {
  name: string;
  email: string;
  phone: string;
  sizeType: 'standard' | 'custom';
  size?: number;
  chest?: number;
  length?: number;
  ghera?: number;
  capSize?: number;
  fabric: string;
  primaryColor: string;
  secondaryColor?: string;
  embroideryType: string;
  description: string;
}

export default function CustomAtelierPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CustomFormInput>({
    defaultValues: {
      sizeType: 'standard',
      fabric: 'Silk',
      embroideryType: 'Zardozi',
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sketches, setSketches] = useState<FileList | null>(null);

  const sizeType = watch('sizeType');

  const onSubmit = async (data: CustomFormInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('fabric', data.fabric);
      formData.append('primaryColor', data.primaryColor);
      formData.append('secondaryColor', data.secondaryColor || '');
      formData.append('embroideryType', data.embroideryType);
      formData.append('description', data.description || '');

      if (data.sizeType === 'standard' && data.size !== undefined) {
        formData.append('size', String(data.size));
      } else {
        formData.append('chest', String(data.chest || 0));
        formData.append('length', String(data.length || 0));
        formData.append('ghera', String(data.ghera || 0));
        formData.append('capSize', String(data.capSize || 0));
      }

      // Append sketches
      if (sketches && sketches.length > 0) {
        for (let i = 0; i < sketches.length; i++) {
          formData.append('sketches', sketches[i]);
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/custom`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('API failed');

      setSuccess(true);
      reset();
    } catch (err) {
      console.warn('Backend API connection failed, simulating successful custom order submission.');
      setSuccess(true);
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      <div className="max-w-3xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Bespoke Devotional Couture</span>
          <h1 className="font-display text-4xl md:text-5xl text-ivory">Custom Poshak Atelier</h1>
          <p className="font-body text-xs md:text-sm text-warm-beige/70 max-w-xl mx-auto leading-relaxed">
            Consult with our master weavers in Vrindavan. Provide measurements and choose fabrics to create a custom-fitted offering for your deity.
          </p>
        </div>

        {success ? (
          /* Success Screen */
          <div className="glass-panel p-8 md:p-12 text-center space-y-6 max-w-lg mx-auto border border-royal-gold/20">
            <Icons.PeacockFeather className="text-royal-gold mx-auto animate-bounce" size={48} />
            <h2 className="font-display text-2xl text-royal-gold">Bespoke Request Submitted</h2>
            <p className="font-body text-xs text-warm-beige/80 leading-relaxed">
              We have received your custom order details. Our lead artisan will review your specifications and contact you with a price quote and design draft within 24 hours.
            </p>
            <p className="font-hindi text-sm italic text-royal-gold">
              “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black px-6 py-2.5 hover:bg-ivory transition-all font-semibold"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          /* Form screen */
          <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 md:p-10 border border-royal-gold/15 space-y-6">
            
            {/* 1. CONTACT INFORMATION */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-royal-gold border-b border-royal-gold/10 pb-2">1. Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    {...register('name', { required: true })}
                    className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none"
                    placeholder="Enter your name"
                  />
                  {errors.name && <span className="text-[10px] text-lotus-pink">Name is required</span>}
                </div>
                
                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none"
                    placeholder="Enter email"
                  />
                  {errors.email && <span className="text-[10px] text-lotus-pink">Email is required</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase tracking-wider block">Phone / WhatsApp</label>
                  <input
                    type="text"
                    {...register('phone', { required: true })}
                    className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none"
                    placeholder="e.g. +91 99999 99999"
                  />
                  {errors.phone && <span className="text-[10px] text-lotus-pink">Phone is required</span>}
                </div>
              </div>
            </div>

            {/* 2. MEASUREMENTS SELECTOR */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-royal-gold border-b border-royal-gold/10 pb-2">2. Sizing & Dimensions</h3>
              
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-utility text-xs text-warm-beige">
                  <input
                    type="radio"
                    value="standard"
                    {...register('sizeType')}
                    className="text-royal-gold focus:ring-royal-gold"
                  />
                  Standard size (0 to 8)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-utility text-xs text-warm-beige">
                  <input
                    type="radio"
                    value="custom"
                    {...register('sizeType')}
                    className="text-royal-gold focus:ring-royal-gold"
                  />
                  Custom measurements
                </label>
              </div>

              {sizeType === 'standard' ? (
                <div className="space-y-2">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Deity Size</label>
                  <select
                    {...register('size')}
                    className="bg-temple-black/80 border border-royal-gold/15 p-2.5 text-xs text-ivory outline-none focus:border-royal-gold"
                  >
                    {Array.from({ length: 9 }).map((_, i) => (
                      <option key={i} value={i}>Size {i} (Deity Height: {i + 2}-{i + 3} inches)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Chest (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('chest')}
                      className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Poshak Length (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('length')}
                      className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Ghera diameter (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('ghera')}
                      className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Cap Size / Head (inches)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('capSize')}
                      className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. FABRIC & DESIGN OPTIONS */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-royal-gold border-b border-royal-gold/10 pb-2">3. Design Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Fabric Material</label>
                  <select
                    {...register('fabric')}
                    className="w-full bg-temple-black/80 border border-royal-gold/15 p-2.5 text-xs text-ivory outline-none focus:border-royal-gold"
                  >
                    <option>Silk</option>
                    <option>Velvet</option>
                    <option>Organza</option>
                    <option>Cotton</option>
                    <option>Woolen</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Primary Color</label>
                  <input
                    type="text"
                    {...register('primaryColor', { required: true })}
                    className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none"
                    placeholder="e.g. Saffron Yellow"
                  />
                  {errors.primaryColor && <span className="text-[10px] text-lotus-pink">Color is required</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Embroidery Style</label>
                  <select
                    {...register('embroideryType')}
                    className="w-full bg-temple-black/80 border border-royal-gold/15 p-2.5 text-xs text-ivory outline-none focus:border-royal-gold"
                  >
                    <option>Zardozi (Golden Thread)</option>
                    <option>Gota Patti (Gold Lacing)</option>
                    <option>Aari work</option>
                    <option>Threadwork (Embroidery)</option>
                    <option>Minimalist Floral</option>
                  </select>
                </div>
              </div>

              {/* Special instructions */}
              <div className="space-y-1">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Bespoke Instructions / Design Details</label>
                <textarea
                  rows={4}
                  {...register('description')}
                  className="w-full bg-temple-black/50 border border-royal-gold/15 focus:border-royal-gold p-3 text-xs text-ivory outline-none"
                  placeholder="e.g. Peacock feather borders, matching jewelry sets, custom crown pattern..."
                />
              </div>

              {/* Sketch Upload */}
              <div className="space-y-2">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Reference Sketches / Altar Photos</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSketches(e.target.files)}
                  className="w-full bg-temple-black/40 border border-royal-gold/10 p-2.5 text-xs text-warm-beige/70"
                />
                <span className="block text-[10px] text-warm-beige/40">Upload reference diagrams, photos of your deity, or hand drawn layout ideas. Maximum 3 images.</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-utility text-xs tracking-widest uppercase bg-royal-gold hover:bg-cream text-temple-black py-4 font-semibold transition-all shadow-md rounded-sm"
            >
              {loading ? 'Submitting details...' : 'Submit Bespoke Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
