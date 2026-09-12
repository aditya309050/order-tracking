import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Kanban, 
  Search, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Truck, 
  Package, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Plus
} from 'lucide-react';
import { fetchOrderStats, fetchOrders } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { socket } from '../services/socket';

export default function Home({ onOpenNewOrder }) {
  const [stats, setStats] = useState({
    TOTAL: 0,
    CONFIRMED: 0,
    IN_PROCESS: 0,
    COMPLETED: 0,
    PACKED: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetchOrderStats(),
        fetchOrders({ limit: 6 })
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    socket.on('order:updated', handleUpdate);
    socket.on('order:created', handleUpdate);

    return () => {
      socket.off('order:updated', handleUpdate);
      socket.off('order:created', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Summary Section */}
      <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>OPERATIONAL PIPELINE &bull; REAL-TIME WEBSOCKET SYNC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fabrication Production & Order Fulfillment Operations
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Enterprise management console connecting Office intake, Shop Floor fabrication routing, and Customer live tracking without manual reloads.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Create Work Order</span>
            </button>
            <Link
              to="/warehouse"
              className="px-3.5 py-2 rounded-md bg-[#161a24] hover:bg-slate-800 text-slate-200 text-xs font-medium border border-[#1f2533] transition-colors"
            >
              Open Shop Floor Board
            </Link>
            <Link
              to="/track/ORD-1025"
              className="px-3.5 py-2 rounded-md bg-[#161a24] hover:bg-slate-800 text-blue-400 text-xs font-medium border border-[#1f2533] transition-colors flex items-center gap-1.5"
            >
              <span>Test Client Tracking (ORD-1025)</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* High-density KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Total Orders</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">{stats.TOTAL}</span>
          <span className="text-[10px] text-slate-500 font-mono">In database</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-sky-400 block uppercase tracking-wider font-semibold">Intake Confirmed</span>
          <span className="text-xl font-bold font-mono text-sky-300 mt-1 block">{stats.CONFIRMED}</span>
          <span className="text-[10px] text-slate-500 font-mono">Awaiting floor</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-amber-400 block uppercase tracking-wider font-semibold">In Production</span>
          <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">{stats.IN_PROCESS}</span>
          <span className="text-[10px] text-slate-500 font-mono">Active machines</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-indigo-400 block uppercase tracking-wider font-semibold">QC Inspected</span>
          <span className="text-xl font-bold font-mono text-indigo-300 mt-1 block">{stats.COMPLETED}</span>
          <span className="text-[10px] text-slate-500 font-mono">Quality verified</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-purple-400 block uppercase tracking-wider font-semibold">Staged</span>
          <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">{stats.PACKED}</span>
          <span className="text-[10px] text-slate-500 font-mono">Loading dock</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1f2533]">
          <span className="text-[11px] text-teal-400 block uppercase tracking-wider font-semibold">Out for Delivery</span>
          <span className="text-xl font-bold font-mono text-teal-300 mt-1 block">{stats.OUT_FOR_DELIVERY}</span>
          <span className="text-[10px] text-slate-500 font-mono">In transit</span>
        </div>
      </div>

      {/* Role Console Switcher */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operational Subsystems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Office Intake */}
          <Link
            to="/office"
            className="rounded-lg bg-[#11141c] hover:bg-[#161a24] border border-[#1f2533] p-5 flex flex-col justify-between transition-colors group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-[#181d28] border border-[#1f2533] flex items-center justify-center text-blue-400">
                <Building size={16} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Office Intake Console
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Log incoming client accounts, assign product dimensions, target completion dates, and share tracking URLs with clients.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>View Data Grid</span>
              <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Shop Floor Kanban */}
          <Link
            to="/warehouse"
            className="rounded-lg bg-[#11141c] hover:bg-[#161a24] border border-[#1f2533] p-5 flex flex-col justify-between transition-colors group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-[#181d28] border border-[#1f2533] flex items-center justify-center text-amber-400">
                <Kanban size={16} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Shop Floor & Fabrication Board
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Kanban interface for shop technicians to advance jobs across UV print beds, CNC cutters, QC sign-off, packaging, and dispatch.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Launch Kanban</span>
              <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Customer Portal */}
          <Link
            to="/track/ORD-1025"
            className="rounded-lg bg-[#11141c] hover:bg-[#161a24] border border-[#1f2533] p-5 flex flex-col justify-between transition-colors group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-[#181d28] border border-[#1f2533] flex items-center justify-center text-teal-400">
                <Search size={16} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">
                  Client Shipment Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time public portal for customers showing chronological milestone logs, driver telemetry, and delivery manifests.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>View Tracking Page</span>
              <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Work Orders
          </h2>
          <Link
            to="/office"
            className="text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            View all records &rarr;
          </Link>
        </div>

        <div className="rounded-lg bg-[#11141c] border border-[#1f2533] overflow-hidden">
          <div className="divide-y divide-[#1f2533]/80">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#161a24] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-xs">
                    {order.order_number}
                  </span>
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
                    to={`/track/${order.order_number}`}
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
