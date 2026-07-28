'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { Icons } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form Fields
  const [identifier, setIdentifier] = useState(''); // Email or Phone for Login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const resetForm = () => {
    setIdentifier('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim() || !password) {
      setError('Please provide your Email Address or Phone Number and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in. Please check your credentials.');
      }

      login(data.token, data.user);
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations for all credentials
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
      setSuccess('Your Devotional ID has been created successfully! Logging you in...');
      setTimeout(() => {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error creating account ID. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-temple-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-royal-gold/25 bg-[#120f0a] p-6 sm:p-8 text-ivory shadow-[0_32px_90px_rgba(0,0,0,.75)]">
        <div className="absolute inset-0 temple-grain opacity-20 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => { resetForm(); onClose(); }}
          className="absolute top-4 right-4 text-warm-beige/50 hover:text-royal-gold transition-colors p-1"
          aria-label="Close authentication modal"
        >
          <Icons.Close size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <Icons.PeacockFeather className="mx-auto text-royal-gold" size={36} />
          <h2 className="font-display text-2xl text-ivory tracking-wide">
            {mode === 'login' ? 'Welcome Back' : 'Create Devotional ID'}
          </h2>
          <p className="font-utility text-[10px] uppercase tracking-[0.2em] text-warm-beige/50">
            {mode === 'login'
              ? 'Enter your credentials to access your Prem Dhaga portal'
              : 'Insert all credentials to register your personal ID'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-royal-gold/15 mb-6">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 pb-3 font-utility text-xs uppercase tracking-widest transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-royal-gold text-royal-gold font-semibold'
                : 'border-transparent text-warm-beige/40 hover:text-warm-beige/70'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 pb-3 font-utility text-xs uppercase tracking-widest transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-royal-gold text-royal-gold font-semibold'
                : 'border-transparent text-warm-beige/40 hover:text-warm-beige/70'
            }`}
          >
            Register ID
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-lotus-pink/10 border border-lotus-pink/30 text-lotus-pink text-xs font-utility">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-md bg-vrindavan-green/10 border border-vrindavan-green/30 text-vrindavan-green text-xs font-utility">
            {success}
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Email Address or Phone Number *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your.email@domain.com or +919876543210"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>

            <div>
              <label className="block font-utility text-[10px] uppercase tracking-widest text-warm-beige/60 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2.5 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-royal-gold hover:bg-cream text-temple-black font-utility text-xs uppercase tracking-widest font-bold rounded-md transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In with Credentials'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="font-utility text-[10px] text-warm-beige/40 hover:text-royal-gold uppercase tracking-wider transition-colors"
              >
                Don't have an ID? Insert credentials to Register →
              </button>
            </div>
          </form>
        ) : (
          /* --- REGISTER FORM --- */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2 text-xs text-ivory outline-none rounded-md transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2 text-xs text-ivory outline-none rounded-md transition-colors"
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
                  className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2 text-xs text-ivory outline-none rounded-md transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2 text-xs text-ivory outline-none rounded-md transition-colors"
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
                  className="w-full bg-deep-charcoal border border-royal-gold/20 focus:border-royal-gold px-3.5 py-2 text-xs text-ivory outline-none rounded-md transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-royal-gold hover:bg-cream text-temple-black font-utility text-xs uppercase tracking-widest font-bold rounded-md transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Devotional ID...' : 'Create Account ID'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="font-utility text-[10px] text-warm-beige/40 hover:text-royal-gold uppercase tracking-wider transition-colors"
              >
                Already registered? Sign In with credentials →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
