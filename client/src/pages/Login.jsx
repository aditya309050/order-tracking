import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Key } from 'lucide-react';

export default function Login() {
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
      setError('Please enter both your User/Client ID and password');
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
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#161a24] border border-[#1f2533] flex items-center justify-center text-blue-400 mx-auto shadow-sm">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">
              VANGUARD OMS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Production Control & Client Tracking Authentication
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-lg bg-[#11141c] border border-[#1f2533] p-6 shadow-sm space-y-5 text-xs">
          
          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-[11px] flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Client ID / System Username
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. office, warehouse, or abc_client"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password / Access Key
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#090b10] border border-[#1f2533] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="pt-4 border-t border-[#1f2533] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              1-Click Demo Logins
            </span>
            
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('office', 'office123')}
                className="p-2 rounded bg-[#161a24] hover:bg-slate-800 border border-[#1f2533] text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Office Admin</div>
                <div className="text-[10px] font-mono text-slate-500">office &bull; office123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('warehouse', 'warehouse123')}
                className="p-2 rounded bg-[#161a24] hover:bg-slate-800 border border-[#1f2533] text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-slate-200">Warehouse Staff</div>
                <div className="text-[10px] font-mono text-slate-500">warehouse &bull; warehouse123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('abc_client', 'abc123')}
                className="p-2 rounded bg-[#161a24] hover:bg-slate-800 border border-[#1f2533] text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-blue-400">Client: ABC Co.</div>
                <div className="text-[10px] font-mono text-slate-500">abc_client &bull; abc123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('apex_client', 'apex123')}
                className="p-2 rounded bg-[#161a24] hover:bg-slate-800 border border-[#1f2533] text-left transition-colors"
              >
                <div className="text-[11px] font-semibold text-purple-400">Client: Apex Retail</div>
                <div className="text-[10px] font-mono text-slate-500">apex_client &bull; apex123</div>
              </button>
            </div>
          </div>

        </div>

        <div className="text-center text-[11px] text-slate-500">
          <p>Clients: Login credentials are provided by your account manager upon order confirmation.</p>
        </div>

      </div>
    </div>
  );
}
