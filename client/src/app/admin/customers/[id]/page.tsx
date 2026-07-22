'use client';

import React from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

export default function AdminCustomerDetailSkeletonPage({ params }: { params: { id: string } }) {
  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'customer_support', 'marketing_manager']}>
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-semibold text-slate-100 font-serif">Customer Profile: {params.id}</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Order history, saved addresses, wishlist & customer notes</p>
        </div>
        <div className="p-8 rounded-xl bg-[#12141D] border border-slate-800 text-center font-mono text-sm text-slate-300">
          Customer Profile Skeleton Scaffolding Active for ID: {params.id}
        </div>
      </div>
    </AdminRBACGuard>
  );
}
