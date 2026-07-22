'use client';

import React, { useState, useEffect } from 'react';
import AdminRBACGuard from '@/components/admin/AdminRBACGuard';
import Link from 'next/link';

interface OrderItem {
  product?: any;
  name: string;
  size: number;
  swatchName: string;
  swatchHex: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: string;
  couponCode?: string;
  discountAmount?: number;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  courierPartner?: string;
  trackingId?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  items: OrderItem[];
  internalNotes?: string;
  activityLog?: Array<{
    action: string;
    performedBy: string;
    details?: string;
    timestamp: string;
  }>;
}

const ORDER_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'paid', label: 'Paid', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'preparing', label: 'Preparing', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { id: 'stitching', label: 'Stitching', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { id: 'quality_check', label: 'Quality Check', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { id: 'packaging', label: 'Packaging', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  { id: 'packed', label: 'Packed', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { id: 'ready_for_pickup', label: 'Ready for Pickup', color: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { id: 'shipped', label: 'Shipped', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { id: 'in_transit', label: 'In Transit', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { id: 'refunded', label: 'Refunded', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  { id: 'returned', label: 'Returned', color: 'bg-[#8B6914]/20 text-amber-200 border-[#8B6914]/40' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Order Details Modal / Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState('');
  const [courierPartnerVal, setCourierPartnerVal] = useState('');
  const [trackingIdVal, setTrackingIdVal] = useState('');
  const [internalNoteVal, setInternalNoteVal] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('prem-dhaga-auth') ? JSON.parse(localStorage.getItem('prem-dhaga-auth')!).state.token : ''}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        // Fallback mock data if server is offline
        setOrders(getMockOrders());
      }
    } catch (err) {
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = (): Order[] => [
    {
      _id: 'ord_1',
      orderId: 'PD-1721528400-8841',
      totalAmount: 3400,
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      couponCode: 'RADHE108',
      discountAmount: 400,
      shippingDetails: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        address: '108 Vrindavan Heights, M.G. Road',
        city: 'Mathura',
        state: 'Uttar Pradesh',
        zip: '281001',
        country: 'India',
      },
      courierPartner: 'Delhivery Direct',
      trackingId: 'DEL-99214412',
      estimatedDeliveryDate: '2026-07-24T00:00:00.000Z',
      createdAt: '2026-07-20T18:30:00.000Z',
      internalNotes: 'VIP customer. Customer requested special double parchment wrapping.',
      items: [
        { name: 'Lotus Shringaar Poshak', size: 3, swatchName: 'Vrindavan Green', swatchHex: '#3B6B3B', quantity: 1, price: 1650 },
        { name: 'Nidhra Silk Night Dress', size: 3, swatchName: 'Ivory White', swatchHex: '#FAF6EF', quantity: 1, price: 1750 },
      ],
      activityLog: [
        { action: 'ORDER_PLACED', performedBy: 'System', details: 'Order placed via Razorpay checkout', timestamp: '2026-07-20T18:30:00.000Z' },
        { action: 'STATUS_CHANGE_TO_SHIPPED', performedBy: 'admin@premdhaga.com', details: 'Handed over to Delhivery courier partner', timestamp: '2026-07-20T21:15:00.000Z' },
      ],
    },
    {
      _id: 'ord_2',
      orderId: 'PD-1721512100-4102',
      totalAmount: 4500,
      paymentStatus: 'paid',
      orderStatus: 'stitching',
      shippingDetails: {
        name: 'Priya Verma',
        email: 'priya.v@example.com',
        phone: '+91 91234 56789',
        address: '42 Lotus Colony, Sector 15',
        city: 'Noida',
        state: 'Uttar Pradesh',
        zip: '201301',
        country: 'India',
      },
      createdAt: '2026-07-20T14:15:00.000Z',
      items: [
        { name: 'Swarna Janmashtami Poshak', size: 4, swatchName: 'Royal Gold', swatchHex: '#C9A84C', quantity: 1, price: 4500 },
      ],
      activityLog: [
        { action: 'ORDER_PLACED', performedBy: 'System', details: 'Payment verified via Razorpay', timestamp: '2026-07-20T14:15:00.000Z' },
      ],
    },
    {
      _id: 'ord_3',
      orderId: 'PD-1721498000-1120',
      totalAmount: 2800,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingDetails: {
        name: 'Rajesh Gupta',
        email: 'r.gupta@example.com',
        phone: '+91 99887 76655',
        address: '15 Temple Street, Near ISKCON',
        city: 'Vrindavan',
        state: 'Uttar Pradesh',
        zip: '281121',
        country: 'India',
      },
      createdAt: '2026-07-20T10:00:00.000Z',
      items: [
        { name: 'Morpankh Velvet Poshak', size: 2, swatchName: 'Peacock Blue', swatchHex: '#1B5E6E', quantity: 1, price: 2800 },
      ],
      activityLog: [],
    },
  ];

  // Filtering
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingDetails.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingDetails.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || ord.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || ord.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('prem-dhaga-auth') ? JSON.parse(localStorage.getItem('prem-dhaga-auth')!).state.token : '';
      
      if (courierPartnerVal || trackingIdVal) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${selectedOrder._id}/courier`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courierPartner: courierPartnerVal, trackingId: trackingIdVal }),
        });
      }

      if (statusUpdateVal && statusUpdateVal !== selectedOrder.orderStatus) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${selectedOrder._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: statusUpdateVal, description: `Status changed to ${statusUpdateVal}` }),
        });
      }

      // Local State Update
      const updatedList = orders.map((o) => {
        if (o._id === selectedOrder._id) {
          const updatedLogs = [...(o.activityLog || []), {
            action: `STATUS_CHANGE_TO_${statusUpdateVal.toUpperCase()}`,
            performedBy: 'admin@premdhaga.com',
            details: `Status updated to ${statusUpdateVal}`,
            timestamp: new Date().toISOString(),
          }];
          return {
            ...o,
            orderStatus: statusUpdateVal || o.orderStatus,
            courierPartner: courierPartnerVal || o.courierPartner,
            trackingId: trackingIdVal || o.trackingId,
            internalNotes: internalNoteVal,
            activityLog: updatedLogs,
          };
        }
        return o;
      });

      setOrders(updatedList);
      setSelectedOrder(null);
    } catch (err) {
      alert('Updated order locally!');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (statusId: string) => {
    const s = ORDER_STATUSES.find((item) => item.id === statusId) || { label: statusId, color: 'bg-slate-800 text-slate-300' };
    return (
      <span className={`inline-block px-2.5 py-0.5 text-xs font-mono rounded-full border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  return (
    <AdminRBACGuard allowedRoles={['super_admin', 'admin', 'manager', 'orders_manager', 'customer_support', 'finance_manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 font-serif">Orders & Fulfillment Desk</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Manage status pipeline, couriers, refunds & customer invoices
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#12141D] p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer name, email or phone..."
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
              <option value="all">All Statuses ({orders.length})</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#12141D] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0C0E16] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      Loading order records...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-amber-300">
                        {ord.orderId}
                        {ord.couponCode && (
                          <span className="block text-[10px] text-emerald-400 font-normal mt-0.5">
                            Coupon: {ord.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-sans font-medium text-slate-100">{ord.shippingDetails.name}</p>
                        <p className="text-[11px] text-slate-400">{ord.shippingDetails.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] rounded border ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : ord.paymentStatus === 'pending'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {ord.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(ord.orderStatus)}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {ord.courierPartner ? (
                          <>
                            <p className="text-slate-200">{ord.courierPartner}</p>
                            <p className="text-[10px]">{ord.trackingId || 'No Tracking ID'}</p>
                          </>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-100">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setStatusUpdateVal(ord.orderStatus);
                            setCourierPartnerVal(ord.courierPartner || '');
                            setTrackingIdVal(ord.trackingId || '');
                            setInternalNoteVal(ord.internalNotes || '');
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail & Status Update Drawer Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#12141D] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-semibold font-serif text-slate-100">
                    Order: <span className="text-amber-300 font-mono">{selectedOrder.orderId}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
                  >
                    View Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 text-slate-400 hover:text-slate-100 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Grid: Customer Info & Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <p className="text-amber-400 uppercase text-[10px] tracking-wider mb-2 font-sans font-semibold">
                    Customer Information
                  </p>
                  <p className="text-slate-100 font-medium font-sans text-sm">{selectedOrder.shippingDetails.name}</p>
                  <p className="text-slate-400">{selectedOrder.shippingDetails.email}</p>
                  <p className="text-slate-400">{selectedOrder.shippingDetails.phone}</p>
                </div>

                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <p className="text-amber-400 uppercase text-[10px] tracking-wider mb-2 font-sans font-semibold">
                    Shipping Address
                  </p>
                  <p className="text-slate-300">{selectedOrder.shippingDetails.address}</p>
                  <p className="text-slate-300">
                    {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} - {selectedOrder.shippingDetails.zip}
                  </p>
                  <p className="text-slate-400">{selectedOrder.shippingDetails.country}</p>
                </div>
              </div>

              {/* Order Line Items */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Order Line Items</h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0C0E16] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Swatch</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-sans font-medium">{item.name}</td>
                          <td className="py-2.5 px-3">Size {item.size}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.swatchHex }} />
                              {item.swatchName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status & Courier Update Controls */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">Update Status & Dispatch Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Order Status</label>
                    <select
                      value={statusUpdateVal}
                      onChange={(e) => setStatusUpdateVal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={courierPartnerVal}
                      onChange={(e) => setCourierPartnerVal(e.target.value)}
                      placeholder="e.g. Delhivery, Bluedart"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingIdVal}
                      onChange={(e) => setTrackingIdVal(e.target.value)}
                      placeholder="AWB / Tracking ID"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Internal Admin Notes</label>
                  <textarea
                    rows={2}
                    value={internalNoteVal}
                    onChange={(e) => setInternalNoteVal(e.target.value)}
                    placeholder="Private notes for team regarding this order..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Activity Log Audit Feed */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Activity Audit Log</h3>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-h-32 overflow-y-auto space-y-2 text-[11px] font-mono">
                  {selectedOrder.activityLog && selectedOrder.activityLog.length > 0 ? (
                    selectedOrder.activityLog.map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-1">
                        <span className="text-amber-300 font-medium">{log.action}</span>
                        <span className="text-slate-300">{log.details}</span>
                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-2">No activity logged yet.</p>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs font-mono rounded-lg transition-colors shadow-lg shadow-amber-500/10"
                >
                  {updating ? 'Saving Changes...' : 'Save & Update Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Overlay Modal */}
        {showInvoiceModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FAF6EF] text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-300 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#8B6914]">PREM DHAGA</h2>
                  <p className="text-xs font-serif italic text-slate-600">Devotional Fashion Atelier — Vrindavan</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">TAX INVOICE</p>
                  <p className="font-mono text-xs text-slate-600">{selectedOrder.orderId}</p>
                  <p className="font-mono text-[10px] text-slate-500">GSTIN: 09AAAAA0000A1Z5</p>
                </div>
              </div>

              <div className="grid grid-cols-2 text-xs font-mono border-b border-slate-300 pb-4">
                <div>
                  <p className="font-bold text-slate-800">Billed To:</p>
                  <p>{selectedOrder.shippingDetails.name}</p>
                  <p>{selectedOrder.shippingDetails.address}</p>
                  <p>{selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}</p>
                  <p>{selectedOrder.shippingDetails.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p>Payment Mode: Razorpay / Prepaid</p>
                  <p>Status: {selectedOrder.paymentStatus.toUpperCase()}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs font-mono border-b border-slate-300">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-700">
                    <th className="py-2">Item</th>
                    <th className="py-2">Size</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{it.name}</td>
                      <td className="py-2">Size {it.size}</td>
                      <td className="py-2 text-center">{it.quantity}</td>
                      <td className="py-2 text-right">₹{it.price}</td>
                      <td className="py-2 text-right">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end text-xs font-mono space-y-1">
                <div className="w-48 text-right space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (12% Included):</span>
                    <span>₹{Math.round(selectedOrder.totalAmount * 0.12)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-slate-400 pt-1 text-slate-900">
                    <span>Total Paid:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg hover:bg-slate-800"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-300 text-slate-800 text-xs font-mono rounded-lg hover:bg-slate-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRBACGuard>
  );
}
