'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { Icons } from '@/components/Icons';
import { findRegisteredUser, saveRegisteredUser } from '@/utils/userRegistry';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterBtn, setShowRegisterBtn] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple requests while loading

    setError('');
    setShowRegisterBtn(false);

    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId || !password) {
      setError('Please insert your Email Address or Phone Number and Password.');
      return;
    }

    const isEmail = cleanId.includes('@');
    if (isEmail && !/^\S+@\S+\.\S+$/.test(cleanId)) {
      setError('Please enter a valid email address.');
      return;
    }

    const registeredLocalUser = findRegisteredUser(cleanId);

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 || data.code === 'ACCOUNT_NOT_FOUND') {
          // If server returns 404, check local registered registry before throwing non-existent account error
          if (registeredLocalUser) {
            if (registeredLocalUser.password && registeredLocalUser.password !== password) {
              setError('Incorrect password. Please try again.');
              setShowRegisterBtn(false);
              return;
            }
            saveRegisteredUser({ ...registeredLocalUser, password });
            login(`token_${Date.now()}`, {
              id: registeredLocalUser.id,
              name: registeredLocalUser.name,
              email: registeredLocalUser.email,
              phone: registeredLocalUser.phone,
              role: registeredLocalUser.role,
              profilePhoto: registeredLocalUser.profilePhoto,
              language: registeredLocalUser.language || 'English',
              notificationsEnabled: registeredLocalUser.notificationsEnabled ?? true,
              preferredPaymentMethod: registeredLocalUser.preferredPaymentMethod || 'Razorpay',
            });
            router.push('/account');
            return;
          }

          setError('No account found with this email. Please register first.');
          setShowRegisterBtn(true);
        } else if (res.status === 401 || data.code === 'INCORRECT_PASSWORD') {
          setError('Incorrect password. Please try again.');
          setShowRegisterBtn(false);
        } else {
          setError(data.error || 'Sign in failed. Please check your credentials.');
        }
        return;
      }

      // Backend login success -> sync into registry
      saveRegisteredUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        password,
        role: data.user.role,
        profilePhoto: data.user.profilePhoto,
        language: data.user.language,
        notificationsEnabled: data.user.notificationsEnabled,
      });

      login(data.token, data.user);
      router.push('/account');
    } catch (err: any) {
      // Backend server unreachable / CORS / offline fallback
      if (registeredLocalUser) {
        if (registeredLocalUser.password && registeredLocalUser.password !== password) {
          setError('Incorrect password. Please try again.');
          setShowRegisterBtn(false);
          return;
        }

        saveRegisteredUser({ ...registeredLocalUser, password });
        login(`token_${Date.now()}`, {
          id: registeredLocalUser.id,
          name: registeredLocalUser.name,
          email: registeredLocalUser.email,
          phone: registeredLocalUser.phone,
          role: registeredLocalUser.role,
          profilePhoto: registeredLocalUser.profilePhoto,
          language: registeredLocalUser.language || 'English',
          notificationsEnabled: registeredLocalUser.notificationsEnabled ?? true,
          preferredPaymentMethod: registeredLocalUser.preferredPaymentMethod || 'Razorpay',
        });
        router.push('/account');
        return;
      }

      setError('No account found with this email. Please register first.');
      setShowRegisterBtn(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-temple-black pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md relative overflow-hidden rounded-2xl border border-royal-gold/25 bg-[#120f0a] p-8 text-ivory shadow-[0_32px_90px_rgba(0,0,0,.75)]">
        <div className="absolute inset-0 temple-grain opacity-20 pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <Icons.PeacockFeather className="mx-auto text-royal-gold" size={42} />
          <h1 className="font-display text-3xl text-ivory tracking-wide">Sign In to Prem Dhaga</h1>
          <p className="font-utility text-[10px] uppercase tracking-[0.2em] text-warm-beige/50">
            Enter your credentials to manage orders, wishlist & account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-lotus-pink/10 border border-lotus-pink/30 text-lotus-pink text-xs font-utility text-center space-y-3">
            <p>{error}</p>
            {showRegisterBtn && (
              <Link
                href="/register"
                className="block w-full py-2.5 bg-royal-gold/20 hover:bg-royal-gold text-royal-gold hover:text-temple-black border border-royal-gold/40 font-utility text-xs uppercase tracking-widest font-bold rounded-md transition-all shadow-sm"
              >
                Register Now →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1.5">
              Email Address or Phone Number *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="email@example.com or +919876543210"
              className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-3 text-xs text-ivory outline-none rounded-md transition-colors"
            />
          </div>

          <div>
            <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1.5">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-4 py-3 text-xs text-ivory outline-none rounded-md transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-royal-gold hover:bg-cream text-temple-black font-utility text-xs uppercase tracking-widest font-bold rounded-md transition-all shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In with Credentials'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-royal-gold/15 text-center space-y-3">
          <p className="font-body text-xs text-warm-beige/50">
            Don't have an ID yet?
          </p>
          <Link
            href="/register"
            className="inline-block font-utility text-xs text-royal-gold uppercase tracking-widest border border-royal-gold/30 hover:border-royal-gold px-5 py-2 rounded-md transition-all"
          >
            Create Your Devotional ID →
          </Link>
        </div>
      </div>
    </div>
  );
}
