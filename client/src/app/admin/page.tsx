'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/Icons';

interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
}

interface CustomOrder {
  _id: string;
  customOrderId: string;
  clientDetails: { name: string; email: string; phone: string };
  poshakDetails: { fabric: string; primaryColor: string; embroideryType: string; description: string };
  status: string;
  quotedPrice: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  stock: number;
}

export default function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'custom' | 'catalog'>('analytics');

  // Stats / Lists
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  
  // Forms states
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [catalogColls, setCatalogColls] = useState<any[]>([]);
  const [selectedColId, setSelectedColId] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Handle Mock Bypass for demonstration
  const handleMockBypass = () => {
    setIsLoggedIn(true);
    setAdminToken('mock-admin-token-108');
  };

  // Fetch admin dashboard details
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchAdminData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // 1. Fetch dashboard metrics
        const statsRes = await fetch(`${apiUrl}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const statsData = await statsRes.json();
        setStats(statsData);

        // 2. Fetch orders list
        const ordersRes = await fetch(`${apiUrl}/orders`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

        // 3. Fetch custom orders
        const customRes = await fetch(`${apiUrl}/custom`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const customData = await customRes.json();
        setCustomOrders(customData);

        // 4. Fetch catalog products
        const productsRes = await fetch(`${apiUrl}/products`);
        const productsData = await productsRes.json();
        setCatalog(productsData);

        // 5. Fetch collections for selection
        const collRes = await fetch(`${apiUrl}/products/collections`);
        const collData = await collRes.json();
        setCatalogColls(collData);
      } catch (err) {
        console.warn('Backend server offline. Utilizing mockup datasets for administrator panel.');
        
        // Setup mock analytics stats
        setStats({
          summary: {
            totalRevenue: 28400,
            paidOrdersCount: 12,
            totalOrdersCount: 15,
            averageOrderValue: 2366.67,
            customOrdersCount: 4,
            pendingCustomOrdersCount: 2,
            lowStockCount: 2,
          },
          topProducts: [
            { name: 'Lotus Shringaar Poshak', quantity: 8, revenue: 9600 },
            { name: 'Swarna Janmashtami Poshak', quantity: 3, revenue: 13500 },
            { name: 'Nidhra Silk Night Dress', quantity: 4, revenue: 3800 },
          ],
          chartData: [
            { name: 'Jan', revenue: 4500 },
            { name: 'Feb', revenue: 7200 },
            { name: 'Mar', revenue: 5100 },
            { name: 'Apr', revenue: 9800 },
            { name: 'May', revenue: 12400 },
            { name: 'Jun', revenue: 28400 },
          ],
        });

        // Setup mock orders
        setOrders([
          {
            _id: 'ord_1',
            orderId: 'PD-172948234-108',
            totalAmount: 2100,
            paymentStatus: 'paid',
            orderStatus: 'processing',
            shippingDetails: { name: 'Devotee Lalita', email: 'lalita@gopal.com', phone: '+91 9876', address: 'Vrindavan' },
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'ord_2',
            orderId: 'PD-172948512-109',
            totalAmount: 4500,
            paymentStatus: 'paid',
            orderStatus: 'shipped',
            shippingDetails: { name: 'Aarav Sharma', email: 'aarav@delhi.com', phone: '+91 8888', address: 'New Delhi' },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]);

        // Setup mock custom orders
        setCustomOrders([
          {
            _id: 'cust_1',
            customOrderId: 'PD-CUST-108',
            clientDetails: { name: 'Srimad Dasa', email: 'srimad@gopal.com', phone: '+91 7777' },
            poshakDetails: { fabric: 'Velvet', primaryColor: 'Deep Blue', embroideryType: 'Zardozi', description: 'Peacock feather embroidery on border, matching Mukut.' },
            status: 'submitted',
            quotedPrice: 0,
          },
          {
            _id: 'cust_2',
            customOrderId: 'PD-CUST-109',
            clientDetails: { name: 'Gauri Dasi', email: 'gauri@vrindavan.com', phone: '+91 6666' },
            poshakDetails: { fabric: 'Organza', primaryColor: 'Lotus Pink', embroideryType: 'Gota Patti', description: 'Lightweight spring attire for Phool Bangla.' },
            status: 'quoted',
            quotedPrice: 3200,
          },
        ]);

        // Setup mock products catalog
        setCatalog([
          { _id: 'p_1', name: 'Lotus Shringaar Poshak', slug: 'lotus-shringaar-poshak', basePrice: 1200, stock: 15 },
          { _id: 'p_2', name: 'Morpankh Velvet Poshak', slug: 'morpankh-velvet-poshak', basePrice: 2800, stock: 8 },
          { _id: 'p_3', name: 'Swarna Janmashtami Poshak', slug: 'swarna-janmashtami-poshak', basePrice: 4500, stock: 5 },
          { _id: 'p_4', name: 'Nidhra Silk Night Dress', slug: 'nidhra-silk-night-dress', basePrice: 950, stock: 20 },
        ]);
        
        setCatalogColls([
          { _id: 'c_1', title: 'Summer Silk' },
          { _id: 'c_2', title: 'Janmashtami Special' },
        ]);
      }
    };

    fetchAdminData();
  }, [isLoggedIn, adminToken]);

  // Actual Admin Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (data.user.role === 'admin' || data.user.role === 'manager') {
        setAdminToken(data.token);
        setIsLoggedIn(true);
      } else {
        throw new Error('Access forbidden: insufficient permissions');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Server connection failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Update Standard Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
        );
      }
    } catch (err) {
      // Simulate state update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
      );
    }
  };

  // Update Custom Order Quote Price and Status
  const handleUpdateCustomOrder = async (orderId: string, status: string, price: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/custom/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status, quotedPrice: price }),
      });
      if (res.ok) {
        setCustomOrders((prev) =>
          prev.map((c) => (c._id === orderId ? { ...c, status, quotedPrice: price } : c))
        );
      }
    } catch (err) {
      // Simulate state update locally
      setCustomOrders((prev) =>
        prev.map((c) => (c._id === orderId ? { ...c, status, quotedPrice: price } : c))
      );
    }
  };

  // Create Product in Catalog
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !selectedColId) return;
    setCatalogLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: newProdName,
          basePrice: Number(newProdPrice),
          description: newProdDesc,
          collectionId: selectedColId,
        }),
      });

      if (!res.ok) throw new Error('API failed');
      const newProd = await res.json();
      setCatalog((prev) => [...prev, newProd]);
      
      // Reset forms
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
    } catch (err) {
      // Local mock fallback adding to list
      const mockProd = {
        _id: `prod_mock_${Date.now()}`,
        name: newProdName,
        slug: newProdName.toLowerCase().replace(/ /g, '-'),
        basePrice: Number(newProdPrice),
        stock: 10,
      };
      setCatalog((prev) => [...prev, mockProd]);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
    } finally {
      setCatalogLoading(false);
    }
  };

  // Delete product in catalog
  const handleDeleteProduct = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setCatalog((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      setCatalog((prev) => prev.filter((p) => p._id !== id));
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setAdminToken('');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      /* LOGIN ROUTE RENDERED */
      <div className="min-h-screen bg-temple-black flex justify-center items-center px-6">
        <div className="glass-panel p-8 w-full max-w-md border border-royal-gold/15 space-y-6 rounded-sm shadow-2xl relative">
          <div className="text-center space-y-2">
            <Icons.PeacockFeather className="text-royal-gold mx-auto" size={36} />
            <h1 className="font-display text-2xl text-ivory tracking-wider">Atelier Registry</h1>
            <p className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-widest">
              Admin & Manager Portal
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-wider block">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-temple-black/80 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                placeholder="admin@premdhaga.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-wider block">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-temple-black/80 border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && <p className="text-[10px] text-lotus-pink text-center">{authError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full font-utility text-xs tracking-widest uppercase bg-royal-gold hover:bg-cream text-temple-black py-3 font-semibold transition-all shadow-md rounded-sm"
            >
              {authLoading ? 'Verifying credentials...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="h-[1px] bg-royal-gold/10" />

          {/* Quick Demo Bypass */}
          <button
            onClick={handleMockBypass}
            className="w-full font-utility text-xs tracking-widest uppercase border border-royal-gold/20 hover:border-royal-gold text-royal-gold py-2.5 transition-all rounded-sm font-semibold"
          >
            Bypass with Demo Admin (Offline test)
          </button>
        </div>
      </div>
    );
  }

  return (
    /* LOGGED IN DASHBOARD RENDERED */
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-12 flex flex-col justify-start">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-royal-gold/15 pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl text-ivory">Admin Control Center</h1>
          <p className="font-utility text-[9px] text-royal-gold tracking-widest uppercase mt-1">
            Prem Dhaga Devotional Atelier Dashboard
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="font-utility text-[10px] tracking-wider uppercase border border-lotus-pink/30 hover:border-lotus-pink px-4 py-1.5 text-lotus-pink transition-all"
        >
          Logout Portal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-royal-gold/10 pb-3 mb-8">
        {(['analytics', 'orders', 'custom', 'catalog'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-utility text-xs tracking-widest uppercase pb-1.5 px-1 border-b-2 transition-all ${
              activeTab === tab
                ? 'border-royal-gold text-royal-gold font-semibold'
                : 'border-transparent text-warm-beige/40 hover:text-royal-gold/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB 1: ANALYTICS OVERVIEW --- */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-8">
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
              <span className="font-utility text-[9px] text-warm-beige/50 uppercase block">Total Sales</span>
              <span className="font-display text-2xl text-royal-gold mt-1 block">₹{stats.summary.totalRevenue}</span>
            </div>
            <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
              <span className="font-utility text-[9px] text-warm-beige/50 uppercase block">Fulfillments</span>
              <span className="font-display text-2xl text-royal-gold mt-1 block">{stats.summary.paidOrdersCount} orders</span>
            </div>
            <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
              <span className="font-utility text-[9px] text-warm-beige/50 uppercase block">Average Order (AOV)</span>
              <span className="font-display text-2xl text-royal-gold mt-1 block">₹{stats.summary.averageOrderValue}</span>
            </div>
            <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
              <span className="font-utility text-[9px] text-warm-beige/50 uppercase block">Bespoke Custom Requests</span>
              <span className="font-display text-2xl text-royal-gold mt-1 block">{stats.summary.customOrdersCount}</span>
            </div>
          </div>

          {/* Chart & Top products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart using styled CSS heights */}
            <div className="lg:col-span-2 glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-6">
              <h3 className="font-display text-lg text-ivory">Monthly Sales Curve</h3>
              <div className="h-48 flex items-end justify-between pt-6 border-b border-royal-gold/10 pl-2 pr-2">
                {stats.chartData.map((data: any, idx: number) => {
                  const maxRevenue = Math.max(...stats.chartData.map((d: any) => d.revenue));
                  const percentageHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 80 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 w-1/6">
                      <span className="font-utility text-[9px] text-royal-gold">₹{data.revenue}</span>
                      <div
                        className="w-8 bg-gradient-to-t from-brass to-royal-gold rounded-t-sm transition-all duration-1000"
                        style={{ height: `${Math.max(4, percentageHeight)}%` }}
                      />
                      <span className="font-utility text-[9px] text-warm-beige/40 mt-1">{data.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top products list */}
            <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
              <h3 className="font-display text-lg text-ivory">Top Dress Offerings</h3>
              <div className="space-y-4">
                {stats.topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-display text-sm text-ivory">{p.name}</h4>
                      <span className="font-utility text-[9px] text-warm-beige/40">Sold Qty: {p.quantity}</span>
                    </div>
                    <span className="font-utility text-royal-gold">₹{p.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ORDERS MANAGER --- */}
      {activeTab === 'orders' && (
        <div className="glass-panel border border-royal-gold/15 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-royal-gold/15 font-utility text-[9px] uppercase tracking-wider text-royal-gold bg-temple-black/80">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-royal-gold/5 font-utility text-xs text-warm-beige/80">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-deep-charcoal/30">
                    <td className="p-4 font-semibold text-royal-gold">{o.orderId}</td>
                    <td className="p-4">
                      <div className="font-display text-sm text-ivory">{o.shippingDetails.name}</div>
                      <div className="text-[10px] text-warm-beige/40 mt-0.5">{o.shippingDetails.email}</div>
                    </td>
                    <td className="p-4">₹{o.totalAmount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] border capitalize ${
                        o.paymentStatus === 'paid' ? 'border-vrindavan-green/20 text-vrindavan-green bg-vrindavan-green/5' : 'border-lotus-pink/20 text-lotus-pink bg-lotus-pink/5'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        className="bg-temple-black border border-royal-gold/15 p-1 text-[10px] text-ivory focus:border-royal-gold outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">In Production</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: CUSTOM ATELIER INBOX --- */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {customOrders.map((c) => (
            <div key={c._id} className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
              <div className="flex justify-between items-start border-b border-royal-gold/10 pb-3">
                <div>
                  <span className="font-utility text-[9px] text-royal-gold uppercase tracking-wider block">Custom Tailor ID</span>
                  <span className="font-utility text-sm text-ivory font-semibold">{c.customOrderId}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <span className="font-utility text-[9px] text-warm-beige/40 uppercase block">Quote Price</span>
                    <span className="font-utility text-xs text-royal-gold font-bold">₹{c.quotedPrice || 'Not Quoted'}</span>
                  </div>
                  <span className={`font-utility text-xs px-2 py-0.5 rounded-sm border capitalize ${
                    c.status === 'submitted' ? 'border-lotus-pink/20 text-lotus-pink bg-lotus-pink/5' : 'border-royal-gold/20 text-royal-gold bg-royal-gold/5'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Form client and poshak specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body text-xs text-warm-beige/80">
                <div className="space-y-1">
                  <h4 className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-widest">Devotee details</h4>
                  <p><strong className="text-ivory">Name:</strong> {c.clientDetails.name}</p>
                  <p><strong className="text-ivory">Phone:</strong> {c.clientDetails.phone}</p>
                  <p><strong className="text-ivory">Email:</strong> {c.clientDetails.email}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-widest">Fabric selections</h4>
                  <p><strong className="text-ivory">Fabric:</strong> {c.poshakDetails.fabric}</p>
                  <p><strong className="text-ivory">Primary Color:</strong> {c.poshakDetails.primaryColor}</p>
                  <p><strong className="text-ivory">Embroidery Type:</strong> {c.poshakDetails.embroideryType}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-widest">Artisan Instructions</h4>
                  <p className="italic pr-4">"{c.poshakDetails.description || 'No special descriptions provided.'}"</p>
                </div>
              </div>

              {/* Action tools: Update quote and status */}
              <div className="border-t border-royal-gold/10 pt-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <span className="font-utility text-[10px] text-warm-beige/50 uppercase">Update Quote:</span>
                  <input
                    type="number"
                    defaultValue={c.quotedPrice}
                    onBlur={(e) => handleUpdateCustomOrder(c._id, c.status, Number(e.target.value))}
                    className="w-24 bg-temple-black border border-royal-gold/15 focus:border-royal-gold p-1 text-xs text-ivory outline-none rounded-sm"
                    placeholder="Enter Price"
                  />
                </div>

                <div className="flex gap-3 items-center">
                  <span className="font-utility text-[10px] text-warm-beige/50 uppercase">Status:</span>
                  <select
                    value={c.status}
                    onChange={(e) => handleUpdateCustomOrder(c._id, e.target.value, c.quotedPrice)}
                    className="bg-temple-black border border-royal-gold/15 p-1 text-xs text-ivory focus:border-royal-gold outline-none"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="quoted">Quoted</option>
                    <option value="paid">Paid</option>
                    <option value="in_progress">In Production</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 4: PRODUCT CATALOG EDITOR --- */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Add product form */}
          <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
            <h3 className="font-display text-lg text-royal-gold border-b border-royal-gold/10 pb-2">Add New Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Product Name</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-temple-black border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                  placeholder="e.g. Peacock Shringaar Poshak"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Base Price (Size 0)</label>
                <input
                  type="number"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-temple-black border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                  placeholder="1200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Collection Category</label>
                <select
                  value={selectedColId}
                  onChange={(e) => setSelectedColId(e.target.value)}
                  className="w-full bg-temple-black border border-royal-gold/15 p-2 text-xs text-ivory outline-none focus:border-royal-gold"
                  required
                >
                  <option value="">Select Collection</option>
                  {catalogColls.map((col) => (
                    <option key={col._id} value={col._id}>{col.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-utility text-[10px] text-warm-beige/60 uppercase block">Description</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-temple-black border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                  placeholder="Detailed description..."
                />
              </div>

              <button
                type="submit"
                disabled={catalogLoading}
                className="w-full font-utility text-xs tracking-widest uppercase bg-royal-gold hover:bg-cream text-temple-black py-3 font-semibold transition-all shadow-md rounded-sm"
              >
                {catalogLoading ? 'Adding product...' : 'Add to Catalog'}
              </button>
            </form>
          </div>

          {/* Product Catalog List */}
          <div className="lg:col-span-2 glass-panel border border-royal-gold/15 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-royal-gold/15 font-utility text-[9px] uppercase tracking-wider text-royal-gold bg-temple-black/80">
                    <th className="p-4">Product</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-gold/5 font-utility text-xs text-warm-beige/80">
                  {catalog.map((p) => (
                    <tr key={p._id} className="hover:bg-deep-charcoal/30">
                      <td className="p-4">
                        <div className="font-display text-sm text-ivory">{p.name}</div>
                        <div className="text-[10px] text-warm-beige/40 mt-0.5">slug: {p.slug}</div>
                      </td>
                      <td className="p-4">₹{p.basePrice}</td>
                      <td className="p-4">{p.stock} pcs</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="text-lotus-pink hover:text-red-500 transition-colors p-1"
                          title="Delete product"
                        >
                          <Icons.Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
