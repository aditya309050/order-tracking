import React from 'react';
import Link from 'next/link';
import { Search, Package, Shield, ArrowRight, CheckCircle2, Clock, Truck } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function HomePage() {
  async function handleSearch(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId')?.toString().trim();
    if (orderId) {
      redirect(`/track/${encodeURIComponent(orderId)}`);
    }
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '640px', marginTop: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          <Package size={13} />
          <span>REAL-TIME FABRICATION TRACKING</span>
        </div>

        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          color: '#ffffff',
          marginBottom: '0.75rem'
        }}>
          Track Your Custom Order
        </h1>

        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Enter your <strong style={{ color: '#ffffff' }}>Order Number</strong> (e.g. <span className="font-mono" style={{ color: '#60a5fa' }}>ORD-1025</span>) or Client ID below to check fabrication status and delivery dispatch.
        </p>
      </div>

      {/* Main Search Card */}
      <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
        <form action={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Order ID / Tracking Number
            </label>
            <input
              type="text"
              name="orderId"
              required
              placeholder="e.g. ORD-1025"
              className="input-text font-mono"
              style={{ fontSize: '1rem', padding: '0.85rem 1.15rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.85rem 1.25rem', fontSize: '0.9375rem' }}>
            <span>Track Live Status</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo links */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Quick test with demo orders:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/track/ORD-1025" className="btn-secondary font-mono" style={{ fontSize: '0.75rem' }}>
              ORD-1025 &bull; In Production
            </Link>
            <Link href="/track/ORD-1024" className="btn-secondary font-mono" style={{ fontSize: '0.75rem' }}>
              ORD-1024 &bull; Out for Delivery
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Box */}
      <div style={{
        maxWidth: '720px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
            <Package size={16} />
            <span>/login (Client Portal)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Clients sign in with their unique <strong>Client ID</strong> & <strong>Password</strong> to see only their assigned orders.
          </p>
          <Link href="/login" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Open Client Login &rarr;
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
            <Shield size={16} />
            <span>/admin (Payload CMS)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Staff portal where <strong>Office Users</strong> register orders and <strong>Warehouse Users</strong> update live fabrication status.
          </p>
          <Link href="/admin" style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Open Payload CMS &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
