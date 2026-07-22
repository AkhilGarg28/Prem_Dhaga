'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';
import { useAuth } from '@/store/useAuth';

interface CouponItem {
  _id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  isFirstOrderOnly?: boolean;
  isAutoApply?: boolean;
}

export default function AdminCouponsPage() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('1000');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('500');
  const [usageLimit, setUsageLimit] = useState('200');
  const [isFirstOrderOnly, setIsFirstOrderOnly] = useState(false);
  const [isAutoApply, setIsAutoApply] = useState(false);
  const [expiryDate, setExpiryDate] = useState('2026-09-30');
  const [submitLoading, setSubmitLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCoupons();
  }, [token]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      const res = await fetch(`${apiUrl}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          expiryDate: expiryDate ? expiryDate : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCoupons([data, ...coupons]);
        setIsModalOpen(false);
        setCode('');
      } else {
        setError(data.error || 'Failed to create coupon');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiUrl}/coupons/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setCoupons(coupons.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c)));
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'marketing_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Coupons & Discount Rules</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Create promotional voucher codes, percentage/flat discounts, usage caps & auto-apply rules</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <span>+ Build New Coupon</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4 text-right">Min Purchase</th>
                  <th className="py-3 px-4 text-center">Usage Count</th>
                  <th className="py-3 px-4 text-center">Expiry</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-300">
                      {c.code}
                      {c.isFirstOrderOnly && <span className="block text-[10px] text-cyan-400 font-normal mt-0.5">1st Order Only</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 capitalize">{c.discountType}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-100">
                      {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{c.minOrderAmount}</td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {c.usageCount} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{c.expiryDate || 'Never'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] ${
                          c.isActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(c._id, c.isActive)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Coupon Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold font-serif text-slate-100">Build Promotional Coupon</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. JANMASHTAMI108"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="15 or 300"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Total Usage Limit</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isFirstOrderOnly}
                      onChange={(e) => setIsFirstOrderOnly(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500"
                    />
                    <span>First Order Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isAutoApply}
                      onChange={(e) => setIsAutoApply(e.target.checked)}
                      className="rounded border-slate-800 text-amber-500"
                    />
                    <span>Auto-Apply at Checkout</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg">
                    Publish Coupon Code
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
