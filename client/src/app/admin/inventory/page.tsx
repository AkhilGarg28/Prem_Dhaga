'use client';

import React, { useState } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  lastRestocked: string;
}

interface StockHistoryLog {
  id: string;
  sku: string;
  productName: string;
  quantityChange: number;
  reason: 'Restock' | 'Defect' | 'Audit Correction' | 'Order Reserved' | 'Return Restocked';
  performedBy: string;
  timestamp: string;
}

export default function AdminInventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: '1', sku: 'PD-LTS-001', name: 'Lotus Shringaar Poshak', category: 'Summer Silk', currentStock: 15, lowStockThreshold: 5, lastRestocked: '2026-07-15' },
    { id: '2', sku: 'PD-MRP-002', name: 'Morpankh Velvet Poshak', category: 'Rajbhog Royal', currentStock: 3, lowStockThreshold: 5, lastRestocked: '2026-07-10' }, // Low stock!
    { id: '3', sku: 'PD-SWR-003', name: 'Swarna Janmashtami Poshak', category: 'Janmashtami Special', currentStock: 2, lowStockThreshold: 5, lastRestocked: '2026-07-08' }, // Low stock!
    { id: '4', sku: 'PD-NDH-004', name: 'Nidhra Silk Night Dress', category: 'Shayan Veshbhusha', currentStock: 25, lowStockThreshold: 5, lastRestocked: '2026-07-18' },
  ]);

  const [stockHistory, setStockHistory] = useState<StockHistoryLog[]>([
    { id: 'h1', sku: 'PD-LTS-001', productName: 'Lotus Shringaar Poshak', quantityChange: +10, reason: 'Restock', performedBy: 'inventory_manager@premdhaga.com', timestamp: '2026-07-15T10:30:00.000Z' },
    { id: 'h2', sku: 'PD-MRP-002', productName: 'Morpankh Velvet Poshak', quantityChange: -1, reason: 'Order Reserved', performedBy: 'System', timestamp: '2026-07-20T14:15:00.000Z' },
  ]);

  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('5');
  const [adjustReason, setAdjustReason] = useState<'Restock' | 'Defect' | 'Audit Correction' | 'Order Reserved' | 'Return Restocked'>('Restock');

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qty = Number(adjustQty);
    const updatedStock = selectedItem.currentStock + qty;

    setStockItems(stockItems.map((item) => (item.id === selectedItem.id ? { ...item, currentStock: updatedStock } : item)));

    const newLog: StockHistoryLog = {
      id: `h_${Date.now()}`,
      sku: selectedItem.sku,
      productName: selectedItem.name,
      quantityChange: qty,
      reason: adjustReason,
      performedBy: 'inventory_manager@premdhaga.com',
      timestamp: new Date().toISOString(),
    };

    setStockHistory([newLog, ...stockHistory]);
    setSelectedItem(null);
  };

  const lowStockCount = stockItems.filter((i) => i.currentStock <= i.lowStockThreshold).length;

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'product_manager', 'inventory_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Inventory Dashboard</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Live stock levels, low-stock threshold alerts & inventory history logs</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg border font-mono text-xs ${lowStockCount > 0 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
              ⚠️ {lowStockCount} Low Stock Alerts
            </span>
          </div>
        </div>

        {/* Low Stock Warning Alert Panel */}
        {lowStockCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-amber-200">Stock Reorder Alert</p>
                <p className="text-[11px] text-amber-400/80">
                  {lowStockCount} items have fallen below the minimum safety threshold (≤ 5 units). Reorder from Vrindavan artisans recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stock Levels Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">Stock Levels Matrix</h2>
            <span className="text-[11px] font-mono text-slate-400">{stockItems.length} Products Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Safety Limit</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Last Restocked</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {stockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-amber-300 font-semibold">{item.sku}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-100">{item.name}</td>
                    <td className="py-3 px-4 text-slate-400">{item.category}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{item.lowStockThreshold} units</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                          item.currentStock <= item.lowStockThreshold
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">{item.lastRestocked}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock History Audit Log Feed */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">Inventory Movement History Log</h2>

          <div className="border border-slate-800/80 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3 text-center">Adjustment</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stockHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-100 font-medium">{h.productName}</span> ({h.sku})
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span className={h.quantityChange > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {h.quantityChange > 0 ? `+${h.quantityChange}` : h.quantityChange}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{h.reason}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">{h.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Adjust Stock Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold font-serif text-slate-100">
                  Adjust Stock: <span className="text-amber-300 font-mono">{selectedItem.sku}</span>
                </h3>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-100">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-mono">
                <div>
                  <p className="text-slate-300 font-sans font-medium mb-1">{selectedItem.name}</p>
                  <p className="text-slate-500">Current Stock: {selectedItem.currentStock} units</p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Quantity Adjustment (+/-)</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="e.g. +10 or -2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="Restock">Restock from Artisan</option>
                    <option value="Defect">Defect / Damaged Fabric</option>
                    <option value="Audit Correction">Audit Correction</option>
                    <option value="Return Restocked">Customer Return Restocked</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-semibold rounded-lg">
                    Save Inventory Log
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
