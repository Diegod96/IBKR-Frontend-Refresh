/**
 * Pie List Component
 *
 * Displays a list of pies with their allocation and slice count.
 */

'use client';

import Link from 'next/link';
import type { Pie } from '@/types/pie';

interface PieListProps {
  pies: Pie[];
}

export function PieList({ pies }: PieListProps) {
  const activePies = pies.filter((pie) => pie.is_active);

  if (activePies.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No pies created yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activePies.map((pie) => (
        <Link
          key={pie.id}
          href="/portfolios"
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg"
              style={{ backgroundColor: pie.color }}
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {pie.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pie.slice_count} {pie.slice_count === 1 ? 'slice' : 'slices'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white">
              {Number(pie.target_allocation).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pie.total_slice_weight.toFixed(1)}% filled
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
