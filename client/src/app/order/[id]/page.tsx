'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { Icons } from '@/components/Icons';

interface OrderItem {
  name: string;
  size: number;
  swatchName: string;
  swatchHex: string;
  quantity: number;
  price: number;
}

interface Order {
  _id?: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  courierPartner?: string;
  trackingId?: string;
  estimatedDeliveryDate?: string;
  trackingTimeline?: { status: string; title: string; description: string; location: string; timestamp: string }[];
  createdAt: string;
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { token } = useAuth();
  
  // Invoice print overlay trigger
  const [showInvoice, setShowInvoice] = useState(false);

  // Simulated Live City Movement Log (Live Tracking updates)
  const [liveLocationIndex, setLiveLocationIndex] = useState(0);
  const liveMovementLogs = [
    { city: 'Vrindavan Atelier Hub', desc: 'Attire sanctified, packed and handed over to logistics partner.', time: '08:00 AM' },
    { city: 'Mathura Sorting Center', desc: 'Sorted and cleared for interstate transport.', time: '02:30 PM' },
    { city: 'Delhi Gateway Port', desc: 'In-transit through regional distribution terminal.', time: '11:15 PM' },
    { city: 'Destination Hub', desc: 'Received at local delivery port. Sorted for delivery route.', time: '07:45 AM' },
    { city: 'Out for Delivery Altar', desc: 'Courier agent has left regional warehouse with package.', time: '10:00 AM' },
  ];

