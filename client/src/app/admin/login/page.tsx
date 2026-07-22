'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { AdminRole, ROLE_LABELS } from '@/types/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@premdhaga.com');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('super_admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Enforce admin role permission check
        const userRole = data.user?.role;
        const isAdminRole = ['super_admin', 'admin', 'product_manager', 'inventory_manager', 'orders_manager', 'customer_support', 'content_manager', 'marketing_manager', 'finance_manager'].includes(userRole);

        if (!isAdminRole) {
          setError('Access Denied: This account does not possess administrative privileges.');
          return;
        }

        login(data.token, data.user);
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid email or password. Access denied.');
      }
    } catch (err: any) {
      setError('Connection Error: Unable to reach authentication server. Please check your network or server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center p-4 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="w-full max-w-md bg-[#12141D] border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-2xl mx-auto shadow-lg shadow-amber-500/5">
            P
          </div>
          <h1 className="text-2xl font-semibold font-serif text-slate-100">Prem Dhaga Admin</h1>
          <p className="text-xs text-slate-400 font-mono">Sign in to business management portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@premdhaga.com"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all font-mono"
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-mono">Protected area. All actions are logged and audited.</p>
        </div>
      </div>
    </div>
  );
}
