import React from 'react';
import Link from 'next/link';
import config from '@payload-config';
import { getPayload } from 'payload';
import { 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  Hammer, 
  Check, 
  ArrowLeft,
  ShieldCheck,
  Building,
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { key: 'CONFIRMED', label: '1. Confirmed', icon: CheckCircle2, desc: 'Order verified & specs logged' },
  { key: 'IN_PROCESS', label: '2. In Fabrication', icon: Hammer, desc: 'Cutting, welding & assembly' },
  { key: 'COMPLETED', label: '3. Quality Check', icon: Check, desc: 'QC pass & finish staging' },
  { key: 'OUT_FOR_DELIVERY', label: '4. Out for Delivery', icon: Truck, desc: 'Dispatched to installation site' },
  { key: 'DELIVERED', label: '5. Delivered', icon: Package, desc: 'Delivered & fulfilled' }
];

function getStageIndex(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DELIVERED') return 4;
  if (s === 'OUT_FOR_DELIVERY') return 3;
  if (s === 'COMPLETED' || s === 'PACKED') return 2;
  if (s === 'IN_PROCESS') return 1;
  return 0; // CONFIRMED
}

function getStatusBadgeClass(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DELIVERED') return 'badge badge-delivered';
  if (s === 'OUT_FOR_DELIVERY') return 'badge badge-out-for-delivery';
  if (s === 'COMPLETED' || s === 'PACKED') return 'badge badge-completed';
  if (s === 'IN_PROCESS') return 'badge badge-in-process';
  return 'badge badge-confirmed';
}

function getStatusLabel(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DELIVERED') return 'Delivered & Fulfilled';
  if (s === 'OUT_FOR_DELIVERY') return 'Out for Delivery';
  if (s === 'COMPLETED') return 'Completed (QC Passed)';
  if (s === 'PACKED') return 'Packed & Staged';
  if (s === 'IN_PROCESS') return 'In Process (Fabrication)';
  return 'Order Confirmed';
}

