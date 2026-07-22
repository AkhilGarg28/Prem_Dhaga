'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../store/useCart';
import { useAuth } from '../store/useAuth';
import { Icons } from './Icons';

const links = [
  { href: '/collections', label: 'Collections' },
  { href: '/custom', label: 'Bespoke' },
  { href: '/seva-guide', label: 'Seva Journal' },
  { href: '/about', label: 'Our House' },
];

const searchSuggestions = [
  {
    title: 'Swarna Janmashtami Poshak',
    meta: 'Festival edit / antique gold',
    href: '/products/swarna-janmashtami-poshak',
    image: '/images/janmashtami-poshak.png',
  },
  {
    title: 'Shayan Veshbhusha',
    meta: 'Moonlight silks / final seva',
    href: '/collections/shayan-veshbhusha',
    image: '/images/shayan-poshak.png',
  },
  {
    title: 'Rajbhog Royal',
    meta: 'Peacock velvet / kundan accents',
    href: '/collections/rajbhog-royal',
    image: '/images/janmashtami-poshak.png',
  },
  {
    title: 'Custom Seva Commission',
    meta: 'One-of-one atelier request',
    href: '/custom',
    image: '/images/prem-dhaga-hero.png',
  },
];

const recentSearches = ['Janmashtami', 'Size 2 poshak', 'Mukut set'];
const trendingSearches = ['Peacock blue', 'Shayan silk', 'Festival gifting'];

