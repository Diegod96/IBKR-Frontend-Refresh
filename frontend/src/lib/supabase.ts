/**
 * Supabase Client Exports
 * 
 * Re-exports from the supabase folder for backwards compatibility.
 * Prefer importing directly from '@/lib/supabase/client' or '@/lib/supabase/server'.
 */

// Browser client for client components
export { createClient as createBrowserClient } from './supabase/client';

// Legacy export for existing code
import { createClient } from './supabase/client';
export const supabase = createClient();

/**
 * API base URL for backend requests
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Fetch wrapper for API requests with authentication
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
