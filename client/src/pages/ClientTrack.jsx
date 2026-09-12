import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  Cog, 
  CheckCircle2, 
  Package, 
  Truck, 
  CheckCheck, 
  MapPin, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  Printer,
  Copy,
  Check,
  Building,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchOrderById } from '../services/api';
import { socket, subscribeToOrder, unsubscribeFromOrder } from '../services/socket';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';

const TRACKING_STEPS = [
  {
    key: 'CONFIRMED',
    title: 'Order Confirmed',
    location: 'Central Order Desk',
    description: 'Work order validated, materials requisitioned',
    icon: Clock
  },
  {
    key: 'IN_PROCESS',
    title: 'In Production',
    location: 'Fabrication Bay 3',
    description: 'Large-format UV printing & substrate CNC cutting',
    icon: Cog
  },
  {
    key: 'COMPLETED',
    title: 'QC Inspection',
    location: 'Inspection Station A',
    description: 'Dimensional verification & color density checked',
    icon: CheckCircle2
  },
  {
    key: 'PACKED',
    title: 'Staged for Transit',
    location: 'Loading Dock 2',
    description: 'Weather-sealed, edge protectors fitted, barcoded',
    icon: Package
  },
  {
    key: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    location: 'Regional Transit',
    description: 'Loaded onto carrier truck, en route to site',
    icon: Truck
  },
  {
    key: 'DELIVERED',
    title: 'Fulfilled',
    location: 'Destination Address',
    description: 'Received, inspected, and signed by site manager',
    icon: CheckCheck
  }
];

