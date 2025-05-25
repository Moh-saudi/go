'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  // Check if the current path is a dashboard path
  const isDashboardPath = pathname.startsWith('/dashboard');

  // If not a dashboard path, render only the children
  if (!isDashboardPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-auto pt-16">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 