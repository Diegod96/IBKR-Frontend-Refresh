/**
 * Slice Form Modal Component
 *
 * Modal dialog for creating and editing slices.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Slice, CreateSliceData, UpdateSliceData } from '@/types/pie';

interface SliceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSliceData | UpdateSliceData) => Promise<void>;
  slice?: Slice | null;
  currentTotalWeight: number;
}

export function SliceFormModal({
  isOpen,
  onClose,
  onSubmit,
  slice,
  currentTotalWeight,
}: SliceFormModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!slice;

  // Calculate max weight allowed
  const existingWeight = slice?.target_weight || 0;
  const maxWeight = 100 - currentTotalWeight + existingWeight;

  useEffect(() => {
    if (slice) {
      setSymbol(slice.symbol);
      setName(slice.name || '');
      setTargetWeight(slice.target_weight.toString());
      setNotes(slice.notes || '');
    } else {
      setSymbol('');
      setName('');
      setTargetWeight('');
      setNotes('');
    }
    setError(null);
  }, [slice, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const weight = parseFloat(targetWeight);

    if (!weight || weight <= 0) {
      setError('Weight must be greater than 0');
      setIsLoading(false);
      return;
    }

    if (weight > maxWeight) {
      setError(`Weight cannot exceed ${maxWeight.toFixed(2)}%`);
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit({
        symbol: symbol.toUpperCase(),
        name: name || undefined,
        target_weight: weight,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {isEditing ? 'Edit Slice' : 'Add New Slice'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            required
            maxLength={20}
            disabled={isEditing}
            helperText={isEditing ? 'Symbol cannot be changed' : undefined}
          />

          <Input
            label="Company Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Apple Inc."
            maxLength={100}
          />

          <Input
            label={`Target Weight (max ${maxWeight.toFixed(2)}%)`}
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="e.g., 25"
            required
            min={0.01}
            max={maxWeight}
            step={0.01}
            helperText={`${currentTotalWeight.toFixed(2)}% currently allocated in this pie`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this holding..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Save Changes' : 'Add Slice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
