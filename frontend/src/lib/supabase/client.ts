/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in browser/client components.
 * Uses cookie-based session storage for better SSR support.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
