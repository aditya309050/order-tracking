import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Realtime adapter built on Supabase Realtime WebSockets.
 *
 * The legacy Socket.IO / Express transport was removed during the consolidation
 * to a single Next.js + Payload app — the whole system now runs on Supabase.
 */
class RealtimeAdapter {
  constructor() {
    this.listeners = new Map();
    this.activeRooms = new Set();
    this.connected = false;
    this.supabaseChannel = null;

    if (isSupabaseConfigured()) {
      this.initSupabase();
    }
  }

  initSupabase() {
    if (!supabase) return;

    this.supabaseChannel = supabase
      .channel('public:orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const { eventType, new: newRecord } = payload;
          if (eventType === 'INSERT') {
            this.emitInternal('order:created', newRecord);
          } else if (eventType === 'UPDATE') {
            this.emitInternal('order:updated', newRecord);
            if (this.activeRooms.has(newRecord.order_number)) {
              this.emitInternal('order:live_status', newRecord);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.connected = true;
          this.emitInternal('connect');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.connected = false;
          this.emitInternal('disconnect');
        }
      });
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  emitInternal(event, ...args) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(...args);
        } catch (e) {
          console.error(`Error in realtime handler for ${event}:`, e);
        }
      });
    }
  }

  joinRoom(orderNumber) {
    this.activeRooms.add(orderNumber);
  }

  leaveRoom(orderNumber) {
    this.activeRooms.delete(orderNumber);
  }
}

// Lazily instantiate so this module is safe to import in the browser only.
let _socket = null;
function getSocket() {
  if (typeof window === 'undefined') {
    // Server render: return a no-op stub.
    return {
      on() {},
      off() {},
      joinRoom() {},
      leaveRoom() {},
      emitInternal() {},
    };
  }
  if (!_socket) {
    _socket = new RealtimeAdapter();
  }
  return _socket;
}

export const socket = getSocket();

export function subscribeToOrder(orderNumber) {
  if (orderNumber) socket.joinRoom(orderNumber);
}

export function unsubscribeFromOrder(orderNumber) {
  if (orderNumber) socket.leaveRoom(orderNumber);
}
