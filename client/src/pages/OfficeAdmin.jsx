import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Eye, 
  Check, 
  Calendar, 
  Package, 
  Phone,
  RefreshCw,
  Key,
  Building,
  Database
} from 'lucide-react';
import { fetchOrders } from '../services/api';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';
import OrderDetailModal from '../components/OrderDetailModal';
import { socket } from '../services/socket';
import { Link } from 'react-router-dom';

export default function OfficeAdmin({ onOpenNewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCredId, setCopiedCredId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({
        status: selectedStatus,
        search: searchTerm
      });
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleUpdate = (updatedOrder) => {
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === updatedOrder.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedOrder;
          return next;
        }
        return [updatedOrder, ...prev];
      });

      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    };

    const handleCreate = (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    };

    socket.on('order:updated', handleUpdate);
    socket.on('order:created', handleCreate);

    return () => {
      socket.off('order:updated', handleUpdate);
      socket.off('order:created', handleCreate);
    };
  }, [selectedOrder]);

  const handleCopyLink = (orderNumber) => {
    const link = `${window.location.origin}/track/${orderNumber}`;
    navigator.clipboard.writeText(link);
    setCopiedId(orderNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCredentials = (order) => {
    const credText = `Vanguard Order Tracking Login:
Order: ${order.order_number} (${order.product})
Portal URL: ${window.location.origin}/login
Client ID: ${order.client_access_id || 'client_' + order.order_number}
Password: ${order.client_password || 'pass1234'}`;
    navigator.clipboard.writeText(credText);
    setCopiedCredId(order.order_number);
    setTimeout(() => setCopiedCredId(null), 2500);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return 'WO';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2533]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Order Intake & Client Accounts
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161a24] text-slate-300 border border-[#1f2533]">
              {orders.length} RECORDS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log work orders, provision client credentials, and monitor customer order lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            title="Refresh"
            className="p-2 rounded-md bg-[#11141c] border border-[#1f2533] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <a
            href="http://localhost:3001/admin"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-800/50 rounded-md text-xs font-semibold transition-colors"
            title="Open Payload CMS Editorial Admin (port 3001)"
          >
            <Database size={13} />
            <span className="hidden sm:inline">Payload CMS</span>
            <ExternalLink size={11} className="text-purple-400" />
          </a>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
          >
            <Plus size={14} />
            <span>Create Client Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order #, Client Name, Product..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#11141c] border border-[#1f2533] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              selectedStatus === 'ALL'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-[#11141c] text-slate-400 hover:text-slate-200 border border-[#1f2533]'
            }`}
          >
            All
          </button>

          {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setSelectedStatus(key)}
              className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedStatus === key
                  ? 'bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold'
                  : 'bg-[#11141c] text-slate-400 hover:text-slate-200 border border-[#1f2533]'
              }`}
            >
              {conf.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Grid */}
      <div className="rounded-lg bg-[#11141c] border border-[#1f2533] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1f2533] bg-[#0e1118] text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3 font-mono">Order #</th>
                <th className="py-2.5 px-3">Client Account</th>
                <th className="py-2.5 px-3">Fabrication Item</th>
                <th className="py-2.5 px-3">Routing Status</th>
                <th className="py-2.5 px-3">Client Portal Credentials</th>
                <th className="py-2.5 px-3">Target Due</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2533]/80">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <Package size={24} className="mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-xs font-medium text-slate-300">No records found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Adjust filter criteria or click Create Client Order</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#161a24] transition-colors group"
                  >
                    {/* Order # */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">
                          {order.order_number}
                        </span>
                        {order.priority && order.priority !== 'NORMAL' && (
                          <span className="text-[9px] font-bold px-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                            {order.priority}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client Name with Avatar Initials */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#1f2533] border border-slate-700 flex items-center justify-center text-[10px] font-mono font-semibold text-slate-300 shrink-0">
                          {getInitials(order.client_name)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{order.client_name}</div>
                          <div className="text-[10px] text-slate-500">{order.client_phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Item & Specs */}
                    <td className="py-2.5 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-xs">
                        {order.product}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        QTY: {order.quantity} &bull; {order.dimensions || order.category}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    {/* Client Credentials & Copy */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="leading-tight">
                          <span className="font-mono text-[11px] text-blue-400 font-medium block">
                            {order.client_access_id || 'client_' + order.order_number.toLowerCase().replace('-', '_')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 block">
                            PIN: {order.client_password || 'pass1234'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCredentials(order)}
                          title="Copy Client Login ID & Password for sharing"
                          className="p-1 rounded bg-[#161a24] hover:bg-slate-700 text-slate-400 hover:text-white border border-[#1f2533] transition-colors"
                        >
                          {copiedCredId === order.order_number ? (
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                              <Check size={11} />
                            </span>
                          ) : (
                            <Key size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-[11px] font-mono text-slate-400">
                      {order.estimated_delivery || 'Not set'}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          title="View Ledger & Specs"
                          className="p-1 rounded bg-[#161a24] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={() => handleCopyLink(order.order_number)}
                          title="Copy Client Tracking URL"
                          className="p-1 rounded bg-[#161a24] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === order.order_number ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>

                        <Link
                          to={`/track/${order.order_number}`}
                          target="_blank"
                          title="Open Client Portal"
                          className="p-1 rounded bg-[#161a24] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          order={selectedOrder}
        />
      )}

    </div>
  );
}
