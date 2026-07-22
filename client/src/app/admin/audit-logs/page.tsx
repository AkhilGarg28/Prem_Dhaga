'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';

interface AuditLogRecord {
  _id: string;
  action: string;
  details: string;
  ipAddress: string;
  performedBy: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([
    {
      _id: 'alg_1',
      action: 'STATUS_CHANGE_TO_SHIPPED',
      details: 'Order PD-1721528400-8841 moved to Shipped via Delhivery',
      ipAddress: '103.24.18.92',
      performedBy: 'admin@premdhaga.com',
      timestamp: '2026-07-20T21:15:00.000Z',
    },
    {
      _id: 'alg_2',
      action: 'PRODUCT_CREATED',
      details: 'Created new product Lotus Shringaar Poshak (SKU: PD-LTS-001)',
      ipAddress: '103.24.18.92',
      performedBy: 'product_manager@premdhaga.com',
      timestamp: '2026-07-20T19:40:00.000Z',
    },
    {
      _id: 'alg_3',
      action: 'COUPON_CREATED',
      details: 'Created discount code RADHE108 (15% Off)',
      ipAddress: '110.22.45.10',
      performedBy: 'marketing_manager@premdhaga.com',
      timestamp: '2026-07-20T16:20:00.000Z',
    },
    {
      _id: 'alg_4',
      action: 'ADMIN_LOGIN_SUCCESS',
      details: 'Successful 2FA admin authentication',
      ipAddress: '103.24.18.92',
      performedBy: 'super_admin@premdhaga.com',
      timestamp: '2026-07-20T12:00:00.000Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ipAddress.includes(searchQuery)
  );

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin']}>
      <div className="space-y-6 font-mono text-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Security Audit Logs</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Immutably recorded administrative actions, IP logs, and system mutation trails</p>
          </div>
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded font-mono text-xs">
            🔒 Append-Only Log Ledger
          </span>
        </div>

        {/* Search Toolbar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit logs by action, admin email, IP address, or details..."
            className="w-full pl-9 pr-3 py-2 bg-[#12141D] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Admin User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-amber-300">{log.action}</td>
                    <td className="py-3 px-4 text-slate-200">{log.performedBy}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-slate-300">{log.details}</td>
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
