/**
 * Dashboard Page
 *
 * Protected page that displays user portfolio overview.
 * Requires authentication to access.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export const metadata = {
  title: 'Dashboard | IBKR Portfolio Manager',
  description: 'View your portfolio overview and performance metrics',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check authentication (middleware should handle this, but defense in depth)
  if (!user) {
    redirect('/login');
  }

  return <DashboardClient userEmail={user.email!} />;
}
