'use client';

import React from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';
import Link from 'next/link';

export default function AdminDashboardOverviewPage() {
  return (
    <AdminRBACGuard
      allowedRoles={[
        'super_admin',
        'admin',
        'manager',
        'product_manager',
        'inventory_manager',
        'customer_support',
        'content_manager',
        'marketing_manager',
        'finance_manager',
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Executive Overview</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Real-time status of Prem Dhaga operations & fulfillment</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB Sync
            </span>
          </div>
        </div>

        {/* Quick Module Shortcut Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/orders" className="p-4 rounded-xl bg-[#12141D] border border-slate-800 hover:border-amber-500/40 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Phase 1</span>
              <span className="text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 group-hover:text-amber-300">Orders & Fulfillment</h3>
            <p className="text-xs text-slate-400 mt-1">Status pipeline, courier tracking, refunds & invoices</p>
          </Link>

          <Link href="/admin/products" className="p-4 rounded-xl bg-[#12141D] border border-slate-800 hover:border-amber-500/40 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Phase 2</span>
              <span className="text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 group-hover:text-amber-300">Products & Inventory</h3>
            <p className="text-xs text-slate-400 mt-1">Catalog CRUD, bulk CSV import, stock alerts</p>
          </Link>

          <Link href="/admin/customers" className="p-4 rounded-xl bg-[#12141D] border border-slate-800 hover:border-amber-500/40 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Phase 3</span>
              <span className="text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 group-hover:text-amber-300">Customers & Discounts</h3>
            <p className="text-xs text-slate-400 mt-1">CRM profiles, coupons builder & collections</p>
          </Link>

          <Link href="/admin/cms" className="p-4 rounded-xl bg-[#12141D] border border-slate-800 hover:border-amber-500/40 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Phase 4</span>
              <span className="text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 group-hover:text-amber-300">CMS & Media Library</h3>
            <p className="text-xs text-slate-400 mt-1">Homepage copy editor & Cloudinary media asset library</p>
          </Link>
        </div>

        {/* Phase 0 Skeleton Placeholder State */}
        <div className="p-8 rounded-xl bg-[#12141D]/60 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400 font-mono text-xl">
            P0
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Phase 0 Skeleton Ready</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 font-mono">
            Design tokens, RBAC permissions guard, topbar command palette, and sidebar navigation skeleton are configured. Proceeding to Phase 1: Orders Module.
          </p>
        </div>
      </div>
    </AdminRBACGuard>
  );
}
