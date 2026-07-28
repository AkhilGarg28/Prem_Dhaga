'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { Icons } from '@/components/Icons';

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please insert all required credentials: Full Name, Email, Phone Number, and Password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create your account ID. Please try again.');
      }

      login(data.token, data.user);
      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Error creating user account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-temple-black pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg relative overflow-hidden rounded-2xl border border-royal-gold/25 bg-[#120f0a] p-8 text-ivory shadow-[0_32px_90px_rgba(0,0,0,.75)]">
        <div className="absolute inset-0 temple-grain opacity-20 pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <Icons.PeacockFeather className="mx-auto text-royal-gold" size={42} />
          <h1 className="font-display text-3xl text-ivory tracking-wide">Create Devotional ID</h1>
          <p className="font-utility text-[10px] uppercase tracking-[0.2em] text-warm-beige/50">
            Insert all credentials below to register your account ID
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-md bg-lotus-pink/10 border border-lotus-pink/30 text-lotus-pink text-xs font-utility text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Radha Krishna Das"
              className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>

            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Password (min 6 chars) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>

            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-royal-gold hover:bg-cream text-temple-black font-utility text-xs uppercase tracking-widest font-bold rounded-md transition-all shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Devotional ID...' : 'Create Account ID'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-royal-gold/15 text-center space-y-3">
          <p className="font-body text-xs text-warm-beige/50">
            Already have an ID?
          </p>
          <Link
            href="/login"
            className="inline-block font-utility text-xs text-royal-gold uppercase tracking-widest border border-royal-gold/30 hover:border-royal-gold px-5 py-2 rounded-md transition-all"
          >
            Sign In with Credentials →
          </Link>
        </div>
      </div>
    </div>
  );
}
