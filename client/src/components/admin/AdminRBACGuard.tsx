'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { AdminRole, ROLE_LABELS } from '@/types/admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminRBACGuardProps {
  allowedRoles: AdminRole[];
  children: React.ReactNode;
}

export default function AdminRBACGuard({ allowedRoles, children }: AdminRBACGuardProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role as AdminRole) || 'customer';

  useEffect(() => {
    if (mounted && (!isLoggedIn || !user)) {
      router.push('/admin/login');
    }
  }, [mounted, isLoggedIn, user, router]);

  // If not logged in, return null while redirecting to login page
  if (!mounted || !isLoggedIn || !user) {
    return null;
  }

  // Super admin and admin bypass restrictions for DX & emergency override
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
  const hasAccess = isSuperAdmin || allowedRoles.includes(userRole);

  if (!hasAccess) {
    const roleConfig = ROLE_LABELS[userRole] || { title: userRole, color: 'bg-slate-800 text-slate-300' };

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold text-slate-100">Access Restricted</h2>
          <span className={`px-2.5 py-0.5 text-xs font-mono rounded-full border ${roleConfig.color}`}>
            {roleConfig.title}
          </span>
        </div>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Your assigned role does not have permission to view or manage this specific module. Contact your Super Admin to request additional privilege grants.
        </p>
        <Link
          href="/admin"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
        >
          Return to Overview
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