export default function ClientTrack() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(orderId || 'ORD-1025');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveToast, setLiveToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeOrderNumber = orderId || 'ORD-1025';

  const loadTrackingData = async (orderNum) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrderById(orderNum);
      if (res.success) {
        setCurrentOrder(res.data);
      }
    } catch (err) {
      setError(err.message || 'Work order reference not found.');
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrderNumber) {
      setSearchQuery(activeOrderNumber);
      loadTrackingData(activeOrderNumber);

      subscribeToOrder(activeOrderNumber);
      return () => {
        unsubscribeFromOrder(activeOrderNumber);
      };
    }
  }, [activeOrderNumber]);

  // Real-time live status updates
  useEffect(() => {
    const handleLiveStatus = (updatedOrder) => {
      if (
        currentOrder &&
        (updatedOrder.order_number.toUpperCase() === currentOrder.order_number.toUpperCase() ||
          updatedOrder.id === currentOrder.id)
      ) {
        setCurrentOrder(updatedOrder);
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
      socket.off('order:live_status', handleLiveStatus);
      socket.off('order:updated', handleLiveStatus);
    };
  }, [currentOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = currentOrder
    ? TRACKING_STEPS.findIndex(s => s.key === currentOrder.status)
    : -1;

  const activityMap = {};
  if (currentOrder && currentOrder.timeline) {
    for (const act of currentOrder.timeline) {
      activityMap[act.status_to] = act;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Search & Lookup Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Order Number (e.g. ORD-1025)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 rounded-md bg-[#11141c] border border-[#1f2533] text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors uppercase"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Track
          </button>
        </form>

        {/* Demo order quick switchers */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 text-[11px] mr-1">Sample orders:</span>
          {['ORD-1025', 'ORD-1024', 'ORD-1021'].map(id => (
            <button
              key={id}
              onClick={() => navigate(`/track/${id}`)}
              className={`text-[11px] font-mono px-2 py-1 rounded transition-colors ${
                activeOrderNumber === id
                  ? 'bg-blue-950 text-blue-300 border border-blue-800/50 font-semibold'
                  : 'bg-[#11141c] text-slate-400 hover:text-slate-200 border border-[#1f2533]'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Update Alert */}
      {liveToast && (
        <div className="p-3 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>
              <strong>Real-Time Update:</strong> Order status progressed to <strong>{STATUS_CONFIG[liveToast.status]?.label || liveToast.status}</strong> at {liveToast.time}
            </span>
          </div>
          <span className="text-[10px] font-mono text-blue-400 uppercase">Synced</span>
        </div>
      )}

      {/* Loading or Error */}
      {loading ? (
        <div className="p-16 text-center rounded-lg bg-[#11141c] border border-[#1f2533]">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-400">Querying live dispatch ledger...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center rounded-lg bg-[#11141c] border border-rose-900/40">
          <AlertCircle size={28} className="mx-auto text-rose-500 mb-2" />
          <h3 className="text-sm font-semibold text-white">Order Record Not Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">{error}</p>
          <button
            onClick={() => navigate('/track/ORD-1025')}
            className="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
          >
            Load Demo Order ORD-1025
          </button>
        </div>
      ) : currentOrder ? (
        <div className="space-y-6">
          
          {/* Main Shipment Status Card */}
          <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-6 shadow-sm">
            
            {/* Order Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1f2533]">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Work Order Reference</span>
                  <span>&bull;</span>
                  <span>Placed {currentOrder.created_at?.slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
                    {currentOrder.order_number}
                  </h1>
                  <StatusBadge status={currentOrder.status} size="md" pulse={currentOrder.status === 'OUT_FOR_DELIVERY'} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Account: <strong className="text-slate-200">{currentOrder.client_name}</strong> &bull; {currentOrder.client_phone}
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Estimated Delivery</span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {currentOrder.estimated_delivery || 'Scheduling'}
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

            {/* Horizontal Progress Bar (Step tracker) */}
            <div className="pt-6 pb-2">
              <div className="relative">
                {/* Connecting Track Background */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#1f2533] hidden sm:block" />
                
                {/* Active connecting track */}
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
                    const isFuture = idx > currentStepIndex;
                    const StepIcon = step.icon;
                    const act = activityMap[step.key];

                    return (
                      <div key={step.key} className="flex flex-col items-start sm:items-center text-left sm:text-center group">
                        
                        {/* Circle node */}
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

                        {/* Title and date */}
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

          {/* Two-Column Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Manifest & Item Specs (2 Cols) */}
            <div className="md:col-span-2 rounded-lg bg-[#11141c] border border-[#1f2533] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Production Item Manifest
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {currentOrder.quantity} Units Total
                </span>
              </div>

              <div className="rounded-md bg-[#090b10] border border-[#1f2533] p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {currentOrder.product}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: {currentOrder.category} &bull; Dimensions: {currentOrder.dimensions || 'Custom Size'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      QTY: {currentOrder.quantity}
                    </span>
                  </div>
                </div>

                {currentOrder.design_notes && (
                  <div className="pt-2 border-t border-[#1f2533] text-xs">
                    <span className="text-slate-500 text-[11px] font-medium block mb-1">
                      Engineering & Fabrication Notes:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-[#11141c] p-2.5 rounded border border-[#1f2533]">
                      {currentOrder.design_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Destination address */}
              <div className="flex items-start gap-3 p-3.5 rounded-md bg-[#161a24] border border-[#1f2533] text-xs">
                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Consignee Delivery Location:</span>
                  <span className="text-slate-200 font-medium mt-0.5 block">{currentOrder.delivery_address}</span>
                </div>
              </div>
            </div>

            {/* Logistics & Driver Telemetry (1 Col) */}
            <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1f2533]">
                <Truck size={15} className="text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Carrier & Dispatch
                </h3>
              </div>

              {currentOrder.delivery_driver ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-md bg-[#090b10] border border-[#1f2533] space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Designated Carrier</span>
                    <span className="text-sm font-semibold text-white block">{currentOrder.delivery_driver}</span>
                    {currentOrder.driver_phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs pt-1">
                        <Phone size={12} className="text-slate-500" />
                        <span>{currentOrder.driver_phone}</span>
                      </div>
                    )}
                  </div>

                  {currentOrder.tracking_number && (
                    <div className="p-3 rounded-md bg-[#090b10] border border-[#1f2533]">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waybill / BOL Number</span>
                      <span className="text-xs font-mono font-bold text-blue-400 mt-0.5 block">
                        {currentOrder.tracking_number}
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-md bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[11px] flex items-center gap-2">
                    <ShieldCheck size={14} className="shrink-0" />
                    <span>Direct dispatch vehicle &bull; Inspected</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Package size={24} className="mx-auto text-slate-600 mb-2 opacity-60" />
                  <p className="font-medium text-slate-400">Staging at Warehouse</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Courier details and tracking bill assigned upon packaging completion.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Chronological Audit Log (Linear style) */}
          <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Verification & Custody Ledger
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Immutable audit log</span>
            </div>

            <div className="divide-y divide-[#1f2533]/80">
              {(currentOrder.timeline || []).map((act, index) => (
                <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={act.status_to} size="sm" showIcon={false} />
                        <span className="text-slate-300 font-medium">{act.note}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono sm:text-right shrink-0">
                    <span>Logged by {act.actor_role}</span>
                    <span>&bull;</span>
                    <span>{act.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
