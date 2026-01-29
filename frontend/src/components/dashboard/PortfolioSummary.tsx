/**
 * Portfolio Summary Component
 *
 * Displays summary cards for portfolio statistics.
 */

'use client';

import type { Pie } from '@/types/pie';
import type { Portfolio } from '@/types';

interface PortfolioSummaryProps {
  portfolio: Portfolio | null;
  pies: Pie[];
}

export function PortfolioSummary({ portfolio, pies }: PortfolioSummaryProps) {
  // Calculate statistics
  const totalPies = pies.filter((p) => p.is_active).length;
  const totalSlices = pies.reduce(
    (sum, pie) => sum + pie.slices.filter((s) => s.is_active).length,
    0
  );
  const totalAllocation = pies
    .filter((p) => p.is_active)
    .reduce((sum, pie) => sum + Number(pie.target_allocation), 0);

  const stats = [
    {
      label: 'Portfolio',
      value: portfolio?.name ?? 'No Portfolio Selected',
      subtext: portfolio?.account_type
        ? portfolio.account_type.replace(/_/g, ' ').toUpperCase()
        : 'Default',
    },
    {
      label: 'Total Pies',
      value: totalPies.toString(),
      subtext: 'Active pies',
    },
    {
      label: 'Total Slices',
      value: totalSlices.toString(),
      subtext: 'Individual holdings',
    },
    {
      label: 'Allocation',
      value: `${totalAllocation.toFixed(1)}%`,
      subtext: totalAllocation === 100 ? 'Fully allocated' : `${(100 - totalAllocation).toFixed(1)}% remaining`,
      highlight: totalAllocation === 100,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {stat.label}
          </p>
          <p
            className={`mt-1 text-2xl font-bold ${
              stat.highlight
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
