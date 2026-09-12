import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Clock, 
  Cog, 
  CheckCircle2, 
  Package, 
  Truck, 
  CheckCheck, 
  Eye, 
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Building,
  Check
} from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DispatchModal from '../components/DispatchModal';
import OrderDetailModal from '../components/OrderDetailModal';
import { socket } from '../services/socket';

const PIPELINE_COLUMNS = [
  { id: 'CONFIRMED', title: 'Work Order Intake', nextStatus: 'IN_PROCESS', nextAction: 'Route to Floor', icon: Clock, accent: 'border-t-sky-500' },
  { id: 'IN_PROCESS', title: 'Active Production', nextStatus: 'COMPLETED', nextAction: 'Sign Off QC', icon: Cog, accent: 'border-t-amber-500' },
  { id: 'COMPLETED', title: 'Inspection Passed', nextStatus: 'PACKED', nextAction: 'Stage & Package', icon: CheckCircle2, accent: 'border-t-indigo-500' },
  { id: 'PACKED', title: 'Staged for Transit', nextStatus: 'OUT_FOR_DELIVERY', nextAction: 'Assign Carrier', icon: Package, accent: 'border-t-purple-500' },
  { id: 'OUT_FOR_DELIVERY', title: 'Out with Driver', nextStatus: 'DELIVERED', nextAction: 'Confirm Delivery', icon: Truck, accent: 'border-t-teal-500' },
  { id: 'DELIVERED', title: 'Fulfilled & Closed', nextStatus: null, nextAction: null, icon: CheckCheck, accent: 'border-t-emerald-500' }
];

