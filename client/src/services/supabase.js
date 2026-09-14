import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://awzersnexngjzextpxke.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emVyc25leG5nanpleHRweGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjQwNTksImV4cCI6MjEwNDgwMDA1OX0.F2ADLJJn2T7RboH8oEdEDorI8t4SFt1fXgZDhE0rFEI';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * Subscribe to Supabase Realtime changes on 'orders' table
 * Broadcasts updates instantly across all connected browsers
 */
export function subscribeToSupabaseRealtime(onOrderChange) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        if (onOrderChange) {
          onOrderChange(payload);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
