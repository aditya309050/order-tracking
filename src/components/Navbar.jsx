'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  Building,
  Kanban,
  Search,
  Plus,
  LogOut,
  LogIn,
  UserCheck,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';

function NavItem({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'text-white bg-slate-800/70 rounded-md border border-slate-700/60 shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-md'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout, isOfficeAdmin, isWarehouseAdmin, isClient } = useAuth();
  const { openNewOrder } = useUI();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f2533] bg-[#090b10]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-colors">
                <Layers size={16} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-white font-mono">VANGUARD</span>
                  <span className="text-[10px] font-mono px-1.5 py-[0.1rem] rounded bg-slate-800 text-slate-400 border border-slate-700">
                    OMS v2.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Fabrication &amp; Dispatch Console</p>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1.5 border-l border-[#1f2533] pl-4">
                {isClient && (
                  <>
                    <NavItem href="/client" active={isActive('/client')}>
                      <Search size={13} className="text-blue-400" />
                      <span>My Orders</span>
                    </NavItem>
                    <NavItem href="/track" active={isActive('/track')}>
                      <Search size={13} className="text-slate-400" />
                      <span>Track Order</span>
                    </NavItem>
                  </>
                )}

                {isOfficeAdmin && (
                  <>
                    <NavItem href="/officeadmin" active={isActive('/officeadmin')}>
                      <Building size={13} className="text-blue-400" />
                      <span>Office Console</span>
                    </NavItem>
                    <NavItem href="/warehouseadmin" active={isActive('/warehouseadmin')}>
                      <Kanban size={13} className="text-amber-400" />
                      <span>Warehouse Ops</span>
                    </NavItem>
                  </>
                )}

                {isWarehouseAdmin && !isOfficeAdmin && (
                  <NavItem href="/warehouseadmin" active={isActive('/warehouseadmin')}>
                    <Kanban size={13} className="text-amber-400" />
                    <span>Warehouse Ops</span>
                  </NavItem>
                )}
              </nav>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-800/60 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Open Payload CMS Admin (/admin)"
            >
              <Database size={13} className="text-purple-400" />
              <span>CMS</span>
              <ExternalLink size={10} className="text-purple-400/80" />
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#161a24] border border-[#1f2533] text-xs">
                  <UserCheck size={13} className={isClient ? 'text-blue-400' : 'text-emerald-400'} />
                  <div className="leading-tight">
                    <span className="font-semibold text-slate-200 block text-[11px]">{user?.name}</span>
                    <span className="font-mono text-[9px] text-slate-500 block uppercase">{user?.role}</span>
                  </div>
                </div>

                {isOfficeAdmin && (
                  <button
                    onClick={openNewOrder}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
                  >
                    <Plus size={13} />
                    <span>New Order</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-[#161a24] hover:bg-slate-800 text-slate-400 hover:text-white border border-[#1f2533] text-xs transition-colors"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline text-[11px]">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
              >
                <LogIn size={13} />
                <span>Portal Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {isAuthenticated && (
          <div className="flex md:hidden items-center justify-around py-1.5 border-t border-[#1f2533]">
            {isClient && (
              <>
                <NavItem href="/client" active={isActive('/client')}>
                  <span className="text-xs">My Orders</span>
                </NavItem>
                <NavItem href="/track" active={isActive('/track')}>
                  <span className="text-xs">Track Order</span>
                </NavItem>
              </>
            )}
            {isOfficeAdmin && (
              <>
                <NavItem href="/officeadmin" active={isActive('/officeadmin')}>
                  <span className="text-xs">Office</span>
                </NavItem>
                <NavItem href="/warehouseadmin" active={isActive('/warehouseadmin')}>
                  <span className="text-xs">Warehouse</span>
                </NavItem>
              </>
            )}
            {isWarehouseAdmin && !isOfficeAdmin && (
              <NavItem href="/warehouseadmin" active={isActive('/warehouseadmin')}>
                <span className="text-xs">Warehouse</span>
              </NavItem>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
