'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  createdAt: string;
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/orders/detail/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        // Fallback mock order if backend is offline
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
          orderStatus: 'processing',
          shippingDetails: {
            name: 'Devotee Lalita',
            email: 'lalita@gopal.com',
            phone: '+91 98765 43210',
            address: '108, Raman Reti',
            city: 'Vrindavan',
            state: 'Uttar Pradesh',
            zip: '281121',
          },
          createdAt: new Date().toISOString(),
        };
        setOrder(mockOrder);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.id]);

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

  // Figure out status indexes
  const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statusSteps.indexOf(order.orderStatus.toLowerCase());

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      <div className="max-w-3xl mx-auto w-full space-y-10">
        
        {/* Divine Greeting Header */}
        <div className="text-center space-y-4 relative py-6">
          {/* Glowing candle flicker effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-royal-gold/5 blur-[50px] pointer-events-none rounded-full" />
          
          <Icons.PeacockFeather className="text-royal-gold mx-auto animate-spin" style={{ animationDuration: '6s' }} size={42} />
          
          <h1 className="font-display text-4xl md:text-5xl text-royal-gold font-light tracking-wide animate-pulse">
            Jai Shri Krishna 🙏
          </h1>
          <p className="font-body text-xs md:text-sm text-warm-beige/80 max-w-xl mx-auto leading-relaxed">
            Thank you, <span className="text-ivory font-medium">{order.shippingDetails.name}</span>. Your loving offering has been successfully received. Our artisans are now weaving your poshak in the holy land of Vrindavan.
          </p>
          <span className="font-hindi text-sm italic text-royal-gold/70 block">
            “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
          </span>
        </div>

        {/* Order Details Panel */}
        <div className="glass-panel p-6 border border-royal-gold/15 space-y-6 rounded-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-royal-gold/10 pb-4">
            <div>
              <span className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-wider block">Order Identifier</span>
              <span className="font-utility text-sm text-royal-gold font-medium">{order.orderId}</span>
            </div>
            <div>
              <span className="font-utility text-[9px] text-warm-beige/40 uppercase tracking-wider block">Payment Status</span>
              <span className={`font-utility text-xs px-2 py-0.5 rounded-sm capitalize ${
                order.paymentStatus === 'paid' ? 'bg-vrindavan-green/10 text-vrindavan-green border border-vrindavan-green/20' : 'bg-lotus-pink/10 text-lotus-pink border border-lotus-pink/20'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Progress Tracker Status Line */}
          <div className="space-y-4 pt-2">
            <span className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-widest block">Seva Status</span>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-2 left-0 w-full h-[2px] bg-royal-gold/10 z-0" />
              <div
                className="absolute top-2 left-0 h-[2px] bg-royal-gold z-0 transition-all duration-1000"
                style={{
                  width: `${(Math.max(0, currentStatusIndex - 1) / (statusSteps.length - 2)) * 100}%`,
                }}
              />

              {/* Status Nodes */}
              <div className="relative z-10 flex justify-between">
                {['Paid', 'In Production', 'Shipped', 'Delivered'].map((step, idx) => {
                  const stepIndex = idx + 1; // Map (Paid, Production, Shipped, Delivered) to indices (1, 2, 3, 4) -> corresponding to database enums
                  const isCompleted = currentStatusIndex >= stepIndex;
                  const isCurrent = currentStatusIndex === stepIndex;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'border-royal-gold bg-royal-gold text-temple-black'
                          : 'border-royal-gold/20 bg-temple-black text-warm-beige/20'
                      } ${isCurrent ? 'ring-4 ring-royal-gold/25 scale-110' : ''}`}>
                        {isCompleted && <span className="text-[8px] font-bold">✓</span>}
                      </div>
                      <span className={`font-utility text-[9px] uppercase tracking-wider mt-2 ${
                        isCurrent ? 'text-royal-gold font-semibold' : isCompleted ? 'text-ivory' : 'text-warm-beige/40'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Items summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items Summary */}
          <div className="glass-panel p-6 border border-royal-gold/15 rounded-sm space-y-4">
            <h3 className="font-display text-lg text-ivory border-b border-royal-gold/10 pb-2">Your Offerings</h3>
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
                <span className="text-warm-beige/60">Total Offering</span>
                <span className="text-royal-gold">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address details */}
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

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black px-8 py-3 hover:bg-ivory transition-all font-semibold rounded-sm"
          >
            Return to Temple (Home)
          </Link>
        </div>

      </div>
    </div>
  );
}
