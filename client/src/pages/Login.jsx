import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Building, 
  Kanban,
  Database,
  ExternalLink
} from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your ID and password');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const user = await login({ username: username.trim(), password: password.trim() });

      // Navigate according to user role or previous location
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'OFFICE_ADMIN') {
        navigate('/officeadmin', { replace: true });
      } else if (user.role === 'WAREHOUSE_ADMIN') {
        navigate('/warehouseadmin', { replace: true });
      } else {
        navigate('/client', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#161a24] border border-[#1f2533] flex items-center justify-center text-blue-400 mx-auto shadow-md">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              VANGUARD OMS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Production Operations, Warehouse Dispatch & Client Portal
            </p>
          </div>
        </div>

        {/* User / Admin Tab Selector */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-[#11141c] border border-[#1f2533] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setError(null);
            }}
            className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'client'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={13} />
            <span>Client Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Staff & Admin</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-[#11141c] border border-[#1f2533] p-6 shadow-xl space-y-5 text-xs">
          
          <div className="border-b border-[#1f2533] pb-3">
            <h2 className="text-sm font-semibold text-white">
              {activeTab === 'client' ? 'Client Order Tracking Access' : 'Operations Staff Sign In'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeTab === 'client'
                ? 'Enter your Client Portal ID or Order Number provided on confirmation.'
                : 'Office Administrators and Shop Floor Warehouse operators sign in below.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-[11px] flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {activeTab === 'client' ? 'Client Portal ID / Order #' : 'Admin Email or Username'}
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'client' ? 'e.g. abc_client or ORD-1025' : 'e.g. admin@company.com or office'}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#090b10] border border-[#1f2533] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {activeTab === 'client' ? 'Client Access Key / Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#090b10] border border-[#1f2533] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
            >
              <span>
                {submitting
                  ? 'Authenticating...'
                  : activeTab === 'client'
                  ? 'Sign In to Client Portal'
                  : 'Sign In to Operations Console'}
              </span>
              <ArrowRight size={13} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
