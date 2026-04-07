'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

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
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-tertiary-fixed-dim selection:text-tertiary">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-tertiary-fixed-dim selection:text-tertiary">
      {sidebar}
      {navbar}
      <div className="ml-0 lg:ml-72 relative transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
