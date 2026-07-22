'use client';

import React from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

export default function AdminAnalyticsPage() {
  const metrics = [
    { label: "Today's Revenue", value: '₹18,400', change: '+14.2%', isPositive: true },
    { label: 'Monthly Revenue', value: '₹4,82,500', change: '+22.8%', isPositive: true },
    { label: 'Avg Order Value (AOV)', value: '₹2,450', change: '+5.1%', isPositive: true },
    { label: 'Conversion Rate', value: '3.82%', change: '-0.4%', isPositive: false },
  ];

  const funnel = [
    { stage: 'Storefront Visitors', count: 12450, percentage: '100%' },
    { stage: 'Product Relic Views', count: 4820, percentage: '38.7%' },
    { stage: 'Added to Seva Cart', count: 1120, percentage: '9.0%' },
    { stage: 'Checkout Initiated', count: 640, percentage: '5.1%' },
    { stage: 'Successful Orders', count: 475, percentage: '3.8%' },
  ];

  const trafficSources = [
    { source: 'Instagram / Social', visitors: '5,840', share: '46.9%', color: 'bg-purple-500' },
    { source: 'Google Search / Organic', visitors: '3,920', share: '31.5%', color: 'bg-blue-500' },
    { source: 'WhatsApp Direct', visitors: '1,840', share: '14.8%', color: 'bg-emerald-500' },
    { source: 'Direct / Bookmark', visitors: '850', share: '6.8%', color: 'bg-amber-500' },
  ];

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'finance_manager', 'marketing_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Analytics & Conversion Funnel</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Live customer acquisition metrics, traffic attribution & checkout conversion funnel</p>
          </div>
        </div>

        {/* Top Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {metrics.map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#12141D] border border-slate-800 space-y-2">
              <p className="text-[10px] uppercase text-slate-400 tracking-wider">{m.label}</p>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-100">{m.value}</span>
                <span className={`text-xs ${m.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{m.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Funnel & Traffic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-[#12141D] border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
            <h2 className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Conversion Funnel Drop-off</h2>
            <div className="space-y-3">
              {funnel.map((fn, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{fn.stage}</span>
                    <span>{fn.count.toLocaleString()} ({fn.percentage})</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/80 rounded-full" style={{ width: fn.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[#12141D] border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
            <h2 className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Traffic Attribution Channels</h2>
            <div className="space-y-3">
              {trafficSources.map((tf, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${tf.color}`} />
                    <span className="text-slate-200">{tf.source}</span>
                  </div>
                  <span className="text-slate-400">{tf.visitors} ({tf.share})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminRBACGuard>
  );
}
