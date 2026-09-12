import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Building, 
  Kanban, 
  Search, 
  Plus, 
  LogOut,
  LogIn,
  UserCheck,
  ShieldAlert,
  Database,
  ExternalLink
} from 'lucide-react';
import { socket } from '../services/socket';
import { isSupabaseConfigured } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenNewOrder }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user, isAuthenticated, logout, isOfficeAdmin, isWarehouseAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive
        ? 'text-white bg-slate-800/70 rounded-md border border-slate-700/60 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-md'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f2533] bg-[#090b10]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-colors">
                <Layers size={16} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-white font-mono">
                    VANGUARD
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    OMS v2.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Fabrication & Dispatch Console</p>
              </div>
            </Link>

            {/* Navigation Tabs Based on Role */}
            <nav className="hidden md:flex items-center gap-1 border-l border-[#1f2533] pl-4">
              <NavLink to="/" end className={navItemClass}>
                <span>Overview</span>
              </NavLink>

              {/* Office Admin Tabs */}
              {isOfficeAdmin && (
                <>
                  <NavLink to="/officeadmin" className={navItemClass}>
                    <Building size={13} className="text-slate-400" />
                    <span>Office Intake</span>
                  </NavLink>
                  <NavLink to="/warehouseadmin" className={navItemClass}>
                    <Kanban size={13} className="text-slate-400" />
                    <span>Shop Floor</span>
                  </NavLink>
                  <a 
                    href="http://localhost:3001/admin" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-md border border-purple-800/40 transition-colors"
                    title="Open Payload CMS Editorial Admin (/admin on port 3001)"
                  >
                    <Database size={13} />
                    <span>Payload CMS</span>
                    <ExternalLink size={10} className="text-purple-400/80" />
                  </a>
                </>
              )}

              {/* Warehouse Admin Tab */}
              {isWarehouseAdmin && (
                <NavLink to="/warehouseadmin" className={navItemClass}>
                  <Kanban size={13} className="text-slate-400" />
                  <span>Shop Floor</span>
                </NavLink>
              )}

              {/* Client Portal Tab */}
              {isClient && (
                <NavLink to="/client" className={navItemClass}>
                  <Search size={13} className="text-slate-400" />
                  <span>My Orders & Tracking</span>
                </NavLink>
              )}

              {/* Public/Unauthenticated Quick Demo Tracking */}
              {!isAuthenticated && (
                <NavLink to="/track/ORD-1025" className={navItemClass}>
                  <Search size={13} className="text-slate-400" />
                  <span>Tracking Demo</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* Right actions: User identity, Live Status, Logout / Login */}
          <div className="flex items-center gap-2.5">
            {/* Live Socket Status */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                isConnected
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span>{isConnected ? (isSupabaseConfigured() ? 'SUPABASE CLOUD' : 'LIVE SYNC') : 'CONNECTING'}</span>
            </div>

            {/* If Authenticated: User Badge & Role */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#161a24] border border-[#1f2533] text-xs">
                  <UserCheck size={13} className={isClient ? 'text-blue-400' : 'text-emerald-400'} />
                  <div className="leading-tight">
                    <span className="font-semibold text-slate-200 block text-[11px]">{user.name}</span>
                    <span className="font-mono text-[9px] text-slate-500 block uppercase">{user.role}</span>
                  </div>
                </div>

                {isOfficeAdmin && onOpenNewOrder && (
                  <button
                    onClick={onOpenNewOrder}
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
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
              >
                <LogIn size={13} />
                <span>Portal Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-1.5 border-t border-[#1f2533]">
          <NavLink to="/" end className={navItemClass}>
            <span className="text-xs">Overview</span>
          </NavLink>

          {isOfficeAdmin && (
            <>
              <NavLink to="/officeadmin" className={navItemClass}>
                <span className="text-xs">Office</span>
              </NavLink>
              <NavLink to="/warehouseadmin" className={navItemClass}>
                <span className="text-xs">Warehouse</span>
              </NavLink>
            </>
          )}

          {isWarehouseAdmin && (
            <NavLink to="/warehouseadmin" className={navItemClass}>
              <span className="text-xs">Warehouse</span>
            </NavLink>
          )}

          {isClient && (
            <NavLink to="/client" className={navItemClass}>
              <span className="text-xs">My Orders</span>
            </NavLink>
          )}

          {!isAuthenticated && (
            <NavLink to="/login" className={navItemClass}>
              <span className="text-xs">Sign In</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
