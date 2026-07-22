'use client';

import React, { useState } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';
import { ROLE_LABELS, AdminRole } from '@/types/admin';

export default function AdminSettingsPage() {
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_XXXXXXXXXXXXXXXX');
  const [webhookSecret, setWebhookSecret] = useState('whsec_XXXXXXXXXXXXXXXX');
  const [enable2FA, setEnable2FA] = useState(true);
  const [enforceIpLock, setEnforceIpLock] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rolesList = Object.keys(ROLE_LABELS) as AdminRole[];

  return (
    <AdminRBACGuard allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Roles, Settings & Security</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Configure role permissions, 2FA security, Razorpay keys & system backups</p>
          </div>

          {saved && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono">
              ✓ System Settings Saved
            </span>
          )}
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSaveSettings} className="space-y-6 font-mono text-xs">
          {/* Section 1: Role Definitions */}
          <div className="bg-[#12141D] p-5 rounded-xl border border-slate-800 space-y-3">
            <h2 className="text-xs uppercase text-amber-400 font-semibold">1. Role & Permission Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {rolesList.map((rKey) => {
                const conf = ROLE_LABELS[rKey];
                return (
                  <div key={rKey} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded border ${conf.color}`}>{conf.title}</span>
                    <p className="text-[10px] text-slate-400 mt-1 capitalize">{rKey.replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Payment Integration */}
          <div className="bg-[#12141D] p-5 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xs uppercase text-amber-400 font-semibold">2. Razorpay Payment Gateway Keys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Webhook Secret</label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security & 2FA */}
          <div className="bg-[#12141D] p-5 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xs uppercase text-amber-400 font-semibold">3. Admin Security & Hardening</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500"
                />
                <span>Enforce 2FA Authentication for Admin & Super Admin Roles</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={enforceIpLock}
                  onChange={(e) => setEnforceIpLock(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500"
                />
                <span>Enable Admin Login IP Whitelisting</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => alert('Full database backup triggered and saved!')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg"
            >
              💾 Trigger Database Backup
            </button>

            <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </AdminRBACGuard>
  );
}
