/**
 * Dashboard Page
 *
 * Protected page that displays user portfolio overview.
 * Requires authentication to access.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | IBKR Portfolio Manager',
  description: 'View your portfolio overview and performance metrics',
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check authentication (middleware should handle this, but defense in depth)
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Portfolio Value"
            value="--"
            change={null}
            subtitle="Connect IBKR to see data"
          />
          <StatCard
            title="Today's Change"
            value="--"
            change={null}
            subtitle="Connect IBKR to see data"
          />
          <StatCard
            title="Total Gain/Loss"
            value="--"
            change={null}
            subtitle="Connect IBKR to see data"
          />
          <StatCard
            title="Cash Balance"
            value="--"
            change={null}
            subtitle="Connect IBKR to see data"
          />
        </div>

        {/* Getting Started */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Get Started
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            To view your portfolio data, you'll need to connect your Interactive
            Brokers account. This feature will be available in a future update.
          </p>
          <div className="mt-4 flex gap-4">
            <button
              disabled
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
            >
              Connect IBKR Account
            </button>
            <a
              href="https://www.interactivebrokers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Learn About IBKR
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Placeholder Sections */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <div className="mt-4 flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No recent activity to display
            </div>
          </div>

          {/* Portfolio Allocation */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Portfolio Allocation
            </h2>
            <div className="mt-4 flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Connect your account to see allocation
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: number | null;
  subtitle?: string;
}

function StatCard({ title, value, change, subtitle }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {change !== null ? (
        <p
          className={`mt-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </p>
      ) : subtitle ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
