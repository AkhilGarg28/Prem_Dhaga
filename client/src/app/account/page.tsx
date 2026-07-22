'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { Icons } from '@/components/Icons';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user, token, logout, updateProfileState, addresses, setAddresses, wishlist, setWishlist } = useAuth();
  const { addItem } = useCart();

  // Mounted state to handle hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/checkout');
    }
  }, [isLoggedIn, router, mounted]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'support'>('orders');

  // API url
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Profile Edit fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [profileLang, setProfileLang] = useState(user?.language || 'English');
  const [profileNotify, setProfileNotify] = useState(user?.notificationsEnabled ?? true);
  const [profilePayMethod, setProfilePayMethod] = useState(user?.preferredPaymentMethod || 'Razorpay');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address creation fields
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      let fetchUrl = `${apiUrl}/orders/my-orders`;
      const params = [];
      if (orderStatusFilter) params.push(`status=${orderStatusFilter}`);
      if (orderSearch) params.push(`search=${orderSearch}`);
      if (params.length > 0) fetchUrl += `?${params.join('&')}`;

      const res = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('Backend connection offline. Utilizing local mockup order list.');
      setOrders([
        {
          _id: 'ord_mock_1',
          orderId: 'PD-172948234-108',
          totalAmount: 2100,
          paymentStatus: 'paid',
          orderStatus: 'preparing',
          shippingDetails: { name: user?.name, phone: user?.phone, address: 'Vrindavan Dham' },
          items: [{ product: 'prod_1', name: 'Lotus Shringaar Poshak', price: 2100, quantity: 1, size: 2, swatchName: 'Lotus Pink' }],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.warn('Wishlist fetch failed');
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.warn('Addresses fetch failed');
    }
  };

  // Load user data
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    
    // Reset inputs
    setProfileName(user?.name || '');
    setProfilePhone(user?.phone || '');
    setProfilePhoto(user?.profilePhoto || '');
    setProfileLang(user?.language || 'English');
    setProfileNotify(user?.notificationsEnabled ?? true);
    setProfilePayMethod(user?.preferredPaymentMethod || 'Razorpay');

    fetchOrders();
    fetchWishlist();
    fetchAddresses();
    // dashboard refetch intentionally follows auth, tab, filter, and user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token, activeTab, orderStatusFilter, user]);


  // Submit Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');

    try {
      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          profilePhoto,
          language: profileLang,
          notificationsEnabled: profileNotify,
          preferredPaymentMethod: profilePayMethod,
          password: profilePassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      updateProfileState({
        name: profileName,
        phone: profilePhone,
        profilePhoto,
        language: profileLang,
        notificationsEnabled: profileNotify,
        preferredPaymentMethod: profilePayMethod,
      });

      setProfileMessage('Your devotional identity profile was successfully updated.');
      setProfilePassword('');
    } catch (err: any) {
      setProfileMessage(err.message || 'Server connection failed');
    } finally {
      setProfileLoading(false);
    }
  };

  // Address operations
  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addrName,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          zip: addrZip,
          phone: addrPhone,
          isDefault: addrDefault,
        }),
      });

      if (res.ok) {
        const addrData = await res.json();
        setAddresses(addrData);
        setShowAddAddress(false);
        // Clear inputs
        setAddrName('');
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrZip('');
        setAddrPhone('');
        setAddrDefault(false);
      }
    } catch (err) {
      console.error('Failed to create address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const addrData = await res.json();
        setAddresses(addrData);
      }
    } catch (err) {
      console.error('Delete address failed');
    }
  };

  // Wishlist operations
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`${apiUrl}/auth/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWishlist(wishlist.filter((p) => p._id !== productId));
      }
    } catch (err) {
      console.error('Remove wishlist item failed');
    }
  };

  // Reorder Item helper
  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        productId: item.product?._id || item.product,
        name: item.name,
        price: item.price,
        size: item.size,
        swatchHex: item.swatchHex,
        swatchName: item.swatchName,
        image: '/images/prem-dhaga-hero.png', // default fallback
      });
    });
    router.push('/checkout');
  };

  // Cancel order control
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Connection offline. Cannot cancel order.');
    }
  };


  if (!mounted) {
    return (
      <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <Icons.PeacockFeather className="text-royal-gold/40 mx-auto" size={40} />
          <p className="font-utility text-[9px] uppercase tracking-widest text-warm-beige/30">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-12 flex flex-col justify-start">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: LUXURY NAVIGATION SIDEBAR */}
        <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-6">
          <div className="text-center space-y-2 border-b border-royal-gold/10 pb-4">
            <div className="w-16 h-16 rounded-full border border-royal-gold/30 mx-auto overflow-hidden bg-deep-charcoal flex items-center justify-center relative">
              {user?.profilePhoto ? (
                <Image src={user.profilePhoto} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <Icons.User className="text-royal-gold/50" size={32} />
              )}
            </div>
            <h2 className="font-display text-lg text-ivory">{user?.name}</h2>
            <span className="font-utility text-[8px] text-royal-gold border border-royal-gold/20 px-2 py-0.5 rounded-sm uppercase tracking-widest">
              {user?.role || 'Customer'}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-utility text-xs tracking-wider uppercase">
            {(['orders', 'profile', 'addresses', 'wishlist', 'support'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left py-2 px-3 border-l-2 transition-all ${
                  activeTab === tab
                    ? 'border-royal-gold text-royal-gold bg-royal-gold/5 font-semibold'
                    : 'border-transparent text-warm-beige/40 hover:text-royal-gold/60'
                }`}
              >
                {tab === 'orders' ? 'My Orders' : tab === 'profile' ? 'Profile details' : tab === 'addresses' ? 'Addresses' : tab === 'wishlist' ? 'Wishlist' : 'Support desk'}
              </button>
            ))}
            
            <div className="h-[1px] bg-royal-gold/10 my-2" />
            
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-left py-2 px-3 text-lotus-pink hover:text-red-500 transition-colors"
            >
              Logout Portal
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL TABS */}
        <div className="md:col-span-3 space-y-6">
          
          {/* --- TAB 1: ORDERS HISTORY --- */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-royal-gold/10 pb-4">
                <div>
                  <h3 className="font-display text-xl text-ivory">Beloved Offerings History</h3>
                  <p className="font-utility text-[9px] text-warm-beige/40 uppercase mt-0.5">Manage and track past orders</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-deep-charcoal border border-royal-gold/15 p-1.5 text-[10px] text-ivory outline-none focus:border-royal-gold font-utility uppercase tracking-wider"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search Order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                    className="bg-deep-charcoal border border-royal-gold/15 p-1.5 text-xs text-ivory outline-none focus:border-royal-gold rounded-sm w-36"
                  />
                </div>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12 text-warm-beige/40 font-display italic">Loading your history...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 glass-panel border border-royal-gold/10 rounded-sm">
                  <Icons.PeacockFeather className="mx-auto text-royal-gold/10 mb-2" size={40} />
                  <p className="font-display text-base text-warm-beige/50 italic">"No order chronicles found."</p>
                  <Link href="/collections" className="font-utility text-[10px] text-royal-gold uppercase tracking-wider border border-royal-gold/20 hover:border-royal-gold px-4 py-1.5 mt-4 inline-block">
                    Begin Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o._id} className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
                      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-royal-gold/10 pb-3">
                        <div className="space-y-0.5">
                          <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Order Identification</span>
                          <Link href={`/order/${o.orderId}`} className="font-utility text-xs text-royal-gold font-bold hover:underline">
                            {o.orderId}
                          </Link>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Order Date</span>
                          <span className="font-utility text-xs text-ivory">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Fulfillment</span>
                          <span className={`font-utility text-[10px] uppercase px-2 py-0.5 border rounded-sm ${
                            o.orderStatus === 'delivered' ? 'border-vrindavan-green/20 text-vrindavan-green bg-vrindavan-green/5' :
                            o.orderStatus === 'cancelled' ? 'border-lotus-pink/20 text-lotus-pink bg-lotus-pink/5' :
                            'border-royal-gold/20 text-royal-gold bg-royal-gold/5'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </div>
                        <div>
                          <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Total Devotion</span>
                          <span className="font-display text-sm text-royal-gold font-semibold">INR {o.totalAmount}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {o.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div>
                              <h4 className="font-display text-sm text-ivory">{item.name}</h4>
                              <p className="font-utility text-[9px] text-warm-beige/40 mt-0.5">
                                Size {item.size}  /  Color: {item.swatchName}  /  Qty {item.quantity}
                              </p>
                            </div>
                            <span className="font-utility text-xs text-royal-gold">INR {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="border-t border-royal-gold/10 pt-3 flex flex-wrap gap-4 justify-between items-center">
                        <Link
                          href={`/order/${o.orderId}`}
                          className="font-utility text-[9px] text-royal-gold uppercase tracking-wider hover:underline"
                        >
                          Live Tracking Portal →
                        </Link>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReorder(o)}
                            className="font-utility text-[9px] uppercase tracking-wider border border-royal-gold/20 hover:border-royal-gold text-royal-gold px-3 py-1"
                          >
                            Reorder offering
                          </button>
                          {['pending', 'paid', 'confirmed'].includes(o.orderStatus) && (
                            <button
                              onClick={() => handleCancelOrder(o.orderId)}
                              className="font-utility text-[9px] uppercase tracking-wider border border-lotus-pink/25 hover:border-lotus-pink text-lotus-pink px-3 py-1"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB 2: PROFILE DETAILS --- */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-6">
              <div>
                <h3 className="font-display text-xl text-ivory">Devotional Identity</h3>
                <p className="font-utility text-[9px] text-warm-beige/40 uppercase mt-0.5">Edit customer details & credentials</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Preferred Language</label>
                    <select
                      value={profileLang}
                      onChange={(e) => setProfileLang(e.target.value)}
                      className="w-full bg-deep-charcoal border border-royal-gold/15 p-2.5 text-xs text-ivory outline-none focus:border-royal-gold rounded-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi / Devanagari</option>
                      <option value="Sanskrit">Sanskrit</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Preferred Payment</label>
                    <select
                      value={profilePayMethod}
                      onChange={(e) => setProfilePayMethod(e.target.value)}
                      className="w-full bg-deep-charcoal border border-royal-gold/15 p-2.5 text-xs text-ivory outline-none focus:border-royal-gold rounded-sm"
                    >
                      <option value="Razorpay">Razorpay Card / UPI</option>
                      <option value="NetBanking">Net Banking</option>
                      <option value="Wallet">Mobile Wallet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Profile Photo URL</label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                    placeholder="https://cloudinary.com/image.jpg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Reset Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2.5 text-xs text-ivory outline-none rounded-sm"
                    placeholder="********"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="profileNotify"
                    checked={profileNotify}
                    onChange={(e) => setProfileNotify(e.target.checked)}
                    className="accent-royal-gold border-royal-gold/15 bg-deep-charcoal focus:ring-0 rounded-sm"
                  />
                  <label htmlFor="profileNotify" className="font-utility text-[10px] text-warm-beige/60 uppercase tracking-widest cursor-pointer select-none">
                    Enable Devotional Order Notifications (Email & SMS)
                  </label>
                </div>

                {profileMessage && <p className="text-[10px] text-royal-gold text-center">{profileMessage}</p>}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="font-utility text-xs tracking-widest uppercase bg-royal-gold hover:bg-cream text-temple-black px-6 py-3 font-semibold transition-all shadow-md rounded-sm block w-full"
                >
                  {profileLoading ? 'Weaving updates...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* --- TAB 3: ADDRESSES MANAGER --- */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-royal-gold/10 pb-4">
                <div>
                  <h3 className="font-display text-xl text-ivory">Saved Delivery Locations</h3>
                  <p className="font-utility text-[9px] text-warm-beige/40 uppercase mt-0.5">Manage multiple shipping coordinates</p>
                </div>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="font-utility text-[10px] bg-royal-gold text-temple-black px-4 py-1.5 uppercase font-bold tracking-wider rounded-sm hover:bg-cream"
                >
                  {showAddAddress ? 'Cancel' : 'Add Address'}
                </button>
              </div>

              {/* Add Address Form toggle */}
              {showAddAddress && (
                <form onSubmit={handleAddAddressSubmit} className="glass-panel p-6 border border-royal-gold/30 rounded-sm space-y-4 bg-deep-charcoal/20">
                  <h4 className="font-display text-md text-ivory border-b border-royal-gold/10 pb-2">Add New Location</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">Recipient Name</label>
                      <input
                        type="text"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">Phone Number</label>
                      <input
                        type="text"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">Street Address</label>
                    <input
                      type="text"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                      placeholder="Line 1, Landmark"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">City</label>
                      <input
                        type="text"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">State</label>
                      <input
                        type="text"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-utility text-[10px] text-warm-beige/50 uppercase block">Zipcode</label>
                      <input
                        type="text"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full bg-deep-charcoal border border-royal-gold/15 focus:border-royal-gold p-2 text-xs text-ivory outline-none rounded-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="addrDefault"
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                      className="accent-royal-gold border-royal-gold/15 bg-deep-charcoal"
                    />
                    <label htmlFor="addrDefault" className="font-utility text-[10px] text-warm-beige/60 uppercase tracking-widest cursor-pointer select-none">
                      Set as Default Delivery Coordinate
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black py-2.5 font-semibold transition-all rounded-sm"
                  >
                    Add Location coordinates
                  </button>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-12 glass-panel border border-royal-gold/10 rounded-sm font-display text-sm text-warm-beige/50 italic">
                  "No saved delivery locations."
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4 relative bg-deep-charcoal/10">
                      <h4 className="font-display text-base text-ivory">{addr.name}</h4>
                      <p className="font-body text-xs text-warm-beige/80 leading-relaxed pr-8">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                      </p>
                      <p className="font-utility text-[10px] text-warm-beige/40">Phone: {addr.phone}</p>
                      
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 font-utility text-[8px] text-royal-gold border border-royal-gold/30 px-2 py-0.5 uppercase tracking-wide">
                          Default
                        </span>
                      )}

                      <div className="border-t border-royal-gold/5 pt-3 flex justify-between items-center text-xs">
                        <button
                          onClick={() => handleDeleteAddress(addr._id!)}
                          className="text-lotus-pink hover:text-red-500 font-utility text-[10px] uppercase tracking-wider"
                        >
                          Delete coordinates
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB 4: WISHLIST --- */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-xl text-ivory">Spiritual Wishlist</h3>
                <p className="font-utility text-[9px] text-warm-beige/40 uppercase mt-0.5">Saves products for future devotional offerings</p>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 glass-panel border border-royal-gold/10 rounded-sm font-display text-sm text-warm-beige/50 italic">
                  "Your wishlist is currently empty."
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlist.map((p) => (
                    <div key={p._id} className="glass-panel border border-royal-gold/15 overflow-hidden rounded-sm group relative">
                      <div className="h-48 bg-temple-black overflow-hidden relative border-b border-royal-gold/10">
                        {p.images && p.images.length > 0 ? (
                          <Image src={p.images[0]} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition-all duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-royal-gold/25"><Icons.PeacockFeather size={40} /></div>
                        )}
                        <button
                          onClick={() => handleRemoveFromWishlist(p._id)}
                          className="absolute top-2 right-2 bg-temple-black/80 hover:bg-temple-black text-lotus-pink p-1.5 border border-royal-gold/10"
                          title="Remove from wishlist"
                        >
                          <Icons.Close size={16} />
                        </button>
                      </div>
                      
                      <div className="p-4 space-y-2">
                        <h4 className="font-display text-sm text-ivory truncate">{p.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="font-utility text-xs text-royal-gold font-bold">INR {p.basePrice}</span>
                          <Link
                            href={`/products/${p.slug}`}
                            className="font-utility text-[9px] uppercase bg-royal-gold text-temple-black px-3 py-1 font-bold tracking-widest"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB 5: SUPPORT CHRONICLE --- */}
          {activeTab === 'support' && (
            <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-6">
              <div>
                <h3 className="font-display text-xl text-ivory">Devotional Support Desk</h3>
                <p className="font-utility text-[9px] text-warm-beige/40 uppercase mt-0.5">Communicate directly with Vrindavan weavers</p>
              </div>

              <div className="space-y-4 font-body text-xs text-warm-beige/80 leading-relaxed">
                <p>
                  Pranam, thank you for contacting the Prem Dhaga Devotional Atelier. For custom requests, alterations, or queries regarding order weaving timeline, please write to us directly.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="border border-royal-gold/10 p-4 bg-deep-charcoal/20">
                    <h4 className="font-display text-sm text-royal-gold font-semibold uppercase tracking-wider mb-2">Registry Mailbox</h4>
                    <p className="font-utility text-xs text-ivory">support@premdhaga.com</p>
                    <p className="font-body text-[10px] text-warm-beige/50 mt-1">Average response duration: 2 hours</p>
                  </div>
                  
                  <div className="border border-royal-gold/10 p-4 bg-deep-charcoal/20">
                    <h4 className="font-display text-sm text-royal-gold font-semibold uppercase tracking-wider mb-2">Direct WhatsApp Connection</h4>
                    <p className="font-utility text-xs text-ivory">+91 108 5000 108</p>
                    <p className="font-body text-[10px] text-warm-beige/50 mt-1">Operational: 8 AM to 8 PM Vrindavan Time</p>
                  </div>
                </div>

                <div className="h-[1px] bg-royal-gold/10 my-4" />

                <div className="space-y-2">
                  <h4 className="font-display text-base text-ivory">Raise Devotional Inquiry</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Subject" className="bg-deep-charcoal border border-royal-gold/15 p-2 text-xs text-ivory outline-none rounded-sm focus:border-royal-gold" />
                      <input type="text" placeholder="Order ID (Optional)" className="bg-deep-charcoal border border-royal-gold/15 p-2 text-xs text-ivory outline-none rounded-sm focus:border-royal-gold" />
                    </div>
                    <textarea rows={4} placeholder="Write details of query..." className="w-full bg-deep-charcoal border border-royal-gold/15 p-2 text-xs text-ivory outline-none rounded-sm focus:border-royal-gold" />
                    <button
                      type="button"
                      onClick={() => alert('Pranam, your inquiry message logs were sent to the Vrindavan Registry. We will contact you soon.')}
                      className="font-utility text-xs uppercase tracking-widest bg-royal-gold text-temple-black py-2 px-6 font-bold"
                    >
                      Dispatch Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


