'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../store/useCart';
import { useAuth } from '../store/useAuth';
import { Icons } from './Icons';

import AuthModal from './AuthModal';

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
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const setIsOpen = useCart((state) => state.setIsOpen);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // Lock body/html scroll when account drawer or mobile menu overlay is open
  useEffect(() => {
    if (accountOpen || menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      (window as any).lenis?.stop();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      (window as any).lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      (window as any).lenis?.start();
    };
  }, [accountOpen, menuOpen]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [query, setQuery] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name?.trim() || 'Devotee';
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

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    closeOverlays();
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

              {accountOpen && (
                <>
                  {/* FULL SCREEN BACKDROP VEIL ON MOBILE */}
                  <div
                    className="fixed inset-0 bg-black/85 backdrop-blur-2xl z-[9998] md:hidden animate-fade-in"
                    onClick={closeOverlays}
                  />

                  <div
                    className="luxury-popover fixed inset-y-0 right-0 z-[9999] w-full max-w-full sm:max-w-[420px] h-full h-[100dvh] flex flex-col bg-[#100d09]/98 border-l border-royal-gold/25 text-cream shadow-[0_32px_90px_rgba(0,0,0,.85)] overflow-hidden backdrop-blur-2xl md:absolute md:inset-auto md:right-0 md:top-[calc(100%+12px)] md:w-[390px] md:h-auto md:max-h-[calc(100vh-100px)] md:rounded-[2rem] md:border md:shadow-2xl animate-fade-in"
                  >
                    <div className="absolute inset-0 temple-grain opacity-20 pointer-events-none" />

                    {/* FIXED HEADER SECTION (MOBILE CLOSE BAR + USER PROFILE SUMMARY) */}
                    <div
                      className="shrink-0 z-10 border-b border-royal-gold/15 bg-gradient-to-b from-royal-gold/[0.08] via-[#14100b] to-[#100d09] p-5 space-y-3.5"
                      style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
                    >
                      {/* MOBILE CLOSE BAR */}
                      <div className="flex items-center justify-between md:hidden">
                        <span className="font-display text-lg tracking-[0.15em] text-ivory">PREM DHAGA ACCOUNT</span>
                        <button
                          type="button"
                          onClick={closeOverlays}
                          className="w-9 h-9 rounded-full border border-royal-gold/20 flex items-center justify-center text-warm-beige/60 hover:text-royal-gold transition-colors shrink-0 active:scale-95"
                          aria-label="Close account menu"
                        >
                          <Icons.Close size={18} />
                        </button>
                      </div>

                      {/* PROFILE SUMMARY BADGE */}
                      {!isLoggedIn ? (
                        <div className="rounded-[1.2rem] border border-royal-gold/15 bg-royal-gold/[0.04] p-4">
                          <p className="font-display text-xl text-ivory">Welcome to Prem Dhaga</p>
                          <p className="mt-1 font-body text-xs leading-5 text-cream/55">
                            Sign in with your Email or Phone to access saved addresses, wishlist, order tracking and rewards.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-[1.2rem] border border-royal-gold/20 bg-gradient-to-br from-royal-gold/15 via-white/[0.03] to-peacock-blue/10 p-4 shadow-inner">
                          <div className="flex items-center gap-3.5">
                            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-royal-gold/40 bg-royal-gold/15 font-display text-xl text-royal-gold shadow-md shrink-0">
                              {initials || 'PD'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-lg text-ivory truncate">Radhe Radhe, {displayName}</p>
                              <p className="font-utility text-[9px] uppercase tracking-[0.22em] text-royal-gold/90 mt-0.5">
                                {(user as any)?.sevaPoints || 0} seva loyalty points
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-xl border border-royal-gold/10 bg-temple-black/40 p-2.5 flex items-center justify-between">
                            <span className="font-utility text-[8px] uppercase tracking-[0.2em] text-cream/40">Recent Order</span>
                            <span className="font-body text-[11px] text-warm-beige/50 font-medium italic">No recent orders</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SCROLLABLE MENU SECTION (INTERNAL SCROLL ONLY) */}
                    <div
                      className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2.5 overscroll-contain touch-pan-y md:max-h-[360px]"
                      style={{ paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom))' }}
                    >
                      {!isLoggedIn ? (
                        <>
                          <div className="grid gap-2.5">
                            <button type="button" onClick={() => openAuth('login')} className="mobile-touch-card">
                              <span>Sign In with Credentials</span>
                              <Icons.ArrowRight size={16} />
                            </button>
                            <button type="button" onClick={() => openAuth('register')} className="mobile-touch-card">
                              <span>Create Devotional ID</span>
                              <Icons.ArrowRight size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Link href="/register" onClick={closeOverlays} className="account-mini-link text-center py-2.5">Register ID</Link>
                            <Link href="/login" onClick={closeOverlays} className="account-mini-link text-center py-2.5">Sign In</Link>
                            <Link href="/checkout" onClick={closeOverlays} className="account-mini-link text-center py-2.5">Checkout</Link>
                            <Link href="/collections" onClick={closeOverlays} className="account-mini-link text-center py-2.5">Browse Offerings</Link>
                          </div>
                        </>
                      ) : (
                        <div className="grid gap-2.5">
                          {[
                            ['My Profile', '/account'],
                            ['My Orders', '/account'],
                            ['Track Orders', '/account'],
                            ['Spiritual Wishlist', '/account'],
                            ['Saved Addresses', '/account'],
                            ['Payment Methods', '/account'],
                            ['Notifications', '/account'],
                            ['Support Desk', '/account'],
                          ].map(([label, href]) => (
                            <Link key={label} href={href} onClick={closeOverlays} className="mobile-touch-card">
                              <span>{label}</span>
                              <Icons.ArrowRight size={16} />
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              closeOverlays();
                            }}
                            className="mobile-touch-card mobile-touch-card-danger"
                          >
                            <span>Logout</span>
                            <Icons.ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button type="button" onClick={() => setIsOpen(true)} aria-label={`Open seva basket with ${mounted ? cartCount : 0} items`} className="nav-icon relative">
              <Icons.Cart size={19} />
              {mounted && cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-royal-gold px-1 font-utility text-[8px] font-semibold text-temple-black">{cartCount}</span>}
            </button>
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="nav-icon lg:hidden"><Icons.Menu size={20} /></button>
          </div>
        </div>
      </header>

      {searchOpen && (
          <div
            className="fixed inset-0 z-[90] bg-temple-black/72 px-4 py-24 backdrop-blur-xl sm:px-8 animate-fade-in"
          >
            <div
              ref={searchRef}
              className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] animate-scale-in border border-royal-gold/20 bg-[#100d09]/95 shadow-[0_40px_120px_rgba(0,0,0,.55)]"
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
            </div>
          </div>
        )}

      {menuOpen && (
          <div className="fixed inset-0 z-[80] bg-[#0b0907] animate-fade-in">
            <div className="absolute inset-0 temple-grain opacity-25" />
            <div className="relative flex h-full flex-col p-6 sm:p-10">
              <div className="flex items-center justify-between border-b border-royal-gold/15 pb-5">
                <span className="font-display text-xl tracking-[0.18em] text-ivory">PREM DHAGA</span>
                <button onClick={() => setMenuOpen(false)} className="nav-icon" aria-label="Close menu"><Icons.Close size={22} /></button>
              </div>
              <nav className="my-auto flex flex-col" aria-label="Mobile navigation">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="mb-4 flex items-center justify-between rounded-[1.4rem] animate-slide-right border border-royal-gold/15 bg-royal-gold/[0.04] px-5 py-4 text-left font-utility text-[10px] uppercase tracking-[0.25em] text-cream/70"
                >
                  Search Prem Dhaga <Icons.Search size={16} />
                </button>
                {links.map((link, index) => (
                  <div key={link.href} className="animate-slide-right" style={{ animationDelay: `${100 + index * 80}ms` }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-royal-gold/10 py-5 font-display text-4xl font-light text-ivory">
                      {link.label}<span className="font-utility text-[9px] tracking-widest text-royal-gold">0{index + 1}</span>
                    </Link>
                  </div>
                ))}
              </nav>
              <div className="flex items-center justify-between text-cream/45">
                <button type="button" onClick={() => { setMenuOpen(false); setAccountOpen(true); }} className="font-utility text-[10px] uppercase tracking-[0.25em]">
                  {mounted && isLoggedIn ? 'Profile' : 'Account'}
                </button>
                <span className="font-hindi text-xs" lang="hi">à¤°à¤¾à¤§à¥‡ à¤°à¤¾à¤§à¥‡</span>
              </div>
            </div>
          </div>
        )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}

