'use client';

import React, { useState } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'abandoned' | 'seo'>('campaigns');
  
  // Campaign State
  const [campaignTitle, setCampaignTitle] = useState('Janmashtami Grand Launch Announcement');
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [segment, setSegment] = useState('all');
  const [messageBody, setMessageBody] = useState(
    'Pranam! Explore our Janmashtami Grand Edition silk poshaks handcrafted in Vrindavan. Use code RADHE108 for 15% off.'
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  // Abandoned Carts
  const abandonedCarts = [
    { id: 'ac_1', name: 'Meera Patel', email: 'meera.p@example.com', phone: '+91 98111 22334', itemsCount: 2, total: 3450, abandonedAt: '2 hours ago' },
    { id: 'ac_2', name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '+91 97222 33445', itemsCount: 1, total: 2800, abandonedAt: '5 hours ago' },
  ];

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'marketing_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Marketing & Campaigns Hub</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Broadcast Email/WhatsApp campaigns, abandoned cart recovery & SEO manager</p>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'campaigns' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('abandoned')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'abandoned' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              Abandoned Carts ({abandonedCarts.length})
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'seo' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              SEO Manager
            </button>
          </div>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6 font-mono text-xs">
            {sentSuccess && (
              <div className="p-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-center">
                ✓ Campaign broadcast queued successfully for transmission!
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="bg-[#12141D] p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-xs uppercase text-amber-400 font-semibold">Create Broadcast Campaign</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Channel Provider</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="email">Resend Transactional Email</option>
                    <option value="whatsapp">WhatsApp Business (WATI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Target Audience Segment</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="all">All Registered Devotees</option>
                    <option value="vip">VIP Customers Only</option>
                    <option value="abandoned">Cart Abandoners (Last 7 Days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Broadcast Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg">
                  🚀 Send Broadcast Campaign
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Abandoned Carts */}
        {activeTab === 'abandoned' && (
          <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cart Value</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Abandoned At</th>
                  <th className="py-3 px-4 text-right">Recovery Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {abandonedCarts.map((cart) => (
                  <tr key={cart.id}>
                    <td className="py-3 px-4 font-sans font-medium">{cart.name} ({cart.email})</td>
                    <td className="py-3 px-4 text-amber-300 font-semibold">₹{cart.total}</td>
                    <td className="py-3 px-4">{cart.itemsCount} items</td>
                    <td className="py-3 px-4 text-slate-400">{cart.abandonedAt}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Sent WhatsApp recovery link to ${cart.phone}`)}
                        className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded text-xs"
                      >
                        Send WhatsApp Recovery
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: SEO Manager */}
        {activeTab === 'seo' && (
          <div className="bg-[#12141D] p-5 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
            <h2 className="text-xs uppercase text-amber-400 font-semibold">Global Storefront SEO Settings</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Default Meta Title</label>
                <input
                  type="text"
                  defaultValue="Prem Dhaga | Threads Woven With Pure Devotion — Vrindavan Poshaks"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Default Meta Description</label>
                <textarea
                  rows={2}
                  defaultValue="Prem Dhaga offers handcrafted silk & velvet poshaks for Laddu Gopal, woven with divine love in Vrindavan."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-emerald-400">✓ Dynamic XML Sitemap Auto-Generated</span>
                <button onClick={() => alert('SEO Sitemap Regenerated!')} className="px-3 py-1 bg-slate-800 text-slate-200 rounded">
                  Re-Index Sitemap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRBACGuard>
  );
}
