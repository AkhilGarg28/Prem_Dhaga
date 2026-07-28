'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

interface SizePrice {
  size: number;
  price: number;
}

interface Swatch {
  name: string;
  hex: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  gstRate?: number;
  images: string[];
  collectionId: string;
  collectionName?: string;
  sizes: SizePrice[];
  swatches: Swatch[];
  stock: number;
  weight?: number;
  material?: string;
  fabric?: string;
  subCategory?: string;
  festival?: string;
  occasion?: string;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isRecommended: boolean;
  status: 'active' | 'draft' | 'archived';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Modal / Form Editor State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [gstRate, setGstRate] = useState('12');
  const [stock, setStock] = useState('10');
  const [weight, setWeight] = useState('200');
  const [material, setMaterial] = useState('Silk');
  const [fabric, setFabric] = useState('Raw Silk');
  const [festival, setFestival] = useState('Janmashtami');
  const [occasion, setOccasion] = useState('Rajbhog');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [collections, setCollections] = useState<{ _id: string; title: string }[]>([]);
  const [collectionId, setCollectionId] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${apiUrl}/products/collections?all=true`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
        if (data.length > 0) setCollectionId(data[0]._id);
      }
    } catch (err) {
      console.warn('Error fetching collections for dropdown:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/products?status=all`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`PD-${Math.floor(100 + Math.random() * 900)}`);
    setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setDescription('');
    setBasePrice('1200');
    setDiscountPrice('');
    setGstRate('12');
    setStock('15');
    setWeight('200');
    setMaterial('Silk');
    setFabric('Raw Silk');
    setFestival('Janmashtami');
    setOccasion('Rajbhog');
    setStatus('active');
    setIsFeatured(false);
    setIsTrending(false);
    setImages([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setDescription(prod.description);
    setBasePrice(prod.basePrice.toString());
    setDiscountPrice(prod.discountPrice ? prod.discountPrice.toString() : '');
    setGstRate((prod.gstRate || 12).toString());
    setStock(prod.stock.toString());
    setWeight((prod.weight || 200).toString());
    setMaterial(prod.material || 'Silk');
    setFabric(prod.fabric || 'Raw Silk');
    setFestival(prod.festival || 'Janmashtami');
    setOccasion(prod.occasion || 'Rajbhog');
    setStatus(prod.status);
    setIsFeatured(prod.isFeatured);
    setIsTrending(prod.isTrending);
    setCollectionId(typeof prod.collectionId === 'object' ? (prod.collectionId as any)._id : prod.collectionId || (collections[0]?._id || ''));
    setImages(prod.images || []);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        setImages((prev) => [...prev, ...data.urls]);
      } else {
        setErrorMsg(data.error || 'Failed to upload images');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([selected, ...rest]);
  };

  const handleGenerateAiDescription = () => {
    if (!name) return alert('Please enter a product name first.');
    setAiGenerating(true);
    setTimeout(() => {
      setDescription(
        `Woven with divine devotion in the heart of Vrindavan, the ${name} is crafted from premium ${fabric || material}. Adorned with hand-carved golden Zardozi borders and sacred motifs, this attire brings royal elegance to Laddu Gopal's daily shringar.`
      );
      setAiGenerating(false);
    }, 600);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('prem-dhaga-auth')
      ? JSON.parse(localStorage.getItem('prem-dhaga-auth')!).state.token
      : '';

    const productPayload = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku,
      barcode,
      description,
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      gstRate: Number(gstRate),
      stock: Number(stock),
      weight: Number(weight),
      material,
      fabric,
      festival,
      occasion,
      collectionId: collectionId || (collections[0]?._id || undefined),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600'],
      status,
      isFeatured,
      isTrending,
      tags: [material.toLowerCase(), festival.toLowerCase()],
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`${apiUrl}/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(productPayload),
        });
      } else {
        res = await fetch(`${apiUrl}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(productPayload),
        });
      }

      const saved = await res.json();
      if (res.ok) {
        setSuccessMsg(editingProduct ? `Product "${saved.name}" updated!` : `Product "${saved.name}" published!`);
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setErrorMsg(saved.error || 'Failed to save product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to backend API');
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Are you sure you want to delete product "${prod.name}"?`)) return;
    const token = localStorage.getItem('prem-dhaga-auth')
      ? JSON.parse(localStorage.getItem('prem-dhaga-auth')!).state.token
      : '';

    try {
      const res = await fetch(`${apiUrl}/products/${prod._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== prod._id));
        setSuccessMsg(`Product "${prod.name}" deleted successfully.`);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['SKU,Name,Base Price,Stock,Status,GST Rate']
        .concat(products.map((p) => `${p.sku || ''},"${p.name}",${p.basePrice},${p.stock},${p.status},${p.gstRate || 12}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prem_dhaga_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.stock <= 5) ||
      (stockFilter === 'instock' && p.stock > 5) ||
      (stockFilter === 'outofstock' && p.stock === 0);

    return matchesSearch && matchesStatus && matchesStock;
  });

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'product_manager', 'inventory_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Products & Catalog</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Manage catalog items, pricing, size variants, swatches & bulk CSV</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
            >
              <span>+ Add New Product</span>
            </button>
          </div>
        </div>

        {/* Toast Notices */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex justify-between items-center">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400">✕</button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#12141D] p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU, or barcode..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="instock">In Stock (&gt; 5)</option>
              <option value="outofstock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C0E16] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Category / Fabric</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 text-center">GST</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      Loading products catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      No products match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150'}
                            alt={prod.name}
                            className="w-9 h-9 object-cover rounded-lg border border-slate-700 bg-slate-900"
                          />
                          <div>
                            <p className="font-sans font-medium text-slate-100">{prod.name}</p>
                            <p className="text-[10px] text-slate-400">{prod.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <p className="text-amber-300">{prod.sku || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500">{prod.barcode || '-'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <p className="text-slate-200">
                          {typeof prod.collectionId === 'object' ? (prod.collectionId as any)?.title : prod.collectionName || 'General'}
                        </p>
                        <p className="text-[10px]">{prod.fabric || prod.material}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-100">
                        ₹{prod.basePrice}
                        {prod.discountPrice && (
                          <span className="block text-[10px] text-emerald-400 font-normal">
                            Discount: ₹{prod.discountPrice}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">{prod.gstRate || 12}%</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] rounded border ${
                            prod.stock === 0
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : prod.stock <= 5
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] capitalize rounded border ${
                            prod.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : prod.status === 'draft'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal Editor */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-xl font-semibold font-serif text-slate-100">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100 font-bold">
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Swarna Morpankh Poshak"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Assigned Collection</label>
                    <select
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-amber-300 font-bold cursor-pointer"
                    >
                      {collections.map((col) => (
                        <option key={col._id} value={col._id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. PD-MRP-002"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Barcode</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 890123456789"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Description with AI Assistant */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-slate-400 uppercase">Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={aiGenerating}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
                    >
                      ✨ {aiGenerating ? 'Generating Description...' : 'AI Description Helper'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Handcrafted devotional poshak description..."
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Pricing & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">GST Rate (%)</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="5">5% GST</option>
                      <option value="12">12% GST (Standard Apparel)</option>
                      <option value="18">18% GST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Attributes: Fabric, Weight, Festival */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Fabric Type</label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Weight (grams)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* DIRECT MULTI-IMAGE FILE UPLOADER & DRAG-N-DROP GALLERY */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-[10px] text-slate-400 uppercase">Product Image Gallery</label>

                  {/* Thumbnail Preview Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-24">
                          <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold text-[8px]">
                              PRIMARY
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded"
                              >
                                Make Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <label className="block border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-5 text-center cursor-pointer bg-slate-950/50 transition-colors">
                    <span className="text-amber-400 font-semibold block text-xs">
                      {uploadingImages ? 'Uploading Product Images...' : '📤 Click or Drag & Drop Product Images'}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-1">Select one or multiple images from your computer</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Checkbox Flags */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <span>Trending Product</span>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg">
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
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
