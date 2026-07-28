'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';
import { useAuth } from '@/store/useAuth';

interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  isFeatured?: boolean;
  isActive: boolean;
  productCount?: number;
  itemCount?: number;
}

export default function AdminCollectionsPage() {
  const { token } = useAuth();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/products/collections?all=true`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err: any) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCollection(null);
    setTitle('');
    setDescription('');
    setCoverImage('');
    setIsFeatured(false);
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (col: CollectionItem) => {
    setEditingCollection(col);
    setTitle(col.title);
    setDescription(col.description || '');
    setCoverImage(col.coverImage || '');
    setIsFeatured(Boolean(col.isFeatured));
    setIsActive(Boolean(col.isActive));
    setError('');
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('files', files[0]);

      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.message || 'Image upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitLoading(true);

    try {
      const payload = {
        title,
        description,
        coverImage,
        bannerImage: coverImage,
        isFeatured,
        isActive,
      };

      let res;
      if (editingCollection) {
        res = await fetch(`${apiUrl}/products/collections/${editingCollection._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiUrl}/products/collections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        if (editingCollection) {
          setSuccessMsg(`Collection "${data.title}" updated.`);
        } else {
          setSuccessMsg(`Collection "${data.title}" created!`);
        }
        setIsModalOpen(false);
        fetchCollections();
      } else {
        setError(data.error || 'Failed to save collection');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (col: CollectionItem) => {
    try {
      const res = await fetch(`${apiUrl}/products/collections/${col._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !col.isActive }),
      });

      if (res.ok) {
        setCollections(collections.map((c) => (c._id === col._id ? { ...c, isActive: !c.isActive } : c)));
      }
    } catch (err) {
      console.error('Error toggling collection status:', err);
    }
  };

  const handleDeleteCollection = async (col: CollectionItem) => {
    if (!confirm(`Are you sure you want to delete collection "${col.title}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/products/collections/${col._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCollections(collections.filter((c) => c._id !== col._id));
        setSuccessMsg(`Collection "${col.title}" deleted.`);
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'product_manager', 'content_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Collection Manager</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Manage seasonal collections, banners, landing copy & product categories</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <span>+ Create Collection</span>
          </button>
        </div>

        {/* Toast Notices */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex justify-between items-center">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400">✕</button>
          </div>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs">
              Loading collections from database...
            </div>
          ) : collections.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs">
              No collections found in database. Click "+ Create Collection" to add one.
            </div>
          ) : (
            collections.map((col) => (
              <div key={col._id} className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col group">
                <div className="h-40 relative overflow-hidden bg-slate-950">
                  <img
                    src={col.coverImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600'}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {col.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Featured
                      </span>
                    )}
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
                    <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2">{col.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 font-mono text-xs">
                    <span className="text-amber-400 text-[11px]">{col.productCount ?? col.itemCount ?? 0} Products</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(col)}
                        className="text-amber-300 hover:underline text-[11px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(col)}
                        className="text-slate-400 hover:text-slate-200 underline text-[11px]"
                      >
                        {col.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col)}
                        className="text-rose-400 hover:underline text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold font-serif text-slate-100">
                  {editingCollection ? `Edit Collection: ${editingCollection.title}` : 'Create New Collection'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSaveCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Silk Collection"
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

                {/* Direct Image Upload */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Collection Image</label>
                  {coverImage && (
                    <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-2 right-2 bg-slate-950/80 text-rose-300 px-2 py-0.5 rounded text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <label className="block border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors">
                    <span className="text-amber-400 font-semibold block text-xs">
                      {uploadingImage ? 'Uploading Image...' : '📤 Click to Upload Cover Image'}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-1">Supports JPG, PNG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500"
                    />
                    <span>Featured Collection</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500"
                    />
                    <span>Active Status</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitLoading} className="px-5 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg disabled:opacity-50">
                    {submitLoading ? 'Saving...' : editingCollection ? 'Save Changes' : 'Create Collection'}
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
