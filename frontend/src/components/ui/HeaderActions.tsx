/**
 * Header Actions Component (Client)
 *
 * Client-side component that handles auth actions like logout.
 * Separated from Header to keep the server component pattern.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from './Button';
import type { User } from '@supabase/supabase-js';

interface HeaderActionsProps {
  user: User | null;
}

export function HeaderActions({ user }: HeaderActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block">
          {user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          isLoading={isLoading}
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
      >
        Sign In
      </Link>
      <Link href="/signup">
        <Button size="sm">Get Started</Button>
      </Link>
    </div>
  );
}
