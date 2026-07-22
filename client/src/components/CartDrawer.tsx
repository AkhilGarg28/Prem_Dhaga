'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../store/useCart';
import { Icons } from './Icons';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCart();
  const totalAmount = getCartTotal();

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close seva basket"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.68 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 cursor-default bg-temple-black"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 210 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden border-l border-royal-gold/22 bg-[#100d09] shadow-[0_0_110px_rgba(0,0,0,.55)]"
            aria-label="Seva basket"
          >
            <div className="absolute inset-0 temple-grain opacity-[0.18]" />
            <div className="relative border-b border-royal-gold/12 bg-temple-black/72 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <Icons.PeacockFeather className="text-royal-gold" size={24} />
                  <div>
                    <h2 className="font-display text-2xl font-light tracking-normal text-ivory">Seva Basket</h2>
                    <p className="mt-1 font-utility text-[8px] uppercase tracking-[0.24em] text-cream/38">Temple-packed checkout</p>
                  </div>
                </div>
                <button onClick={handleClose} className="nav-icon" aria-label="Close basket">
                  <Icons.Close size={21} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Icons.PeacockFeather className="text-royal-gold/22" size={70} />
                  <p className="mt-7 font-display text-2xl font-light italic text-cream/68">The altar is waiting.</p>
                  <p className="mt-3 max-w-xs font-body text-xs leading-6 text-cream/42">Select a poshak, mukut or seva set and we will keep it here for checkout.</p>
                  <Link href="/collections" onClick={handleClose} className="particle-button luxury-button mt-8">
                    Browse collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <article key={`${item.productId}-${item.size}-${item.swatchHex}`} className="grid grid-cols-[88px_1fr] gap-4 border-b border-royal-gold/10 pb-5">
                      <div className="relative h-28 overflow-hidden border border-royal-gold/14 bg-temple-black">
                        <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />
                      </div>

                      <div className="min-w-0 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-display text-xl font-light leading-tight text-ivory">{item.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-utility text-[9px] uppercase tracking-[0.14em] text-cream/42">
                              <span>Size {item.size}</span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full border border-royal-gold/25" style={{ backgroundColor: item.swatchHex }} />
                                {item.swatchName}
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 font-utility text-[10px] uppercase tracking-[0.16em] text-royal-gold">INR {item.price * item.quantity}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="grid grid-cols-3 border border-royal-gold/18 font-utility text-xs text-cream">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, item.swatchHex, item.quantity - 1)}
                              className="grid h-9 w-9 place-items-center text-cream/58 transition hover:text-royal-gold"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              -
                            </button>
                            <span className="grid h-9 w-9 place-items-center border-x border-royal-gold/12">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, item.swatchHex, item.quantity + 1)}
                              className="grid h-9 w-9 place-items-center text-cream/58 transition hover:text-royal-gold"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.size, item.swatchHex)}
                            className="grid h-9 w-9 place-items-center border border-royal-gold/12 text-cream/38 transition hover:border-lotus-pink/35 hover:text-lotus-pink"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Icons.Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="relative border-t border-royal-gold/12 bg-temple-black/74 p-6 backdrop-blur-xl">
                <div className="space-y-3 border-b border-royal-gold/10 pb-5">
                  <div className="flex justify-between font-utility text-[10px] uppercase tracking-[0.2em] text-cream/48">
                    <span>Subtotal</span>
                    <span className="text-royal-gold">INR {totalAmount}</span>
                  </div>
                  <p className="font-body text-[11px] leading-5 text-cream/38">Taxes, courier and gifting details are confirmed in checkout. Every order is packed from the atelier.</p>
                </div>
                <div className="mt-5 grid gap-3">
                  <Link href="/checkout" onClick={handleClose} className="particle-button luxury-button text-center">
                    Proceed to checkout
                  </Link>
                  <button onClick={handleClose} className="luxury-button-outline">
                    Continue exploring
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

