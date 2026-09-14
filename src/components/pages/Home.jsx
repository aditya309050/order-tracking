'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, Kanban, Search, ArrowRight, ExternalLink, Plus } from 'lucide-react';
import { fetchOrderStats, fetchOrders } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import { socket } from '@/services/socket';
import { useUI } from '@/context/UIContext';

export default function Home() {
  const { openNewOrder } = useUI();
  const [stats, setStats] = useState({
    TOTAL: 0,
    CONFIRMED: 0,
    IN_PROCESS: 0,
    COMPLETED: 0,
    PACKED: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([fetchOrderStats(), fetchOrders({ limit: 6 })]);
      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    socket.on('order:updated', handleUpdate);
    socket.on('order:created', handleUpdate);
    return () => {
      socket.off('order:updated', handleUpdate);
      socket.off('order:created', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Summary */}
      <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>OPERATIONAL PIPELINE &bull; REAL-TIME SUPABASE SYNC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fabrication Production &amp; Order Fulfillment Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Enterprise management console connecting Office intake, Shop Floor fabrication routing, and Customer live tracking without manual reloads.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={openNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Create Work Order</span>
            </button>
            <Link
              href="/warehouseadmin"
              className="px-3.5 py-2 rounded-md bg-[#161a24] hover:bg-slate-800 text-slate-200 text-xs font-medium border border-[#1f2533] transition-colors"
            >
              Open Shop Floor Board
            </Link>
            <Link
              href="/track/ORD-1025"
              className="px-3.5 py-2 rounded-md bg-[#161a24] hover:bg-slate-800 text-blue-400 text-xs font-medium border border-[#1f2533] transition-colors flex items-center gap-1.5"
            >
              <span>Test Client Tracking (ORD-1025)</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Orders', val: stats.TOTAL, color: 'text-white', sub: 'In database' },
          { label: 'Intake Confirmed', val: stats.CONFIRMED, color: 'text-sky-300', sub: 'Awaiting floor', accent: 'text-sky-400' },
          { label: 'In Production', val: stats.IN_PROCESS, color: 'text-amber-300', sub: 'Active machines', accent: 'text-amber-400' },
          { label: 'QC Inspected', val: stats.COMPLETED, color: 'text-indigo-300', sub: 'Quality verified', accent: 'text-indigo-400' },
          { label: 'Staged', val: stats.PACKED, color: 'text-purple-300', sub: 'Loading dock', accent: 'text-purple-400' },
          { label: 'Out for Delivery', val: stats.OUT_FOR_DELIVERY, color: 'text-teal-300', sub: 'In transit', accent: 'text-teal-400' },
        ].map((k) => (
          <div key={k.label} className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
            <span className={`text-[11px] block uppercase tracking-wider font-semibold ${k.accent || 'text-slate-500'}`}>{k.label}</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${k.color}`}>{k.val}</span>
            <span className="text-[10px] text-slate-500 font-mono">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Subsystems */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Subsystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: '/officeadmin', icon: Building, color: 'text-blue-400', hover: 'group-hover:text-blue-400', title: 'Office Intake Console', desc: 'Log incoming client accounts, assign product dimensions, target completion dates, and share tracking URLs with clients.', cta: 'View Data Grid' },
            { href: '/warehouseadmin', icon: Kanban, color: 'text-amber-400', hover: 'group-hover:text-amber-400', title: 'Shop Floor & Fabrication Board', desc: 'Kanban interface for shop technicians to advance jobs across UV print beds, CNC cutters, QC sign-off, packaging, and dispatch.', cta: 'Launch Kanban' },
            { href: '/track/ORD-1025', icon: Search, color: 'text-teal-400', hover: 'group-hover:text-teal-400', title: 'Client Shipment Portal', desc: 'Real-time public portal for customers showing chronological milestone logs, driver telemetry, and delivery manifests.', cta: 'View Tracking Page' },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-lg bg-[#11141c] hover:bg-[#161a24] border border-[#1f2533] p-5 flex flex-col justify-between transition-colors group"
              >
                <div className="space-y-3">
                  <div className={`w-8 h-8 rounded bg-[#181d28] border border-[#1f2533] flex items-center justify-center ${c.color}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold text-white transition-colors ${c.hover}`}>{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{c.cta}</span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Work Orders</h2>
          <Link href="/officeadmin" className="text-xs font-medium text-blue-400 hover:text-blue-300">
            View all records &rarr;
          </Link>
        </div>
        <div className="rounded-lg bg-[#11141c] border border-[#1f2533] overflow-hidden">
          <div className="divide-y divide-[#1f2533]/80">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#161a24] transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-xs">{order.order_number}</span>
                  <div>
                    <span className="font-medium text-slate-200">{order.client_name}</span>
                    <span className="text-slate-500 text-[11px] block">
                      {order.product} ({order.quantity} units &bull; {order.dimensions || order.category})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={order.status} size="sm" />
                  <Link
                    href={`/track/${order.order_number}`}
                    className="p-1 rounded bg-[#181d28] hover:bg-slate-700 text-slate-400 hover:text-white border border-[#1f2533] transition-colors"
                    title="Track Order"
                  >
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