  useEffect(() => {
    fetchOrderDetails();

    // Increment simulated live tracking movement log slowly
    const interval = setInterval(() => {
      setLiveLocationIndex((prev) => (prev < liveMovementLogs.length - 1 ? prev + 1 : prev));
    }, 15000);

    return () => clearInterval(interval);
    // live tracking interval intentionally resets only when the order id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/orders/detail/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      // Mock tracking fallback if backend offline
      const mockOrder = {
        orderId: params.id,
        items: [
          {
            name: 'Lotus Shringaar Poshak (Size 2)',
            size: 2,
            swatchName: 'Vrindavan Green',
            swatchHex: '#3B6B3B',
            quantity: 1,
            price: 1500,
          },
          {
            name: 'Matching Mukut + Shringaar Set (Size 2)',
            size: 2,
            swatchName: 'Vrindavan Green',
            swatchHex: '#3B6B3B',
            quantity: 1,
            price: 600,
          },
        ],
        totalAmount: 2100,
        paymentStatus: 'paid',
        orderStatus: 'preparing',
        shippingDetails: {
          name: 'Devotee Lalita',
          email: 'lalita@gopal.com',
          phone: '+91 98765 43210',
          address: '108, Raman Reti',
          city: 'Vrindavan',
          state: 'Uttar Pradesh',
          zip: '281121',
        },
        courierPartner: 'BlueDart Luxury Express',
        trackingId: 'BD-PREM-108108',
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        trackingTimeline: [
          { status: 'pending', title: 'Order Placed', description: 'Loving poshak request registered.', location: 'Atelier Server', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { status: 'paid', title: 'Payment Successful', description: 'Transaction processed successfully.', location: 'Razorpay Gateway', timestamp: new Date(Date.now() - 3000000).toISOString() },
          { status: 'confirmed', title: 'Order Confirmed', description: 'Devotional specifications verified.', location: 'Vrindavan Hub', timestamp: new Date(Date.now() - 2500000).toISOString() },
          { status: 'preparing', title: 'Preparing Your Order', description: 'Artisans have begun handcrafting.', location: 'Vrindavan Atelier', timestamp: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
      };
      setOrder(mockOrder);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/orders/${params.id}/cancel`, {
        method: 'POST',
        headers,
      });

      if (res.ok) {
        fetchOrderDetails();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Offline test: Simulating local cancellation.');
      setOrder((prev: any) => ({
        ...prev,
        orderStatus: 'cancelled',
        trackingTimeline: [
          ...(prev?.trackingTimeline || []),
          { status: 'cancelled', title: 'Cancelled', description: 'Order cancelled offline.', location: 'Client Browser', timestamp: new Date().toISOString() },
        ],
      }));
    } finally {
      setCancelling(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-temple-black flex justify-center items-center">
        <Icons.PeacockFeather className="text-royal-gold animate-bounce" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-temple-black flex flex-col justify-center items-center space-y-4">
        <p className="font-display text-lg text-warm-beige/50 italic">"Order not found."</p>
        <Link href="/" className="font-utility text-xs bg-royal-gold text-temple-black px-6 py-2">
          Return Home
        </Link>
      </div>
    );
  }

  // Complete status timeline tracking steps
  const timelineStages = [
    { status: 'pending', label: 'Placed' },
    { status: 'paid', label: 'Paid' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'preparing', label: 'Preparing' },
    { status: 'packaging', label: 'Packaging' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'in_transit', label: 'Transit' },
    { status: 'out_for_delivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' },
    { status: 'completed', label: 'Completed' },
  ];

  // Granular backend status map
  const statusAliasMap: Record<string, number> = {
    pending: 0,
    paid: 1,
    confirmed: 2,
    stitching: 3,
    quality_check: 3,
    preparing: 3,
    packed: 4,
    packaging: 4,
    ready_for_pickup: 4,
    shipped: 5,
    in_transit: 6,
    out_for_delivery: 7,
    delivered: 8,
    completed: 9,
    cancelled: 0,
    refunded: 0,
    returned: 0,
  };

  // Figure out active index
  const normalizedStatus = (order.orderStatus || 'pending').toLowerCase();
  const activeStatusIndex = statusAliasMap[normalizedStatus] ?? timelineStages.findIndex((s) => s.status === normalizedStatus);

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      <div className="max-w-4xl mx-auto w-full space-y-8 print:hidden">
        
        {/* Divine Greeting Header */}
        <div className="text-center space-y-3 relative py-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-royal-gold/5 blur-[50px] pointer-events-none rounded-full" />
          <Icons.PeacockFeather className="text-royal-gold mx-auto animate-spin" style={{ animationDuration: '8s' }} size={36} />
          
          <h1 className="font-display text-3xl md:text-4xl text-royal-gold font-light tracking-wide">
            Jai Shri Krishna 🙏
          </h1>
          <p className="font-body text-xs md:text-sm text-warm-beige/80 max-w-xl mx-auto leading-relaxed">
            Thank you, <span className="text-ivory font-medium">{order.shippingDetails.name}</span>. Your poshak requests are logged at Prem Dhaga Devotional Atelier.
          </p>
          <span className="font-hindi text-xs italic text-royal-gold/70 block">
            “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
          </span>
        </div>

        {/* METRICS SUMMARY WIDGET */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
            <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Order Identifier</span>
            <span className="font-utility text-xs text-royal-gold font-bold mt-1 block">{order.orderId}</span>
          </div>
          <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
            <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Estimated Delivery</span>
            <span className="font-utility text-xs text-royal-gold font-bold mt-1 block">
              {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'Crafting in progress'}
            </span>
          </div>
          <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
            <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Logistics Courier</span>
            <span className="font-utility text-xs text-royal-gold font-bold mt-1 block truncate">
              {order.courierPartner || 'Vrindavan Registry Delivery'}
            </span>
          </div>
          <div className="glass-panel p-4 border border-royal-gold/10 rounded-sm">
            <span className="font-utility text-[8px] text-warm-beige/40 uppercase block">Tracking ID</span>
            <span className="font-utility text-xs text-royal-gold font-bold mt-1 block truncate">{order.trackingId || 'Preparing...'}</span>
          </div>
        </div>

        {/* TIMELINE PROGRESS PANEL */}
        <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-6">
          <div className="flex justify-between items-center border-b border-royal-gold/10 pb-3">
            <h3 className="font-display text-base text-ivory">Seva Delivery Timeline</h3>
            <span className="font-utility text-[10px] text-royal-gold font-semibold uppercase">
              Current stage: {order.orderStatus}
            </span>
          </div>

          {/* Timeline Node Chain */}
          <div className="relative pt-2 pb-6">
            {/* Progress line */}
            <div className="absolute top-4 left-0 w-full h-[1.5px] bg-royal-gold/10 z-0" />
            <div
              className="absolute top-4 left-0 h-[1.5px] bg-royal-gold z-0 transition-all duration-1000"
              style={{
                width: `${activeStatusIndex > -1 ? (activeStatusIndex / (timelineStages.length - 1)) * 100 : 0}%`,
              }}
            />

            <div className="relative z-10 flex justify-between">
              {timelineStages.map((stage, idx) => {
                const isCompleted = activeStatusIndex >= idx;
                const isCurrent = activeStatusIndex === idx;

                return (
                  <div key={idx} className="flex flex-col items-center group">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted ? 'border-royal-gold bg-royal-gold text-temple-black' : 'border-royal-gold/25 bg-temple-black text-warm-beige/20'
                    } ${isCurrent ? 'ring-4 ring-royal-gold/20 scale-110' : ''}`}>
                      {isCompleted && <span className="text-[7px] font-bold">✓</span>}
                    </div>
                    <span className={`font-utility text-[7px] md:text-[8px] uppercase tracking-wider mt-2.5 transition-all text-center max-w-[50px] hidden sm:block ${
                      isCurrent ? 'text-royal-gold font-semibold' : isCompleted ? 'text-ivory' : 'text-warm-beige/30'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display recent tracking details history */}
          {order.trackingTimeline && order.trackingTimeline.length > 0 && (
            <div className="space-y-3 border-t border-royal-gold/10 pt-4">
              <span className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-widest block">History Chronicles</span>
              <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                {order.trackingTimeline.map((log, idx) => (
                  <div key={idx} className="flex gap-4 items-start text-[11px] font-utility">
                    <span className="text-royal-gold w-24 flex-shrink-0 text-left">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1">
                      <strong className="text-ivory block">{log.title}</strong>
                      <span className="text-warm-beige/50 block mt-0.5">{log.description}</span>
                    </div>
                    <span className="text-warm-beige/40 italic">{log.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIVE SIMULATOR CITY TRACKING TRACK */}
        {order.orderStatus !== 'pending' && order.orderStatus !== 'cancelled' && (
          <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
            <h3 className="font-display text-base text-ivory border-b border-royal-gold/10 pb-2">Live Transit Logs (Simulation)</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              
              {/* Animated Map Route Indicator */}
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-3">
                  {liveMovementLogs.map((log, idx) => {
                    const isPassed = liveLocationIndex >= idx;
                    const isActive = liveLocationIndex === idx;

                    return (
                      <div key={idx} className="flex items-start gap-4 text-xs font-utility">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full border transition-all ${
                            isPassed ? 'border-royal-gold bg-royal-gold' : 'border-royal-gold/25 bg-temple-black'
                          } ${isActive ? 'animate-ping' : ''}`} />
                          {idx < liveMovementLogs.length - 1 && <div className="w-[1.5px] h-6 bg-royal-gold/10" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <span className={`${isActive ? 'text-royal-gold font-bold' : isPassed ? 'text-ivory' : 'text-warm-beige/35'}`}>
                            {log.city} — <span className="text-[10px] text-warm-beige/40">{log.time}</span>
                          </span>
                          {isActive && <p className="text-[10px] text-warm-beige/60 mt-0.5 leading-relaxed">{log.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Side graphic widget */}
              <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 border border-royal-gold/10 bg-deep-charcoal/20 text-center rounded-sm">
                <Icons.PeacockFeather className="text-royal-gold/40 animate-pulse" size={48} />
                <span className="font-display text-sm text-ivory mt-2">Vrindavan Transit</span>
                <p className="font-body text-[10px] text-warm-beige/50 mt-1 max-w-[150px]">
                  Your sacred attire travels with care and spiritual blessings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM HALF: ITEMS DETAILS & SHIPPING ALTAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Item details */}
          <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
            <h3 className="font-display text-lg text-ivory border-b border-royal-gold/10 pb-2">Sacred Offerings</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-display text-sm text-ivory">{item.name}</h4>
                    <p className="font-utility text-[9px] text-warm-beige/50 mt-0.5">
                      Size {item.size}  ·  Qty {item.quantity}  ·  {item.swatchName}
                    </p>
                  </div>
                  <span className="font-utility text-royal-gold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-royal-gold/10 pt-4 flex justify-between items-center font-display text-base">
                <span className="text-warm-beige/60">Total Amount</span>
                <span className="text-royal-gold">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
            <h3 className="font-display text-lg text-ivory border-b border-royal-gold/10 pb-2">Delivery Altar</h3>
            <div className="font-body text-xs text-warm-beige/80 space-y-2 leading-relaxed">
              <p><strong className="text-ivory">Name:</strong> {order.shippingDetails.name}</p>
              <p><strong className="text-ivory">Phone:</strong> {order.shippingDetails.phone}</p>
              <p><strong className="text-ivory">Email:</strong> {order.shippingDetails.email}</p>
              <p>
                <strong className="text-ivory">Address:</strong><br />
                {order.shippingDetails.address},<br />
                {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.zip}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR ACTION BUTTONS */}
        <div className="border-t border-royal-gold/10 pt-6 flex flex-wrap gap-4 justify-between items-center font-utility text-[10px] uppercase tracking-wider">
          <div className="flex gap-4">
            <button
              onClick={() => setShowInvoice(true)}
              className="text-royal-gold hover:text-cream transition-colors font-bold"
            >
              Invoice Download 📜
            </button>
            <button
              onClick={() => alert(`Connecting with support for Order ${order.orderId}... Please WhatsApp +91 108 5000 108`)}
              className="text-warm-beige/60 hover:text-royal-gold transition-colors"
            >
              Contact Support
            </button>
          </div>

          <div className="flex gap-3">
            {['pending', 'paid', 'confirmed'].includes(order.orderStatus) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="text-lotus-pink hover:text-red-500 transition-colors border border-lotus-pink/20 hover:border-lotus-pink px-4 py-1.5"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <Link
              href="/"
              className="bg-royal-gold text-temple-black hover:bg-cream transition-all px-4 py-1.5 font-bold"
            >
              Return Home
            </Link>
          </div>
        </div>

      </div>

      {/* --- INVOICE PRINT OVERLAY / PARCHMENT HTML VIEW --- */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto flex justify-center py-10 px-4">
          <div className="max-w-2xl w-full parchment-card p-10 space-y-8 border-4 border-[#C9A84C] relative bg-[#fdfaf4] text-[#1a1610] rounded-sm print:border-0 print:p-0 print:m-0 print:absolute print:inset-0">
            
            {/* Header logos and greetings */}
            <div className="text-center space-y-2 border-b border-[#C9A84C]/35 pb-4">
              <h2 className="font-display text-4xl text-[#8B6914] font-medium tracking-wide">PREM DHAGA</h2>
              <p className="font-utility text-[9px] text-[#8B6914] uppercase tracking-widest">
                Devotional Fashion Atelier — Vrindavan Dham
              </p>
              <h3 className="font-display text-md text-[#1a1610] italic">Jai Shri Krishna 🙏</h3>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4 text-xs font-utility text-[#1a1610]">
              <div className="space-y-1">
                <span className="text-[#8B6914] uppercase tracking-wider block text-[9px]">Invoice Recipient</span>
                <strong className="block text-sm">{order.shippingDetails.name}</strong>
                <span>{order.shippingDetails.email}</span><br />
                <span>{order.shippingDetails.phone}</span>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[#8B6914] uppercase tracking-wider block text-[9px]">Invoice Details</span>
                <strong>Order ID: {order.orderId}</strong><br />
                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span><br />
                <span>Shipping Altar: {order.shippingDetails.city}</span>
              </div>
            </div>

            {/* Table of items */}
            <div className="border-t border-b border-[#C9A84C]/35 py-4">
              <table className="w-full text-left font-utility text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C9A84C]/20 uppercase tracking-widest text-[#8B6914] text-[9px]">
                    <th className="pb-2">Offering Particulars</th>
                    <th className="pb-2 text-center">Size</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9A84C]/10 text-xs">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <strong className="font-display text-sm">{item.name}</strong>
                        <span className="block text-[10px] text-gray-500 mt-0.5">Color: {item.swatchName}</span>
                      </td>
                      <td className="py-2.5 text-center">{item.size}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right font-medium">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-start font-utility text-xs">
              <div className="max-w-[280px] italic text-gray-500 text-[10px] leading-relaxed">
                "Weaving poshaks for the Divine is our supreme privilege. Thank you for including us in your loving devotional service."
              </div>
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-700">Free</span>
                </div>
                <div className="flex justify-between font-display text-base font-bold border-t border-[#C9A84C]/35 pt-2">
                  <span>Total Amount</span>
                  <span className="text-[#8B6914]">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer with stamp */}
            <div className="text-center border-t border-[#C9A84C]/35 pt-6 font-hindi text-[#8B6914]/80 text-xs italic">
              “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
            </div>

            {/* Action buttons on Invoice */}
            <div className="pt-6 border-t border-gray-200 flex justify-end gap-4 print:hidden">
              <button
                onClick={triggerPrint}
                className="bg-[#8B6914] text-white hover:bg-[#C9A84C] font-utility text-xs uppercase tracking-widest px-4 py-2 font-bold transition-all rounded-sm shadow-md"
              >
                Print Receipt 🖨️
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="border border-[#8B6914] text-[#8B6914] hover:bg-[#8B6914]/5 font-utility text-xs uppercase tracking-widest px-4 py-2 transition-all rounded-sm"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
