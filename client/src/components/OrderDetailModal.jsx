import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  ExternalLink, 
  Check, 
  MapPin, 
  Phone, 
  Calendar, 
  Layers, 
  Truck, 
  Clock, 
  Building 
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';

export default function OrderDetailModal({ isOpen, onClose, order }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const trackingUrl = `${window.location.origin}/track/${order.order_number}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeline = order.timeline || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#11141c] border border-[#1f2533] rounded-lg shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2533] bg-[#0e1118]">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white font-mono">{order.order_number}</h3>
            <StatusBadge status={order.status} size="sm" />
            {order.priority && order.priority !== 'NORMAL' && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                {order.priority}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#161a24] hover:bg-slate-800 text-slate-300 border border-[#1f2533] transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>

            <Link
              to={`/track/${order.order_number}`}
              target="_blank"
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 transition-colors"
            >
              <ExternalLink size={12} />
              <span>Public View</span>
            </Link>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specs */}
            <div className="p-3.5 rounded-md bg-[#090b10] border border-[#1f2533] space-y-2.5">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Item & Fabrication Specifications
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Product:</span>
                  <span className="font-semibold text-slate-200">{order.product}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-mono font-bold text-white">{order.quantity} units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Dimensions:</span>
                  <span className="font-mono text-slate-300">{order.dimensions || 'Standard'}</span>
                </div>
                {order.design_notes && (
                  <div className="pt-1 text-[11px]">
                    <span className="text-slate-500 block mb-0.5">Notes:</span>
                    <p className="text-slate-300 font-mono bg-[#11141c] p-2 rounded border border-[#1f2533]">
                      {order.design_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Client & Logistics */}
            <div className="p-3.5 rounded-md bg-[#090b10] border border-[#1f2533] space-y-2.5">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Consignee & Dispatch Telemetry
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-medium text-slate-200">{order.client_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Contact:</span>
                  <span className="text-slate-300">{order.client_phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1f2533]">
                  <span className="text-slate-500">Destination:</span>
                  <span className="text-slate-300 truncate max-w-xs">{order.delivery_address}</span>
                </div>
                {order.delivery_driver && (
                  <div className="flex justify-between py-1 border-b border-[#1f2533]">
                    <span className="text-slate-500">Carrier:</span>
                    <span className="text-teal-400 font-medium">{order.delivery_driver}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Target ETA:</span>
                  <span className="font-mono text-slate-300">{order.estimated_delivery || 'Scheduling'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger History */}
          <div>
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              Chronological Audit Trail
            </h4>
            <div className="rounded-md bg-[#090b10] border border-[#1f2533] divide-y divide-[#1f2533]">
              {timeline.map((act, index) => (
                <div key={index} className="p-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={act.status_to} size="sm" showIcon={false} />
                    <span className="text-slate-300">{act.note}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    {act.created_at} &bull; {act.actor_role}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
