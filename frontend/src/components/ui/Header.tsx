/**
 * Header Component
 *
 * Main navigation header with authentication state display.
 * Shows login/signup buttons when not authenticated,
 * and user email with logout when authenticated.
 */

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HeaderActions } from './HeaderActions';

export async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link
              href={user ? '/dashboard' : '/'}
              className="flex items-center space-x-2"
            >
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                IBKR Portfolio
              </span>
            </Link>
          </div>

          {/* Navigation Links (when authenticated) */}
          {user && (
            <nav className="hidden md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                Dashboard
              </Link>
              <Link
                href="/portfolios"
                className="text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                Portfolios
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                Settings
              </Link>
            </nav>
          )}

          {/* Auth Actions */}
          <HeaderActions user={user} />
        </div>
      </div>
    </header>
  );
}
