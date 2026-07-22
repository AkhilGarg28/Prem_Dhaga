'use client';

import React, { useState } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
  size: string;
  format: string;
  uploadedAt: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: 'm1',
      name: 'lotus_shringaar_hero.jpg',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
      folder: 'Products',
      size: '184 KB',
      format: 'WebP (Auto)',
      uploadedAt: '2026-07-20',
    },
    {
      id: 'm2',
      name: 'morpankh_velvet_banner.jpg',
      url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
      folder: 'Banners',
      size: '240 KB',
      format: 'WebP (Auto)',
      uploadedAt: '2026-07-18',
    },
    {
      id: 'm3',
      name: 'janmashtami_edition_cover.jpg',
      url: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
      folder: 'Collections',
      size: '310 KB',
      format: 'WebP (Auto)',
      uploadedAt: '2026-07-15',
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'content_manager', 'product_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Cloudinary Media Library</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Organize media assets, automatic WebP conversion, drag-drop upload & CDN URL management
            </p>
          </div>

          <label className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 cursor-pointer">
            <span>+ Upload Media Asset</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        {/* Media Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col group">
              <div className="h-44 relative bg-slate-950 overflow-hidden flex items-center justify-center">
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-amber-300 border border-slate-700">
                  {asset.folder}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  {asset.format}
                </span>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-slate-100 font-medium truncate">{asset.name}</p>
                  <p className="text-[10px] text-slate-500">{asset.size} • Uploaded {asset.uploadedAt}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
                  >
                    {copiedId === asset.id ? '✓ Copied!' : 'Copy CDN URL'}
                  </button>
                  <button
                    onClick={() => setAssets(assets.filter((a) => a.id !== asset.id))}
                    className="text-rose-400 hover:text-rose-300 text-[11px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminRBACGuard>
  );
}
