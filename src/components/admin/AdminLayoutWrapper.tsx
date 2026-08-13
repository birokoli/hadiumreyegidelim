'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminProvider } from './AdminContext';

export default function AdminLayoutWrapper({
  children,
  sidebar,
  navbar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body">
        {children}
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-tertiary-fixed-dim selection:text-on-tertiary-fixed">
        {sidebar}
        {navbar}
        <div className="ml-0 lg:ml-72 pt-14 min-h-screen bg-surface">
          {children}
        </div>
      </div>
    </AdminProvider>
  );
}
