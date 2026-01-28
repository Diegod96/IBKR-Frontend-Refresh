/**
 * Portfolios Page
 *
 * Protected page for managing pies and slices.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PortfoliosClient } from './PortfoliosClient';

export const metadata = {
  title: 'Portfolios | IBKR Portfolio Manager',
  description: 'Manage your portfolio pies and slices',
};

export default async function PortfoliosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <PortfoliosClient />;
}
