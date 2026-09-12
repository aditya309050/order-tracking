import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getClientSession } from '@/lib/clientAuth';
import { handleClientLogout } from '../actions';
import config from '@payload-config';
import { getPayload } from 'payload';
import { 
  Package, 
  MapPin, 
  Truck, 
  ArrowRight, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building
} from 'lucide-react';

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
  if (s === 'DELIVERED') return 'Delivered';
  if (s === 'OUT_FOR_DELIVERY') return 'Out for Delivery';
  if (s === 'COMPLETED') return 'Quality Check Passed';
  if (s === 'PACKED') return 'Packed & Staged';
  if (s === 'IN_PROCESS') return 'In Fabrication';
  return 'Confirmed';
}

export default async function ClientPortalPage() {
  const session = await getClientSession();

  if (!session) {
    redirect('/login');
  }

  let orders: any[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'orders',
      where: {
        or: [
          { client_access_id: { equals: session.clientId } },
          { client_access_id: { equals: session.clientId.toUpperCase() } },
          { client_access_id: { equals: session.clientId.toLowerCase() } },
          { order_number: { equals: session.clientId } },
          { order_number: { equals: session.clientId.toUpperCase() } },
        ],
      },
      sort: '-createdAt',
      limit: 50,
    });
    orders = result.docs || [];
  } catch (err) {
    console.error('Error fetching client orders:', err);
  }

  const activeCount = orders.filter(o => o.status !== 'DELIVERED').length;
  const inFabCount = orders.filter(o => o.status === 'IN_PROCESS').length;
  const transitCount = orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Client Header Banner */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={13} />
              <span>Verified Client Account</span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {session.clientName}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Client Access ID: <span className="font-mono" style={{ color: '#60a5fa', fontWeight: 600 }}>{session.clientId}</span>
              &bull; Exclusive order ledger
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <form action={handleClientLogout}>
              <button
                type="submit"
                className="btn-secondary"
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#fca5a5',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0c1017', borderRadius: '8px', border: '1px solid #1a2333' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Orders
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              {orders.length}
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0c1017', borderRadius: '8px', border: '1px solid #1a2333' }}>
            <div style={{ fontSize: '0.6875rem', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>
              In Fabrication
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
              {inFabCount}
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0c1017', borderRadius: '8px', border: '1px solid #1a2333' }}>
            <div style={{ fontSize: '0.6875rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase' }}>
              In Transit / Out
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.2rem' }}>
              {transitCount}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            Your Products & Active Fabrication Orders ({orders.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Only orders matching your Client ID are shown
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: '#64748b', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              No Orders Found Yet
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              No fabrication orders have been registered under Client ID <span className="font-mono" style={{ color: '#60a5fa' }}>{session.clientId}</span>. Once your account executive logs an order in the operations ledger, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#60a5fa' }}>
                      {order.order_number}
                    </span>
                    <span className={getStatusBadgeClass(order.status)}>
                      {getStatusLabel(order.status)}
                    </span>
                    {order.priority === 'URGENT' && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        URGENT
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {order.product}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>Quantity: <strong style={{ color: '#cbd5e1' }}>{order.quantity || 1} units</strong></div>
                    {order.dimensions && <div>Dimensions: <span className="font-mono" style={{ color: '#94a3b8' }}>{order.dimensions}</span></div>}
                    {order.delivery_driver && <div>Carrier: <strong style={{ color: '#a78bfa' }}>{order.delivery_driver}</strong></div>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link
                    href={`/track/${encodeURIComponent(order.order_number)}`}
                    className="btn-primary"
                    style={{ padding: '0.65rem 1.15rem', fontSize: '0.8125rem' }}
                  >
                    <span>Track Live Stepper</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
