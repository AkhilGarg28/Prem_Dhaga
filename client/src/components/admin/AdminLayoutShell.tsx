'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { ADMIN_NAV_ITEMS, AdminRole, ROLE_LABELS, NavItem } from '@/types/admin';

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout, setUser } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userRole = (user?.role as AdminRole) || 'super_admin';
  const roleConfig = ROLE_LABELS[userRole] || { title: userRole, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };

  // Listen for keyboard shortcuts: "/" or "Cmd+K" or "Ctrl+K"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdPaletteOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter command palette items
  const filteredNavItems = ADMIN_NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(cmdSearchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(cmdSearchQuery.toLowerCase())
  );

  const categories = ['Core', 'Catalog', 'Growth', 'System'] as const;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname !== '/admin/login' && (!isLoggedIn || !user)) {
      router.push('/admin/login');
    }
  }, [mounted, isLoggedIn, user, pathname, router]);

  // Don't wrap login page inside admin shell layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!mounted || !isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-[#12141D]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo & Brand */}
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-base group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-serif font-medium text-slate-200 group-hover:text-amber-300 transition-colors hidden sm:inline-block">
              Prem Dhaga <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-sans ml-1">Admin</span>
            </span>
          </Link>

          {/* Path Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-mono pl-4 border-l border-slate-800">
            <span>portal</span>
            <span>/</span>
            <span className="text-slate-200 capitalize">{pathname.split('/')[2] || 'overview'}</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">Quick Jump...</span>
            <kbd className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
          </button>

          {/* Role Tester Selector (DX Feature) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-lg">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Test Role:</span>
            <select
              data-testid="admin-role-tester-select"
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as AdminRole;
                if (user) {
                  setUser({ ...user, role: newRole });
                } else {
                  setUser({ id: 'demo_id', name: 'Admin User', email: 'admin@premdhaga.com', role: newRole });
                }
              }}
              className="bg-transparent text-amber-300 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {Object.keys(ROLE_LABELS).map((roleKey) => (
                <option key={roleKey} value={roleKey} className="bg-slate-900 text-slate-100">
                  {ROLE_LABELS[roleKey as AdminRole].title} ({roleKey})
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-medium text-amber-300">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#12141D] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-fade-down">
                <div className="pb-3 border-b border-slate-800">
                  <p className="text-xs font-medium text-slate-100 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email || 'admin@premdhaga.com'}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded border ${roleConfig.color}`}>
                      {roleConfig.title}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    View Live Storefront ↗
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      router.push('/admin/login');
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Shell */}
        <aside
          className={`${
            isSidebarOpen ? 'w-60' : 'w-0 border-r-0'
          } transition-all duration-200 ease-in-out border-r border-slate-800/80 bg-[#0C0E16] flex flex-col shrink-0 overflow-y-auto z-30 select-none`}
        >
          <div className="p-3 space-y-5">
            {categories.map((cat) => {
              const categoryItems = ADMIN_NAV_ITEMS.filter((item) => item.category === cat);
              if (categoryItems.length === 0) return null;

              return (
                <div key={cat}>
                  <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    {cat}
                  </p>
                  <nav className="space-y-0.5">
                    {categoryItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                      const isRoleAllowed = userRole === 'super_admin' || userRole === 'admin' || item.roles.includes(userRole);

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={(e) => {
                            if (!isRoleAllowed) {
                              e.preventDefault();
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors font-medium ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20 shadow-sm'
                              : isRoleAllowed
                              ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                              : 'text-slate-400 hover:bg-slate-900/40 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {!isRoleAllowed && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1 py-0.5 rounded">
                              Lock
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Prem Dhaga v1.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090A0F]">
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      {isCmdPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-[#12141D] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center px-4 py-3 border-b border-slate-800">
              <svg className="w-4 h-4 text-slate-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                value={cmdSearchQuery}
                onChange={(e) => setCmdSearchQuery(e.target.value)}
                placeholder="Search modules, pages, or settings..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <kbd className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">ESC</kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredNavItems.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center font-mono">No matching modules found.</p>
              ) : (
                filteredNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsCmdPaletteOpen(false);
                      setCmdSearchQuery('');
                      router.push(item.href);
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-slate-800/70 text-slate-200 hover:text-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">({item.category})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">{item.href}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
