import { createClient } from '@supabase/supabase-js';
import { env, features } from '../env';

// Server client - uses service role key for admin operations
export function getServerSupabase() {
  if (!features.supabaseEnabled || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase server is not configured');
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Auth client for user operations
export function getAuthSupabase() {
  if (!features.supabaseEnabled) {
    throw new Error('Supabase is not configured');
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
