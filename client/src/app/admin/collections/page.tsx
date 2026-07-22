'use client';

import React, { useState } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  isActive: boolean;
  productCount: number;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([
    {
      _id: 'col_1',
      title: 'Summer Silk Collection',
      slug: 'summer-silk',
      description: 'Lightweight, breathable pure silk poshaks for warm Vrindavan summers.',
      coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
      isActive: true,
      productCount: 12,
    },
    {
      _id: 'col_2',
      title: 'Janmashtami Grand Edition',
      slug: 'janmashtami-grand-edition',
      description: "Exquisite heavily embroidered royal attire for Kanha's appearance day.",
      coverImage: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
      isActive: true,
      productCount: 8,
    },
    {
      _id: 'col_3',
      title: 'Rajbhog Royal Collection',
      slug: 'rajbhog-royal',
      description: 'Grand attire in deep shades decorated with detailed Zardozi work.',
      coverImage: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
      isActive: true,
      productCount: 15,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const newCol: CollectionItem = {
      _id: `col_${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
      isActive: true,
      productCount: 0,
    };
    setCollections([...collections, newCol]);
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setCollections(collections.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'product_manager', 'content_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Collection Manager</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Manage seasonal collections, banners, landing copy & SEO tags</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <span>+ Create Collection</span>
          </button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col._id} className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col group">
              <div className="h-40 relative overflow-hidden bg-slate-950">
                <img
                  src={col.coverImage}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      col.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {col.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-100">{col.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2">{col.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 font-mono text-xs">
                  <span className="text-amber-400 text-[11px]">{col.productCount} Products</span>
                  <button
                    onClick={() => handleToggleActive(col._id)}
                    className="text-slate-400 hover:text-slate-200 underline text-[11px]"
                  >
                    {col.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold font-serif text-slate-100">New Collection</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Radhashtami Divine Silk"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Collection narrative..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Cloudinary image URL"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg">
                    Create Collection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRBACGuard>
  );
}
