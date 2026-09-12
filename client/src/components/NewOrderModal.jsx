import React, { useState } from 'react';
import { X, Plus, AlertCircle, Check, Key, RefreshCw, ShieldCheck } from 'lucide-react';
import { createOrder } from '../services/api';

const PRODUCT_PRESETS = [
  { name: 'Hoardings (Flex & UV coated)', cat: 'Hoardings', defaultDim: '20ft x 10ft' },
  { name: '3D Acrylic LED Channel Letters', cat: 'Signage', defaultDim: '8ft x 3ft' },
  { name: 'Roll-up Trade Show Banners', cat: 'Banners', defaultDim: '33in x 81in' },
  { name: 'Reflective Traffic Safety Signboards', cat: 'Signage', defaultDim: '24in x 24in' },
  { name: 'Pylon Wayfinding Directory Totem', cat: 'Displays', defaultDim: '12ft x 4ft' }
];

export default function NewOrderModal({ isOpen, onClose, onOrderCreated }) {
  const generateCleanPassword = () => `pass${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    client_access_id: '',
    client_password: generateCleanPassword(),
    product: '',
    category: 'Hoardings',
    quantity: 1,
    dimensions: '',
    design_notes: '',
    delivery_address: '',
    priority: 'NORMAL',
    estimated_delivery: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleClientNameChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      client_name: val,
      client_access_id: prev.client_access_id ? prev.client_access_id : (slug ? `${slug}_client` : '')
    }));
  };

  const handlePreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      product: preset.name,
      category: preset.cat,
      dimensions: preset.defaultDim
    }));
  };

  const handleRegeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      client_password: generateCleanPassword()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_phone || !formData.product || !formData.delivery_address) {
      setError('Please fill in required fields: Client, Phone, Product, and Delivery Address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await createOrder(formData);
      if (onOrderCreated) {
        onOrderCreated(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error registering order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#11141c] border border-[#1f2533] rounded-lg shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2533] bg-[#0e1118]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1f2533] flex items-center justify-center text-blue-400">
              <Plus size={14} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Production Work Order</h3>
              <p className="text-[10px] text-slate-500">Log order specifications & provision client portal credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-[11px]">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Standard Fabrication Templates
            </label>
            <div className="flex flex-wrap gap-1">
              {PRODUCT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className="text-[11px] px-2 py-0.5 rounded bg-[#161a24] hover:bg-slate-800 hover:text-blue-300 border border-[#1f2533] text-slate-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Client Account */}
          <div className="pt-2 border-t border-[#1f2533] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              1. Client & Billing Contact
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Client / Company Name <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Media Corp"
                  value={formData.client_name}
                  onChange={e => handleClientNameChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Contact Phone Number <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.client_phone}
                  onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Contact Email (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. procurement@zenithmedia.com"
                value={formData.client_email}
                onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Client Portal Credentials */}
          <div className="pt-2 border-t border-[#1f2533] space-y-2.5 bg-[#161a24]/50 p-3 rounded border border-[#1f2533]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Key size={12} />
                <span>2. Customer Tracking Portal Credentials</span>
              </span>
              <span className="text-[10px] text-slate-400">Share with client after order creation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Client Portal ID (Username)
                </label>
                <input
                  type="text"
                  placeholder="e.g. zenith_client"
                  value={formData.client_access_id}
                  onChange={e => setFormData({ ...formData, client_access_id: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-300">
                    Client Access Password
                  </label>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.client_password}
                  onChange={e => setFormData({ ...formData, client_password: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              The client can log in with this ID & password at <code>/login</code> to track this order without seeing other companies' data.
            </p>
          </div>

          {/* Section 3: Fabrication Specs */}
          <div className="pt-2 border-t border-[#1f2533] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              3. Fabrication & Material Specs
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Product / Item Title <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hoardings with Metal Grommets"
                  value={formData.product}
                  onChange={e => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Quantity <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Dimensions / Physical Size
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20ft x 10ft"
                  value={formData.dimensions}
                  onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Category Classification
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Hoardings">Hoardings</option>
                  <option value="Signage">Signage</option>
                  <option value="Banners">Banners</option>
                  <option value="Displays">Displays</option>
                  <option value="Custom">Custom Fabrication</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Engineering Notes / Finish Requirements
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Anti-UV laminate, reinforced welded hem, corner eyelets"
                value={formData.design_notes}
                onChange={e => setFormData({ ...formData, design_notes: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 4: Delivery */}
          <div className="pt-2 border-t border-[#1f2533] space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              4. Fulfillment & Destination
            </span>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Destination Address <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 452 Industrial Parkway, Metro City, NY 10001"
                value={formData.delivery_address}
                onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Job Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="NORMAL">Normal Routine</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Rush Run</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={formData.estimated_delivery}
                  onChange={e => setFormData({ ...formData, estimated_delivery: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f2533]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              <span>{loading ? 'Registering...' : 'Register Order & Provision Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
