import { createBrowserClient } from '@supabase/ssr';

// Read values from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Diagnostic check for client-side visibility
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('SUPABASE CONFIG ERROR: NEXT_PUBLIC environment variables are missing on the client.');
  }
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
