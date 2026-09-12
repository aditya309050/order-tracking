import { io } from 'socket.io-client';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Universal Realtime Adapter
 * Seamlessly routes between:
 * 1. Supabase Realtime WebSockets (when VITE_SUPABASE_URL is configured for Vercel/Cloud)
 * 2. Socket.IO (when running locally with Express backend)
 */
class RealtimeAdapter {
  constructor() {
    this.listeners = new Map();
    this.activeRooms = new Set();
    this.connected = false;
    this.mode = isSupabaseConfigured() ? 'supabase' : 'socketio';

    if (this.mode === 'supabase') {
      this.initSupabase();
    } else {
      this.initSocketIO();
    }
  }

  initSocketIO() {
    const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    try {
      this.rawSocket = io(SOCKET_SERVER_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.connected = this.rawSocket.connected;

      this.rawSocket.on('connect', () => {
        this.connected = true;
        this.emitInternal('connect');
      });

      this.rawSocket.on('disconnect', (reason) => {
        this.connected = false;
        this.emitInternal('disconnect', reason);
      });

      this.rawSocket.on('order:updated', (data) => {
        this.emitInternal('order:updated', data);
      });

      this.rawSocket.on('order:created', (data) => {
        this.emitInternal('order:created', data);
      });

      this.rawSocket.on('order:live_status', (data) => {
        this.emitInternal('order:live_status', data);
      });
    } catch (err) {
      console.warn('Socket.IO initialization fallback:', err);
    }
  }

  initSupabase() {
    if (!supabase) return;
    this.connected = true;

    // Trigger connect state
    setTimeout(() => {
      this.emitInternal('connect');
    }, 50);

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

  emit(event, ...args) {
    if (this.rawSocket && this.mode === 'socketio') {
      this.rawSocket.emit(event, ...args);
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
    if (this.rawSocket && this.mode === 'socketio') {
      this.rawSocket.emit('join_order_room', orderNumber);
    }
  }

  leaveRoom(orderNumber) {
    this.activeRooms.delete(orderNumber);
    if (this.rawSocket && this.mode === 'socketio') {
      this.rawSocket.emit('leave_order_room', orderNumber);
    }
  }
}

export const socket = new RealtimeAdapter();

export function subscribeToOrder(orderNumber) {
  if (orderNumber) {
    socket.joinRoom(orderNumber);
  }
}

export function unsubscribeFromOrder(orderNumber) {
  if (orderNumber) {
    socket.leaveRoom(orderNumber);
  }
}
