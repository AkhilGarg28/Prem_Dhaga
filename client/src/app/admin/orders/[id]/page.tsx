'use client';

import React from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

export default function AdminOrderDetailSkeletonPage({ params }: { params: { id: string } }) {
  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'orders_manager', 'customer_support', 'finance_manager']}>
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-semibold text-slate-100 font-serif">Order Details: {params.id}</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Order timeline, items, customer address & activity logs</p>
        </div>
        <div className="p-8 rounded-xl bg-[#12141D] border border-slate-800 text-center font-mono text-sm text-slate-300">
          Order Detail Skeleton Scaffolding Active for Order ID: {params.id}
        </div>
      </div>
    </AdminRBACGuard>
  );
}
