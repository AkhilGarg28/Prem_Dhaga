import React from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const metadata = {
  title: 'Prem Dhaga | Admin Portal',
  description: 'Enterprise Management System for Prem Dhaga',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