export default function WarehouseAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('board');
  
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [recentNotification, setRecentNotification] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching warehouse orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const handleUpdate = (updatedOrder) => {
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === updatedOrder.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = updatedOrder;
          return copy;
        }
        return [updatedOrder, ...prev];
      });

      setRecentNotification({
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        client: updatedOrder.client_name
      });
      setTimeout(() => setRecentNotification(null), 3500);
    };

    const handleCreate = (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      setRecentNotification({
        order_number: newOrder.order_number,
        status: 'CONFIRMED',
        client: newOrder.client_name,
        isNew: true
      });
      setTimeout(() => setRecentNotification(null), 3500);
    };

    socket.on('order:updated', handleUpdate);
    socket.on('order:created', handleCreate);

    return () => {
      socket.off('order:updated', handleUpdate);
      socket.off('order:created', handleCreate);
    };
  }, []);

  const handleAdvanceStatus = async (order, targetStatus, actionLabel) => {
    if (targetStatus === 'OUT_FOR_DELIVERY') {
      setDispatchOrder(order);
      return;
    }

    try {
      setActionLoadingId(order.id);
      await updateOrderStatus(order.id, {
        status: targetStatus,
        actor_role: 'WAREHOUSE',
        note: `Shop floor transition to ${targetStatus} (${actionLabel})`
      });
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDispatch = async (dispatchData) => {
    if (!dispatchOrder) return;
    try {
      setActionLoadingId(dispatchOrder.id);
      await updateOrderStatus(dispatchOrder.id, {
        status: 'OUT_FOR_DELIVERY',
        actor_role: 'LOGISTICS',
        delivery_driver: dispatchData.delivery_driver,
        driver_phone: dispatchData.driver_phone,
        tracking_number: dispatchData.tracking_number,
        note: dispatchData.note
      });
    } catch (err) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
      setDispatchOrder(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      o.client_name.toLowerCase().includes(term) ||
      o.product.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2533]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Shop Floor Operations & Pipeline
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161a24] text-slate-300 border border-[#1f2533]">
              {orders.length} ACTIVE JOBS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time routing across CNC, print beds, quality control, and carrier loading docks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search box */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter jobs by ID or Client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#11141c] border border-[#1f2533] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-[#11141c] border border-[#1f2533] rounded-md p-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'board' ? 'bg-[#1f2533] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Board View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list' ? 'bg-[#1f2533] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={loadOrders}
            title="Refresh"
            className="p-1.5 rounded-md bg-[#11141c] border border-[#1f2533] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Real-time Ticker */}
      {recentNotification && (
        <div className="px-3.5 py-2 rounded-md bg-[#161a24] border border-blue-900/50 text-blue-200 text-xs flex items-center justify-between font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>
              <strong>EVENT:</strong> {recentNotification.order_number} ({recentNotification.client}) &rarr; <span className="text-white">{recentNotification.status}</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400">BROADCASTED</span>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const colOrders = filteredOrders.filter(o => o.status === col.id);
            const ColIcon = col.icon;

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-lg bg-[#0e1118] border border-[#1f2533] border-t-2 ${col.accent} min-h-[560px] overflow-hidden shadow-sm`}
              >
                {/* Column Header */}
                <div className="px-3 py-2.5 border-b border-[#1f2533] bg-[#11141c] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ColIcon size={13} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-200 tracking-tight">{col.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181d28] text-slate-400 border border-[#1f2533]">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards Column */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                  {colOrders.length === 0 ? (
                    <div className="py-12 text-center text-slate-600 text-[11px]">
                      Queue clear
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const isWorking = actionLoadingId === order.id;

                      return (
                        <div
                          key={order.id}
                          className="rounded-md bg-[#131720] hover:bg-[#181d28] border border-[#1f2533] p-3 space-y-2.5 transition-colors shadow-sm text-xs group"
                        >
                          {/* Order # and Priority Tag */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-white text-xs tracking-tight">
                              {order.order_number}
                            </span>
                            <div className="flex items-center gap-1">
                              {order.priority && order.priority !== 'NORMAL' && (
                                <span className="text-[9px] font-mono font-bold px-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                                  {order.priority}
                                </span>
                              )}
                              <button
                                onClick={() => setDetailOrder(order)}
                                title="View Full Specs"
                                className="p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Client & Product Item */}
                          <div>
                            <div className="font-semibold text-slate-200 truncate">
                              {order.client_name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {order.product}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                              <span>QTY: {order.quantity}</span>
                              <span>{order.dimensions || order.category}</span>
                            </div>
                          </div>

                          {/* Courier Tag if Dispatched */}
                          {order.delivery_driver && (
                            <div className="text-[10px] text-teal-300 bg-teal-950/30 p-1 rounded border border-teal-800/30 truncate flex items-center gap-1">
                              <Truck size={10} className="shrink-0" />
                              <span className="truncate">{order.delivery_driver}</span>
                            </div>
                          )}

                          {/* Action Button */}
                          {col.nextStatus && (
                            <div className="pt-1">
                              <button
                                onClick={() => handleAdvanceStatus(order, col.nextStatus, col.nextAction)}
                                disabled={isWorking}
                                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#1c2230] hover:bg-[#252d40] text-slate-200 hover:text-white border border-[#262f44] text-[11px] font-medium transition-colors disabled:opacity-50"
                              >
                                <span>{isWorking ? 'Processing...' : col.nextAction}</span>
                                <ArrowRight size={11} className="opacity-70" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-lg bg-[#11141c] border border-[#1f2533] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1f2533] bg-[#0e1118] text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3 font-mono">Order #</th>
                <th className="py-2.5 px-3">Client Account</th>
                <th className="py-2.5 px-3">Specification</th>
                <th className="py-2.5 px-3">Current Routing</th>
                <th className="py-2.5 px-3">Stage Action</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2533]/80">
              {filteredOrders.map((order) => {
                const currCol = PIPELINE_COLUMNS.find(c => c.id === order.status);
                const isWorking = actionLoadingId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-[#161a24] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {order.order_number}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">
                      {order.client_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div>{order.product}</div>
                      <div className="text-[10px] text-slate-500">{order.quantity} units &bull; {order.dimensions}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3">
                      {currCol && currCol.nextStatus ? (
                        <button
                          onClick={() => handleAdvanceStatus(order, currCol.nextStatus, currCol.nextAction)}
                          disabled={isWorking}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c2230] hover:bg-[#252d40] text-slate-200 border border-[#262f44] text-[11px] font-medium"
                        >
                          <span>{isWorking ? '...' : currCol.nextAction}</span>
                          <ArrowRight size={10} />
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <Check size={12} /> Fulfilled
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="p-1 rounded bg-[#161a24] hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchOrder && (
        <DispatchModal
          isOpen={!!dispatchOrder}
          order={dispatchOrder}
          onClose={() => setDispatchOrder(null)}
          onConfirm={handleConfirmDispatch}
        />
      )}

      {/* Order Details Modal */}
      {detailOrder && (
        <OrderDetailModal
          isOpen={!!detailOrder}
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}

    </div>
  );
}
