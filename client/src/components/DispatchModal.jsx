import React, { useState } from 'react';
import { X, Truck, Check } from 'lucide-react';

export default function DispatchModal({ isOpen, onClose, order, onConfirm }) {
  const [driver, setDriver] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onConfirm({
        delivery_driver: driver || 'Company Logistics Fleet',
        driver_phone: phone || null,
        tracking_number: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
        note: note || `Dispatched with ${driver || 'Fleet Driver'}`
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#11141c] border border-[#1f2533] rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2533] bg-[#0e1118]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1f2533] flex items-center justify-center text-teal-400">
              <Truck size={13} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Carrier Dispatch & BOL</h3>
              <p className="text-[10px] text-slate-500">{order.order_number} &bull; {order.client_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Driver / Courier Carrier Name
            </label>
            <input
              type="text"
              placeholder="e.g. Carlos Mendoza (Van #8)"
              value={driver}
              onChange={e => setDriver(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Driver Direct Phone Contact
            </label>
            <input
              type="text"
              placeholder="e.g. +1 (555) 301-4455"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Waybill / BOL Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. BOL-MTR-8840"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Dispatch Verification Note
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Flatbed loaded, secured with tie-down ratchets"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#1f2533]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Check size={13} />
              <span>{submitting ? 'Dispatching...' : 'Confirm Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
