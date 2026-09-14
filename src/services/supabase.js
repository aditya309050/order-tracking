import { createClient } from '@supabase/supabase-js';

// Public fallbacks so the client works even before env vars are wired.
// These are the public (anon/publishable) Supabase credentials — safe for the browser.
const DEFAULT_SUPABASE_URL = 'https://awzersnexngjzextpxke.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emVyc25leG5nanpleHRweGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjQwNTksImV4cCI6MjEwNDgwMDA1OX0.F2ADLJJn2T7RboH8oEdEDorI8t4SFt1fXgZDhE0rFEI';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
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
          eventsPerSecond: 10,
        },
      },
    })
  : null;
