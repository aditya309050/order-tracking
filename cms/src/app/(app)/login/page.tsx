'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { handleClientLogin } from '../actions';

export default function ClientLoginPage() {
  const [state, formAction, isPending] = useActionState(handleClientLogin, null);

  return (
    <div className="container" style={{ maxWidth: '480px', margin: '1.5rem auto' }}>
      
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', width: 'fit-content' }}>
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={26} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Client Portal Login
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Sign in with the <strong style={{ color: '#ffffff' }}>Client ID</strong> and <strong style={{ color: '#ffffff' }}>Password</strong> provided by your project manager to track all your orders.
          </p>
        </div>

        {/* Error Alert */}
        {state?.error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.8125rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{state.error}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Client Access ID
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <User size={16} />
              </div>
              <input
                type="text"
                name="clientId"
                required
                placeholder="e.g. APEX or ORD-3001"
                className="input-text font-mono"
                style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem' }}
                autoComplete="username"
              />
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Matches the Client ID or Order ID from your dispatch confirmation
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Client Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="input-text"
                style={{ paddingLeft: '2.75rem', fontSize: '0.9375rem' }}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '0.9375rem',
              marginTop: '0.5rem',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{isPending ? 'Verifying Credentials...' : 'Access My Orders'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Security Notice */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>🔒 Protected Client Enclave</div>
          <div style={{ marginTop: '0.2rem' }}>
            Clients only have access to their own company's products and blueprints.
          </div>
        </div>

      </div>
    </div>
  );
}
