'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider, useUI } from '@/context/UIContext';
import Navbar from '@/components/Navbar';
import NewOrderModal from '@/components/NewOrderModal';

function NewOrderModalHost() {
  const { isNewOrderOpen, closeNewOrder } = useUI();
  const router = useRouter();

  return (
    <NewOrderModal
      isOpen={isNewOrderOpen}
      onClose={closeNewOrder}
      onOrderCreated={() => {
        closeNewOrder();
        router.refresh();
      }}
    />
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1f2533] bg-[#06080c]/60 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
            <Layers size={13} />
          </div>
          <span className="font-mono">
            <span className="text-slate-300 font-semibold">VANGUARD</span> OMS &bull; Fabrication &amp; Dispatch
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/track/ORD-1025" className="hover:text-slate-300 transition-colors">
            Track an order
          </Link>
          <Link href="/admin" className="hover:text-slate-300 transition-colors">
            Admin CMS
          </Link>
          <span className="text-slate-600">&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <UIProvider>
        <div className="min-h-screen text-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
          <Footer />
        </div>
        <NewOrderModalHost />
      </UIProvider>
    </AuthProvider>
  );
}
