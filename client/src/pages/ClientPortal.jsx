import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders } from '../services/api';
import { 
  Package, 
  Clock, 
  Cog, 
  CheckCircle2, 
  Truck, 
  CheckCheck, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  RefreshCw,
  FileText,
  ExternalLink,
  Check,
  Copy,
  Printer
} from 'lucide-react';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';
import { socket, subscribeToOrder, unsubscribeFromOrder } from '../services/socket';

const TRACKING_STEPS = [
  { key: 'CONFIRMED', title: 'Order Confirmed', description: 'Work order validated, materials requisitioned', icon: Clock },
  { key: 'IN_PROCESS', title: 'In Production', description: 'Large-format UV printing & substrate CNC cutting', icon: Cog },
  { key: 'COMPLETED', title: 'QC Inspection', description: 'Dimensional verification & color density checked', icon: CheckCircle2 },
  { key: 'PACKED', title: 'Staged for Transit', description: 'Weather-sealed, edge protectors fitted, barcoded', icon: Package },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', description: 'Loaded onto carrier truck, en route to site', icon: Truck },
  { key: 'DELIVERED', title: 'Fulfilled', description: 'Received, inspected, and signed by site manager', icon: CheckCheck }
];

export default function ClientPortal() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveToast, setLiveToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadClientOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders();
      if (res.success) {
        setOrders(res.data);
        if (res.data.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data[0]);
        } else if (res.data.length > 0 && selectedOrder) {
          const updated = res.data.find(o => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error('Error loading client orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientOrders();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (selectedOrder) {
      subscribeToOrder(selectedOrder.order_number);
    }

    const handleLiveStatus = (updatedOrder) => {
      // Check if update belongs to this client
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === updatedOrder.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedOrder;
          return next;
        }
        return prev;
      });

      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
        setLiveToast({
          status: updatedOrder.status,
          time: new Date().toLocaleTimeString()
        });
        setTimeout(() => setLiveToast(null), 5000);
      }
    };

    socket.on('order:live_status', handleLiveStatus);
    socket.on('order:updated', handleLiveStatus);

    return () => {
      if (selectedOrder) {
        unsubscribeFromOrder(selectedOrder.order_number);
      }
      socket.off('order:live_status', handleLiveStatus);
      socket.off('order:updated', handleLiveStatus);
    };
  }, [selectedOrder]);

  const handleCopyLink = () => {
    if (selectedOrder) {
      navigator.clipboard.writeText(`${window.location.origin}/track/${selectedOrder.order_number}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentStepIndex = selectedOrder
    ? TRACKING_STEPS.findIndex(s => s.key === selectedOrder.status)
    : -1;

  const activityMap = {};
  if (selectedOrder && selectedOrder.timeline) {
    for (const act of selectedOrder.timeline) {
      activityMap[act.status_to] = act;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Client Welcome Banner */}
      <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>AUTHENTICATED CLIENT PORTAL &bull; {user?.client_access_id || user?.username}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome, {user?.name || 'Valued Client'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            You are securely authenticated. Below are the work orders registered to your organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClientOrders}
            className="p-1.5 rounded-md bg-[#161a24] hover:bg-slate-800 text-slate-300 border border-[#1f2533] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Real-Time Status Toast */}
      {liveToast && (
        <div className="p-3 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>
              <strong>Real-Time Update:</strong> Order status progressed to <strong>{STATUS_CONFIG[liveToast.status]?.label || liveToast.status}</strong> at {liveToast.time}
            </span>
          </div>
          <span className="text-[10px] font-mono text-blue-400 uppercase">Live Push</span>
        </div>
      )}

      {/* Order Selector if multiple */}
      {orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">YOUR ORDERS:</span>
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-colors ${
                selectedOrder?.id === order.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#11141c] text-slate-400 hover:text-white border border-[#1f2533]'
              }`}
            >
              {order.order_number} ({order.status})
            </button>
          ))}
        </div>
      )}

      {loading && !selectedOrder ? (
        <div className="p-16 text-center rounded-lg bg-[#11141c] border border-[#1f2533]">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-400">Loading your work order records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-[#11141c] border border-[#1f2533]">
          <Package size={28} className="mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-white">No Active Orders Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no work orders registered under Client ID <strong className="text-slate-200">{user?.client_access_id || user?.username}</strong>.
          </p>
        </div>
      ) : selectedOrder ? (
        <div className="space-y-6">
          
          {/* Main Shipment Card */}
          <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-6 shadow-sm">
            
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1f2533]">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Work Order Reference</span>
                  <span>&bull;</span>
                  <span>Registered {selectedOrder.created_at?.slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
                    {selectedOrder.order_number}
                  </h2>
                  <StatusBadge status={selectedOrder.status} size="md" pulse={selectedOrder.status === 'OUT_FOR_DELIVERY'} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Item: <strong className="text-slate-200">{selectedOrder.product}</strong> ({selectedOrder.quantity} units)
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Target Delivery</span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {selectedOrder.estimated_delivery || 'In Progress'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#161a24] hover:bg-slate-800 text-slate-300 border border-[#1f2533] transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Share URL'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#161a24] hover:bg-slate-800 text-slate-300 border border-[#1f2533] transition-colors"
                  >
                    <Printer size={12} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="pt-6 pb-2">
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#1f2533] hidden sm:block" />
                
                <div 
                  className="absolute top-4 left-4 h-0.5 bg-blue-500 hidden sm:block transition-all duration-500" 
                  style={{
                    width: `${Math.min(100, (currentStepIndex / (TRACKING_STEPS.length - 1)) * 92)}%`
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const StepIcon = step.icon;
                    const act = activityMap[step.key];

                    return (
                      <div key={step.key} className="flex flex-col items-start sm:items-center text-left sm:text-center group">
                        
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors border ${
                            isCompleted
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : isCurrent
                              ? 'bg-[#11141c] border-blue-400 text-blue-400 ring-4 ring-blue-500/20'
                              : 'bg-[#11141c] border-[#1f2533] text-slate-600'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={14} className="stroke-[2.5]" />
                          ) : (
                            <StepIcon size={14} />
                          )}
                        </div>

                        <span className={`text-xs font-semibold leading-tight ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {step.title}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {act ? act.created_at?.slice(5, 16) : isCurrent ? 'Active Now' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Manifest */}
            <div className="md:col-span-2 rounded-lg bg-[#11141c] border border-[#1f2533] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Your Item Specifications
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedOrder.quantity} Units Total
                </span>
              </div>

              <div className="rounded-md bg-[#090b10] border border-[#1f2533] p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {selectedOrder.product}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: {selectedOrder.category} &bull; Dimensions: {selectedOrder.dimensions || 'Custom Size'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      QTY: {selectedOrder.quantity}
                    </span>
                  </div>
                </div>

                {selectedOrder.design_notes && (
                  <div className="pt-2 border-t border-[#1f2533] text-xs">
                    <span className="text-slate-500 text-[11px] font-medium block mb-1">
                      Notes & Finishing:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-[#11141c] p-2.5 rounded border border-[#1f2533]">
                      {selectedOrder.design_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery destination */}
              <div className="flex items-start gap-3 p-3.5 rounded-md bg-[#161a24] border border-[#1f2533] text-xs">
                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Delivery Destination:</span>
                  <span className="text-slate-200 font-medium mt-0.5 block">{selectedOrder.delivery_address}</span>
                </div>
              </div>
            </div>

            {/* Carrier */}
            <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1f2533]">
                <Truck size={15} className="text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Logistics & Courier
                </h3>
              </div>

              {selectedOrder.delivery_driver ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-md bg-[#090b10] border border-[#1f2533] space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Assigned Driver</span>
                    <span className="text-sm font-semibold text-white block">{selectedOrder.delivery_driver}</span>
                    {selectedOrder.driver_phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs pt-1">
                        <Phone size={12} className="text-slate-500" />
                        <span>{selectedOrder.driver_phone}</span>
                      </div>
                    )}
                  </div>

                  {selectedOrder.tracking_number && (
                    <div className="p-3 rounded-md bg-[#090b10] border border-[#1f2533]">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waybill Number</span>
                      <span className="text-xs font-mono font-bold text-blue-400 mt-0.5 block">
                        {selectedOrder.tracking_number}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-md bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[11px] flex items-center gap-2">
                    <ShieldCheck size={14} className="shrink-0" />
                    <span>Authorized Carrier &bull; Direct Route</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Package size={24} className="mx-auto text-slate-600 mb-2 opacity-60" />
                  <p className="font-medium text-slate-400">Shop Floor Production</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Driver assignment details appear here once packaging is complete.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