export default function Navbar() {
  const { getCartCount, setIsOpen } = useCart();
  const { isLoggedIn, user, login, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartCount = getCartCount();

  const displayName = user?.name?.trim() || 'Akhil';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return searchSuggestions;

    return searchSuggestions.filter((item) =>
      `${item.title} ${item.meta}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (!isTyping && event.key === '/') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setAccountOpen(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (accountOpen && accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }

      if (searchOpen && searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [accountOpen, searchOpen]);

  const closeOverlays = () => {
    setAccountOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleDemoLogin = (method: 'google' | 'phone' | 'email') => {
    login(`demo-${method}-token`, {
      id: `demo-${method}`,
      name: 'Akhil',
      email: method === 'phone' ? 'akhil.phone@premdhaga.local' : 'akhil@premdhaga.local',
      phone: method === 'phone' ? '+91 98765 43210' : undefined,
      role: 'customer',
      language: 'English',
      notificationsEnabled: true,
      preferredPaymentMethod: 'UPI',
    });
    setAccountOpen(false);
  };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-700 ${scrolled ? 'border-royal-gold/15 bg-temple-black/90 py-3 shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-xl' : 'border-transparent bg-gradient-to-b from-black/60 to-transparent py-5'}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-10 lg:px-16">
          <Link href="/" className="group flex items-center gap-3" aria-label="Prem Dhaga home">
            <Icons.PeacockFeather size={25} className="text-royal-gold transition-transform duration-700 group-hover:-rotate-6" />
            <div>
              <span className="block font-display text-[19px] font-medium tracking-[0.18em] text-ivory sm:text-[21px]">PREM DHAGA</span>
              <span className="hidden font-utility text-[7px] uppercase tracking-[0.32em] text-cream/45 sm:block">Vrindavan atelier</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} prefetch={true} className="nav-whisper">{link.label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Open luxury search" className="nav-icon hidden sm:grid">
              <Icons.Search size={18} />
            </button>

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-label={mounted && isLoggedIn ? 'Open profile menu' : 'Open account menu'}
                aria-expanded={accountOpen}
                className={`nav-icon ${mounted && isLoggedIn ? 'rounded-full border border-royal-gold/25 bg-royal-gold/10' : 'hidden sm:grid'}`}
              >
                {mounted && isLoggedIn ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_20%,#f6f0e4,#c4a15a_55%,#6b4b1d)] font-utility text-[10px] font-bold text-temple-black shadow-[0_0_22px_rgba(196,161,90,.35)]">
                    {initials || 'PD'}
                  </span>
                ) : (
                  <Icons.User size={18} />
                )}
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="luxury-popover absolute right-0 top-[calc(100%+14px)] w-[min(92vw,390px)] overflow-hidden rounded-[2rem] border border-royal-gold/20 bg-[#100d09]/88 p-4 text-cream shadow-[0_32px_90px_rgba(0,0,0,.48)] backdrop-blur-2xl"
                  >
                    <div className="absolute inset-0 temple-grain opacity-20" />
                    <div className="relative space-y-4">
                      {!isLoggedIn ? (
                        <>
                          <div className="rounded-[1.4rem] border border-royal-gold/15 bg-royal-gold/[0.04] p-5">
                            <p className="font-display text-2xl text-ivory">Welcome to Prem Dhaga</p>
                            <p className="mt-2 font-body text-xs leading-5 text-cream/55">
                              Sign in for saved addresses, wishlist, tracking, invoices and atelier rewards.
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <button type="button" onClick={() => handleDemoLogin('google')} className="account-action">
                              <span>Continue with Google</span>
                              <span>OAuth</span>
                            </button>
                            <button type="button" onClick={() => handleDemoLogin('phone')} className="account-action">
                              <span>Continue with Phone Number</span>
                              <span>OTP</span>
                            </button>
                            <button type="button" onClick={() => handleDemoLogin('email')} className="account-action">
                              <span>Continue with Email</span>
                              <span>Password</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Link href="/checkout" onClick={closeOverlays} className="account-mini-link">Create Account</Link>
                            <Link href="/checkout" onClick={closeOverlays} className="account-mini-link">Guest Checkout</Link>
                            <Link href="/account" onClick={closeOverlays} className="account-mini-link">Wishlist</Link>
                            <Link href="/collections" onClick={closeOverlays} className="account-mini-link">Recently Viewed</Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-[1.4rem] border border-royal-gold/15 bg-gradient-to-br from-royal-gold/12 via-white/[0.03] to-peacock-blue/10 p-5">
                            <div className="flex items-center gap-4">
                              <div className="grid h-14 w-14 place-items-center rounded-full border border-royal-gold/40 bg-royal-gold/15 font-display text-2xl text-royal-gold">
                                {initials || 'PD'}
                              </div>
                              <div>
                                <p className="font-display text-2xl text-ivory">Radhe Radhe, {displayName}</p>
                                <p className="font-utility text-[9px] uppercase tracking-[0.24em] text-royal-gold/80">
                                  {1080 + cartCount * 8} seva loyalty points
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-royal-gold/10 bg-temple-black/35 p-3">
                              <p className="font-utility text-[8px] uppercase tracking-[0.25em] text-cream/40">Recent order</p>
                              <p className="mt-1 font-body text-xs text-cream/70">PD-108 / Preparing in Vrindavan Atelier</p>
                            </div>
                          </div>

                          <div className="grid gap-2">
                            {[
                              ['My Profile', '/account'],
                              ['My Orders', '/account'],
                              ['Track Orders', '/order/PD-108'],
                              ['Wishlist', '/account'],
                              ['Saved Addresses', '/account'],
                              ['Payment Methods', '/account'],
                              ['Notifications', '/account'],
                              ['Support', '/account'],
                            ].map(([label, href]) => (
                              <Link key={label} href={href} onClick={closeOverlays} className="account-action">
                                <span>{label}</span>
                                <Icons.ArrowRight size={13} />
                              </Link>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                closeOverlays();
                              }}
                              className="account-action !border-lotus-pink/20 !text-lotus-pink hover:!border-lotus-pink/45"
                            >
                              <span>Logout</span>
                              <span>Secure</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="button" onClick={() => setIsOpen(true)} aria-label={`Open seva basket with ${mounted ? cartCount : 0} items`} className="nav-icon relative">
              <Icons.Cart size={19} />
              {mounted && cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-royal-gold px-1 font-utility text-[8px] font-semibold text-temple-black">{cartCount}</span>}
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="nav-icon lg:hidden"><Icons.Menu size={20} /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-temple-black/72 px-4 py-24 backdrop-blur-xl sm:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-royal-gold/20 bg-[#100d09]/95 shadow-[0_40px_120px_rgba(0,0,0,.55)]"
              role="dialog"
              aria-modal="true"
              aria-label="Luxury product search"
            >
              <div className="absolute inset-0 temple-grain opacity-20" />
              <div className="relative border-b border-royal-gold/10 p-5 sm:p-7">
                <div className="flex items-center gap-4">
                  <Icons.Search size={20} className="text-royal-gold" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search poshaks, collections, festivals..."
                    className="min-w-0 flex-1 bg-transparent font-display text-2xl text-ivory outline-none placeholder:text-cream/24 sm:text-4xl"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="nav-icon">
                    <Icons.Close size={19} />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 font-utility text-[9px] uppercase tracking-[0.22em] text-cream/38">
                  <span className="rounded-full border border-royal-gold/10 px-3 py-1">Press /</span>
                  <span className="rounded-full border border-royal-gold/10 px-3 py-1">Ctrl K</span>
                  <span className="rounded-full border border-royal-gold/10 px-3 py-1">Esc to close</span>
                </div>
              </div>

              <div className="relative grid gap-6 p-5 sm:grid-cols-[1.25fr_.75fr] sm:p-7">
                <div className="space-y-3">
                  <p className="font-utility text-[9px] uppercase tracking-[0.28em] text-royal-gold/70">Instant suggestions</p>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeOverlays} className="search-suggestion group">
                        <span className="relative h-16 w-16 overflow-hidden rounded-2xl border border-royal-gold/15 bg-deep-charcoal">
                          <Image src={item.image} alt="" fill sizes="64px" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-xl text-ivory">{item.title}</span>
                          <span className="mt-1 block font-body text-xs text-cream/45">{item.meta}</span>
                        </span>
                        <Icons.ArrowRight size={15} className="text-royal-gold/60 transition-transform duration-500 group-hover:translate-x-1" />
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-royal-gold/10 bg-white/[0.03] p-6 text-center font-body text-sm text-cream/55">
                      No exact match yet. Try a festival, colour, size, or seva moment.
                    </div>
                  )}
                </div>

                <div className="space-y-5 rounded-[1.5rem] border border-royal-gold/10 bg-white/[0.025] p-5">
                  <div>
                    <p className="font-utility text-[9px] uppercase tracking-[0.28em] text-cream/38">Recent searches</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recentSearches.map((item) => (
                        <button key={item} type="button" onClick={() => setQuery(item)} className="search-chip">{item}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-utility text-[9px] uppercase tracking-[0.28em] text-cream/38">Trending</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trendingSearches.map((item) => (
                        <button key={item} type="button" onClick={() => setQuery(item)} className="search-chip">{item}</button>
                      ))}
                    </div>
                  </div>
                  <Link href="/collections" onClick={closeOverlays} className="sacred-link group">
                    Browse all offerings <Icons.ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[80] bg-[#0b0907]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 temple-grain opacity-25" />
            <div className="relative flex h-full flex-col p-6 sm:p-10">
              <div className="flex items-center justify-between border-b border-royal-gold/15 pb-5">
                <span className="font-display text-xl tracking-[0.18em] text-ivory">PREM DHAGA</span>
                <button onClick={() => setMenuOpen(false)} className="nav-icon" aria-label="Close menu"><Icons.Close size={22} /></button>
              </div>
              <nav className="my-auto flex flex-col" aria-label="Mobile navigation">
                <motion.button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="mb-4 flex items-center justify-between rounded-[1.4rem] border border-royal-gold/15 bg-royal-gold/[0.04] px-5 py-4 text-left font-utility text-[10px] uppercase tracking-[0.25em] text-cream/70"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  Search Prem Dhaga <Icons.Search size={16} />
                </motion.button>
                {links.map((link, index) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.08 }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-royal-gold/10 py-5 font-display text-4xl font-light text-ivory">
                      {link.label}<span className="font-utility text-[9px] tracking-widest text-royal-gold">0{index + 1}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="flex items-center justify-between text-cream/45">
                <button type="button" onClick={() => { setMenuOpen(false); setAccountOpen(true); }} className="font-utility text-[10px] uppercase tracking-[0.25em]">
                  {mounted && isLoggedIn ? 'Profile' : 'Account'}
                </button>
                <span className="font-hindi text-xs" lang="hi">à¤°à¤¾à¤§à¥‡ à¤°à¤¾à¤§à¥‡</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

