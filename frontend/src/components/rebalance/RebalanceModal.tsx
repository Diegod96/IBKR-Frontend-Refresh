/**
 * Rebalance Modal Component
 *
 * Modal for viewing and executing portfolio rebalancing.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import type { RebalanceAnalysis, PieRebalanceItem } from '@/services/rebalanceApi';
import * as rebalanceApi from '@/services/rebalanceApi';

interface RebalanceModalProps {
  portfolioId: string;
  isOpen: boolean;
  onClose: () => void;
  onRebalanced: () => void;
}

export function RebalanceModal({
  portfolioId,
  isOpen,
  onClose,
  onRebalanced,
}: RebalanceModalProps) {
  const [analysis, setAnalysis] = useState<RebalanceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAnalysis = useCallback(async () => {
    if (!isOpen || !portfolioId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await rebalanceApi.getRebalanceAnalysis(portfolioId);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rebalance analysis');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, portfolioId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleExecuteRebalance = async () => {
    if (!analysis) return;
    
    try {
      setIsExecuting(true);
      setError(null);
      
      // Create rebalance actions to reset to target allocations
      const actions = analysis.pies.map((pie) => ({
        pie_id: pie.pie_id,
        new_allocation: pie.target_allocation,
      }));
      
      const result = await rebalanceApi.executeRebalance(portfolioId, { actions });
      setSuccess(result.message);
      onRebalanced();
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute rebalance');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Rebalance Portfolio
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and adjust your portfolio allocations
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : analysis ? (
          <>
            {/* Summary */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Drift</p>
                  <p className={`text-2xl font-bold ${
                    analysis.needs_rebalancing
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {analysis.total_drift.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className={`font-medium ${
                    analysis.needs_rebalancing
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {analysis.needs_rebalancing ? 'Rebalancing Recommended' : 'Well Balanced'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pie Allocations */}
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Pie Allocations</h3>
              {analysis.pies.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No pies in this portfolio</p>
              ) : (
                analysis.pies.map((pie) => (
                  <PieRebalanceRow key={pie.pie_id} pie={pie} />
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} disabled={isExecuting}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteRebalance}
                disabled={isExecuting || !analysis.needs_rebalancing}
              >
                {isExecuting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Rebalancing...
                  </>
                ) : (
                  'Rebalance to Targets'
                )}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PieRebalanceRow({ pie }: { pie: PieRebalanceItem }) {
  const drift = pie.drift;
  const driftAbs = Math.abs(Number(drift));
  const driftPercent = driftAbs.toFixed(1);
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded"
          style={{ backgroundColor: pie.color }}
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{pie.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Target: {pie.target_allocation}%
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-white">
          {pie.current_allocation}%
        </p>
        {driftAbs > 0.1 && (
          <p className={`text-xs ${
            drift > 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {drift > 0 ? '+' : ''}{driftPercent}% drift
          </p>
        )}
      </div>
    </div>
  );
}
