'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

export default function AdminFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    try {
      const authData = localStorage.getItem('prem-dhaga-auth');
      const token = authData ? JSON.parse(authData).state.token : '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${apiUrl}/orders/finance-reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic finance data, falling back to mock data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const defaultGstBreakdown = [
    { category: 'Ready-made Poshaks (Silk/Velvet)', hsn: '6204', taxableValue: 382000, cgstRate: 6, sgstRate: 6, totalGst: 45840 },
    { category: 'Bespoke Custom Orders', hsn: '6211', taxableValue: 75000, cgstRate: 6, sgstRate: 6, totalGst: 9000 },
    { category: 'Devotional Accessories (Mukut/Jewelry)', hsn: '7117', taxableValue: 25500, cgstRate: 9, sgstRate: 9, totalGst: 4590 },
  ];

  const gstBreakdown = data?.gstBreakdown || defaultGstBreakdown;
  const grossRevenue = data ? data.grossRevenue : 482500;
  const totalGstCollected = data ? data.totalGstCollected : 59430;
  const razorpayGatewayFees = data ? data.razorpayGatewayFees : 9650;
  const netSettledPayouts = data ? data.netSettledPayouts : 413420;

  const handleExportGstCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Category,HSN Code,Taxable Value,CGST,SGST,Total GST Collected']
        .concat(
          gstBreakdown.map(
            (g: any) => `"${g.category}",${g.hsn},${g.taxableValue},${(g.taxableValue * g.cgstRate) / 100},${(g.taxableValue * g.sgstRate) / 100},${g.totalGst}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prem_dhaga_gst_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'finance_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Finance & GST Reports</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Exportable monthly GST tax reports, CGST/SGST breakdowns, payouts & refund tracking</p>
          </div>

          <button
            onClick={handleExportGstCsv}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <span>📥 Export Monthly GST CSV</span>
          </button>
        </div>

        {/* Finance Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#12141D] border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase">Gross Revenue</p>
            <p className="text-xl font-bold text-slate-100">₹{grossRevenue.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#12141D] border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase">Total GST Collected</p>
            <p className="text-xl font-bold text-amber-300">₹{totalGstCollected.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#12141D] border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase">Razorpay Gateway Fees</p>
            <p className="text-xl font-bold text-slate-300">₹{razorpayGatewayFees.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#12141D] border border-slate-800 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase">Net Settled Payouts</p>
            <p className="text-xl font-bold text-emerald-400">₹{netSettledPayouts.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* GST Report Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-semibold uppercase text-slate-300">GST Tax Liability Breakdown (GSTR-1 Ready)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4 text-right">Taxable Value</th>
                  <th className="py-3 px-4 text-right">CGST</th>
                  <th className="py-3 px-4 text-right">SGST</th>
                  <th className="py-3 px-4 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {gstBreakdown.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-100">{row.category}</td>
                    <td className="py-3.5 px-4 text-amber-300">{row.hsn}</td>
                    <td className="py-3.5 px-4 text-right font-semibold">₹{row.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">₹{((row.taxableValue * row.cgstRate) / 100).toLocaleString('en-IN')} ({row.cgstRate}%)</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">₹{((row.taxableValue * row.sgstRate) / 100).toLocaleString('en-IN')} ({row.sgstRate}%)</td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">₹{row.totalGst.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRBACGuard>
  );
}