import { getClientSession } from '@/lib/clientAuth';

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id || '').trim();

  const session = await getClientSession();

  let order: any = null;
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'orders',
      where: {
        or: [
          { order_number: { equals: cleanId.toUpperCase() } },
          { order_number: { equals: cleanId } },
          { client_access_id: { equals: cleanId } },
        ],
      },
      limit: 1,
    });

    if (result.docs && result.docs.length > 0) {
      order = result.docs[0];
    }
  } catch (err) {
    console.error('Error fetching order from Payload CMS:', err);
  }

  // If order not found
  if (!order) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <AlertCircle size={24} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Order Not Found
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              No active fabrication order was found matching <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>"{cleanId}"</span>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link href="/" className="btn-primary">
              <ArrowLeft size={14} />
              <span>Search Again</span>
            </Link>
            <Link href="/admin" className="btn-secondary">
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Security & Tenant Isolation Check:
  if (session) {
    // If logged in, verify that this order belongs to the logged-in client
    const matchesClient =
      session.clientId.toUpperCase() === (order.client_access_id || '').toUpperCase() ||
      session.clientId.toUpperCase() === (order.order_number || '').toUpperCase();

    if (!matchesClient) {
      return (
        <div className="container" style={{ maxWidth: '540px', margin: '2rem auto' }}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
              <AlertCircle size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                Access Denied: Other Client's Order
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You are currently signed in as <span className="font-mono" style={{ color: '#60a5fa', fontWeight: 600 }}>{session.clientName} ({session.clientId})</span>. This order belongs to another client and cannot be accessed from your account.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/portal" className="btn-primary" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
                <span>Back to My Orders</span>
              </Link>
              <Link href="/login" className="btn-secondary" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
                <span>Switch Account</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  } else {
    // If NOT logged in, and order has password or client access ID assigned:
    const isProtected = Boolean(order.client_password || order.client_access_id);
    if (isProtected) {
      return (
        <div className="container" style={{ maxWidth: '540px', margin: '2rem auto' }}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                Client Authentication Required
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Order <span className="font-mono" style={{ color: '#60a5fa', fontWeight: 600 }}>{order.order_number}</span> is private to client account <strong style={{ color: '#ffffff' }}>{order.client_name}</strong>. Please sign in with your Client ID & Password to view this order.
              </p>
            </div>
            <Link href="/login" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
              <span>Go to Client Login</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      );
    }
  }

  const currentStep = getStageIndex(order.status);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Back button & View-Only Indicator Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        {session ? (
          <Link href="/portal" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
            <ArrowLeft size={13} />
            <span>Back to My Orders Portal</span>
          </Link>
        ) : (
          <Link href="/" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
            <ArrowLeft size={13} />
            <span>Back to Search</span>
          </Link>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <ShieldCheck size={13} />
          <span>Client &bull; View Only Mode</span>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                {order.order_number}
              </span>
              <span className={getStatusBadgeClass(order.status)}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              {order.client_name}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Product: <span style={{ color: '#ffffff', fontWeight: 600 }}>{order.product}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>Quantity: <strong style={{ color: '#ffffff' }}>{order.quantity || 1} units</strong></div>
            {order.dimensions && <div>Specs: <span className="font-mono" style={{ color: '#94a3b8' }}>{order.dimensions}</span></div>}
            {order.priority && (
              <div style={{ marginTop: '0.35rem' }}>
                Priority: <span style={{ color: order.priority === 'URGENT' ? '#f87171' : order.priority === 'HIGH' ? '#fbbf24' : '#94a3b8', fontWeight: 700 }}>{order.priority}</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-Stage Stepper Tracker */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Production & Delivery Milestones
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.85rem'
          }}>
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isUpcoming = idx > currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: isCurrent ? 'rgba(37, 99, 235, 0.15)' : isCompleted ? '#141a27' : '#0b0e14',
                    border: isCurrent ? '1px solid #3b82f6' : isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '130px',
                    boxShadow: isCurrent ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isCurrent ? '#2563eb' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : '#1e2433',
                      color: isCurrent ? '#ffffff' : isCompleted ? '#34d399' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>

                    <span className="font-mono" style={{ fontSize: '0.6875rem', color: isCurrent ? '#60a5fa' : isCompleted ? '#34d399' : '#475569', fontWeight: 700 }}>
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isCurrent ? '#93c5fd' : isCompleted ? '#ffffff' : '#64748b' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {step.desc}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, marginTop: '0.5rem' }}>
                    {isCompleted && <span style={{ color: '#34d399' }}>✓ Completed</span>}
                    {isCurrent && <span style={{ color: '#60a5fa' }}>● In Progress</span>}
                    {isUpcoming && <span style={{ color: '#475569' }}>Upcoming</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* Delivery & Site Address Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 700 }}>
            <MapPin size={16} />
            <span>Installation & Delivery Site</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#f1f5f9', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
            {order.delivery_address || 'To be determined by client dispatch'}
          </p>
        </div>

        {/* Carrier & Driver Dispatch Info */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontSize: '0.8125rem', fontWeight: 700 }}>
            <Truck size={16} />
            <span>Dispatch & Waybill Details</span>
          </div>
          <div style={{ paddingLeft: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div>Carrier / Driver: <strong style={{ color: '#ffffff' }}>{order.delivery_driver || 'Assigned prior to dispatch'}</strong></div>
            {order.driver_phone && <div>Contact: <span className="font-mono" style={{ color: '#93c5fd' }}>{order.driver_phone}</span></div>}
            {order.tracking_number && <div>Waybill #: <span className="font-mono" style={{ color: '#34d399', fontWeight: 700 }}>{order.tracking_number}</span></div>}
          </div>
        </div>

      </div>

      {/* Engineering Notes (if any) */}
      {order.design_notes && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Engineering & Design Notes
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{order.design_notes}"
          </p>
        </div>
      )}

      {/* Footer support text */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        This page updates live as fabrication technicians progress through each station in the <strong>Payload CMS</strong> operations ledger.
      </div>

    </div>
  );
}
