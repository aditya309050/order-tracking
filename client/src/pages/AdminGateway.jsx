import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  ExternalLink, 
  Building, 
  Kanban, 
  ShieldCheck, 
  ArrowRight, 
  Terminal,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminGateway() {
  const { user, isAuthenticated, isOfficeAdmin } = useAuth();
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const cmsUrl = import.meta.env.VITE_PAYLOAD_CMS_URL || (isLocalhost ? 'http://localhost:3001/admin' : null);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-mono">
          <ShieldCheck size={14} />
          <span>ADMINISTRATIVE PORTALS & CMS HUB</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
          System Administration Hub
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Choose between Payload Headless CMS Studio (Port 3001) or the custom React Operations consoles (Port 3000).
        </p>
      </div>

      {/* Main Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Payload CMS (Port 3001) */}
        <div className="rounded-xl bg-[#11141c] border border-purple-900/40 p-6 flex flex-col justify-between relative overflow-hidden shadow-lg group hover:border-purple-600/60 transition-all">
          <div className="absolute top-0 right-0 px-3 py-1 bg-purple-950/80 border-b border-l border-purple-800/40 rounded-bl-lg text-[10px] font-mono text-purple-300">
            {isLocalhost ? 'PORT 3001' : 'CMS STUDIO'}
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Payload CMS Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 border border-purple-700/50">
                  Headless CMS
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visual database collections editor for Orders, Activities, and User Accounts. Full admin UI powered by Next.js.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#090b10] border border-[#1f2533] space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Address:</span>
                <span className="text-purple-300 font-semibold">
                  {cmsUrl || 'Deploy cms/ to Vercel'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Database:</span>
                <span className="text-slate-300">Supabase PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Collections:</span>
                <span className="text-slate-300">Orders, Order Activities, Users</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#1f2533] space-y-3">
            {cmsUrl ? (
              <a
                href={cmsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Launch Payload CMS (/admin)</span>
                <ExternalLink size={14} />
              </a>
            ) : (
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/40 text-center text-[11px] text-purple-300">
                Payload CMS runs locally on Port 3001. On Vercel, use the <strong>Operations Consoles</strong> to the right!
              </div>
            )}
            <p className="text-[10px] text-slate-500 text-center">
              Requires CMS dev server: <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">npm run dev:cms</code>
            </p>
          </div>
        </div>

        {/* Card 2: Custom React Consoles (Port 3000) */}
        <div className="rounded-xl bg-[#11141c] border border-blue-900/40 p-6 flex flex-col justify-between relative overflow-hidden shadow-lg group hover:border-blue-600/60 transition-all">
          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-950/80 border-b border-l border-blue-800/40 rounded-bl-lg text-[10px] font-mono text-blue-300">
            PORT 3000
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Operations Consoles
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-200 border border-blue-700/50">
                  Built-in Web App
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Custom tailor-made console for quick order intake, shop floor Kanban progression, and client tracking links.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/officeadmin"
                className="flex items-center justify-between p-3 rounded-lg bg-[#090b10] hover:bg-slate-900/80 border border-[#1f2533] text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Building size={16} className="text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Office Admin Intake</div>
                    <div className="text-[10px] text-slate-500">Order entry & client password setup</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </Link>

              <Link
                to="/warehouseadmin"
                className="flex items-center justify-between p-3 rounded-lg bg-[#090b10] hover:bg-slate-900/80 border border-[#1f2533] text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Kanban size={16} className="text-amber-400" />
                  <div>
                    <div className="font-semibold text-white">Shop Floor & Warehouse Kanban</div>
                    <div className="text-[10px] text-slate-500">QC check, stage advance & driver dispatch</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#1f2533]">
            {isAuthenticated ? (
              <div className="text-center text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Signed in as <strong>{user?.name || user?.username}</strong> ({user?.role})</span>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Sign In to Operations Consoles</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Terminal Command Quick Helper */}
      <div className="rounded-xl bg-[#090b10] border border-[#1f2533] p-4 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal size={16} className="text-slate-500 shrink-0" />
          <span>Run both servers concurrently from project root:</span>
        </div>
        <div className="bg-[#161a24] px-3 py-1.5 rounded border border-[#273043] text-emerald-400 text-xs">
          npm run dev
        </div>
      </div>
    </div>
  );
}
