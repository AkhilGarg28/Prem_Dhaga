'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '../store/useCart';
import { Icons } from './Icons';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCart();

  const handleClose = () => setIsOpen(false);
  const totalAmount = getCartTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-temple-black z-50 cursor-pointer"
          />

          {/* Cart Drawer Panel (Right Side Slide) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-deep-charcoal border-l border-royal-gold/25 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-royal-gold/15 flex justify-between items-center bg-temple-black">
              <div className="flex items-center gap-2">
                <Icons.PeacockFeather className="text-royal-gold" size={20} />
                <h2 className="font-display text-xl tracking-wider text-ivory">Your Offerings</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:text-royal-gold transition-colors"
                aria-label="Close Cart"
              >
                <Icons.Close size={24} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                  <Icons.PeacockFeather className="text-royal-gold/20 animate-pulse" size={64} />
                  <p className="font-display text-lg text-warm-beige/60 italic">"The altar is empty."</p>
                  <p className="font-body text-xs text-warm-beige/40">Select silk poshaks to offer your devotion.</p>
                  <button
                    onClick={handleClose}
                    className="font-utility text-xs tracking-widest uppercase bg-royal-gold text-temple-black px-6 py-2 hover:bg-ivory transition-all"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.swatchHex}`}
                    className="flex gap-4 border-b border-royal-gold/10 pb-6"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-temple-black relative overflow-hidden border border-royal-gold/15 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-base text-ivory leading-tight">{item.name}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-warm-beige/60 font-utility">
                          <span>Size: {item.size}</span>
                          <span className="flex items-center gap-1">
                            Color:
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full border border-royal-gold/20"
                              style={{ backgroundColor: item.swatchHex }}
                            />
                            {item.swatchName}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Tweak & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-royal-gold/20">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.swatchHex, item.quantity - 1)}
                            className="px-2 py-0.5 text-warm-beige hover:text-royal-gold transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-utility text-ivory">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.swatchHex, item.quantity + 1)}
                            className="px-2 py-0.5 text-warm-beige hover:text-royal-gold transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.size, item.swatchHex)}
                          className="text-warm-beige/50 hover:text-lotus-pink transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Icons.Trash size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Price */}
                    <div className="text-right flex flex-col justify-between items-end">
                      <span className="font-utility text-xs text-royal-gold">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-royal-gold/15 bg-temple-black space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-utility text-xs tracking-wider text-warm-beige uppercase">Subtotal</span>
                  <span className="font-display text-xl text-royal-gold">₹{totalAmount}</span>
                </div>
                <p className="text-[10px] text-warm-beige/40 italic">
                  Crafted by hand in Vrindavan. Taxes and shipping calculated at checkout.
                </p>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link
                    href="/checkout"
                    onClick={handleClose}
                    className="font-utility text-xs tracking-widest uppercase bg-royal-gold hover:bg-cream text-temple-black py-3 text-center transition-all block font-medium"
                  >
                    Proceed to Devotion (Checkout)
                  </Link>
                  <button
                    onClick={handleClose}
                    className="font-utility text-xs tracking-widest uppercase border border-royal-gold/20 hover:border-royal-gold py-2 text-center text-warm-beige transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
