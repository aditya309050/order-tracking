import React from 'react';
import Link from 'next/link';
import { Package, Shield, ExternalLink, Search } from 'lucide-react';
import './globals.css';

export const metadata = {
  title: 'Vanguard OMS - Live Order Tracking',
  description: 'View real-time fabrication and dispatch progress for your custom order.',
};

import { getClientSession } from '@/lib/clientAuth';
import { handleClientLogout } from './actions';
import { User, LogOut } from 'lucide-react';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();

  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(8, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px'
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa'
              }}>
                <Package size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                    VANGUARD
                  </span>
                  <span className="font-mono" style={{
                    fontSize: '0.625rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '4px',
                    backgroundColor: '#161b28',
                    border: '1px solid #232a3b',
                    color: '#94a3b8'
                  }}>
                    OMS
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Fabrication & Dispatch Tracker
                </div>
              </div>
            </Link>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link href="/" className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}>
                <Search size={14} />
                <span>Track Order</span>
              </Link>

              {session ? (
                <>
                  <Link href="/portal" className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', color: '#93c5fd', borderColor: '#3b82f6' }}>
                    <User size={14} />
                    <span>My Orders</span>
                  </Link>

                  <form action={handleClientLogout}>
                    <button
                      type="submit"
                      className="btn-secondary"
                      title="Log Out"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.8125rem', color: '#f87171' }}
                    >
                      <LogOut size={14} />
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', color: '#38bdf8' }}>
                  <User size={14} />
                  <span>Client Login</span>
                </Link>
              )}

              <Link
                href="/admin"
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.3)',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8125rem'
                }}
              >
                <Shield size={14} />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2.5rem 0' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#06080c',
          padding: '1.25rem 0',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>Vanguard Fabrication Operations &bull; Live Client Tracking System</div>
            <div className="font-mono" style={{ fontSize: '0.6875rem', color: '#475569' }}>
              Port 3000 &bull; /admin (Payload CMS) &bull; /track/:id (Client View)
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
