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
      <div className="bg-white text-zinc-900 min-h-screen font-body">
        {children}
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="bg-white text-zinc-900 min-h-screen font-body selection:bg-zinc-900 selection:text-white">
        {sidebar}
        {navbar}
        <div className="ml-0 lg:ml-72 pt-14 min-h-screen bg-white">
          {children}
        </div>
      </div>
    </AdminProvider>
  );
}
