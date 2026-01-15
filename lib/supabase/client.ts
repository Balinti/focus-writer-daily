import { createClient } from '@supabase/supabase-js';
import { clientEnv, clientFeatures } from '../env';

// Browser client - uses anon key
export const supabase = clientFeatures.supabaseEnabled
  ? createClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}
