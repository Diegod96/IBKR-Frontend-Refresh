/**
 * Pie Card Component
 *
 * Displays a single pie with its slices in a card format.
 */

'use client';

import { useState } from 'react';
import type { Pie } from '@/types/pie';
import { Button } from '@/components/ui/Button';

interface PieCardProps {
  pie: Pie;
  onEdit: (pie: Pie) => void;
  onDelete: (pieId: string) => void;
  onAddSlice: (pieId: string) => void;
  onEditSlice: (pieId: string, sliceId: string) => void;
  onDeleteSlice: (pieId: string, sliceId: string) => void;
}

export function PieCard({
  pie,
  onEdit,
  onDelete,
  onAddSlice,
  onEditSlice,
  onDeleteSlice,
}: PieCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const remainingWeight = 100 - pie.total_slice_weight;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Pie Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Color indicator */}
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: pie.color }}
          >
            {pie.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {pie.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pie.slice_count} {pie.slice_count === 1 ? 'slice' : 'slices'} •{' '}
              {pie.target_allocation}% allocation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Weight progress */}
          <div className="hidden sm:block w-32">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Weight</span>
              <span>{pie.total_slice_weight}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${pie.total_slice_weight}%`,
                  backgroundColor: pie.color,
                }}
              />
            </div>
          </div>

          {/* Expand/Collapse icon */}
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Description */}
          {pie.description && (
            <p className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
              {pie.description}
            </p>
          )}

          {/* Slices list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {pie.slices.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No slices yet. Add your first slice to this pie.
              </div>
            ) : (
              pie.slices.map((slice) => (
                <div
                  key={slice.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px]">
                      {slice.symbol}
                    </div>
                    {slice.name && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {slice.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {slice.target_weight}%
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSlice(pie.id, slice.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlice(pie.id, slice.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Remaining weight indicator */}
          {remainingWeight > 0 && pie.slices.length > 0 && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
              {remainingWeight}% weight remaining to allocate
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddSlice(pie.id);
              }}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Slice
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(pie);
                }}
              >
                Edit Pie
              </Button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Delete?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(pie.id);
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
