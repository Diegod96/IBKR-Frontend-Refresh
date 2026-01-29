/**
 * Portfolio Allocation Chart Component
 *
 * Displays a pie chart showing portfolio allocation by pie.
 */

'use client';

import { PieChart, Pie as RePie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Pie } from '@/types/pie';

interface PortfolioAllocationChartProps {
  pies: Pie[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function PortfolioAllocationChart({ pies }: PortfolioAllocationChartProps) {
  // Filter active pies with allocation > 0
  const data: ChartData[] = pies
    .filter((pie) => pie.is_active && pie.target_allocation > 0)
    .map((pie) => ({
      name: pie.name,
      value: Number(pie.target_allocation),
      color: pie.color,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No allocation data to display
      </div>
    );
  }

  const totalAllocation = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RePie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </RePie>
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Allocation']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Allocation Summary */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Allocated</span>
          <span
            className={`font-medium ${
              totalAllocation === 100
                ? 'text-green-600 dark:text-green-400'
                : totalAllocation > 100
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
            }`}
          >
            {totalAllocation.toFixed(1)}%
          </span>
        </div>
        {totalAllocation !== 100 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {totalAllocation < 100
              ? `${(100 - totalAllocation).toFixed(1)}% unallocated`
              : `${(totalAllocation - 100).toFixed(1)}% overallocated`}
          </p>
        )}
      </div>
    </div>
  );
}
