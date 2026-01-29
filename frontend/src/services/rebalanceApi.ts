/**
 * Rebalance API Service
 *
 * Client-side API functions for portfolio rebalancing.
 */

import { fetchAPI } from '@/lib/supabase';

export interface SliceRebalanceItem {
  slice_id: string;
  symbol: string;
  name: string | null;
  current_weight: number;
  target_weight: number;
  drift: number;
  suggested_action: 'buy' | 'sell' | 'hold';
}

export interface PieRebalanceItem {
  pie_id: string;
  name: string;
  color: string;
  current_allocation: number;
  target_allocation: number;
  drift: number;
  slices: SliceRebalanceItem[];
}

export interface RebalanceAnalysis {
  portfolio_id: string;
  total_drift: number;
  pies: PieRebalanceItem[];
  needs_rebalancing: boolean;
}

export interface RebalanceAction {
  pie_id: string;
  new_allocation: number;
}

export interface RebalanceRequest {
  actions: RebalanceAction[];
}

export interface RebalanceResult {
  success: boolean;
  message: string;
  updated_pies: string[];
}

export async function getRebalanceAnalysis(portfolioId: string): Promise<RebalanceAnalysis> {
  return fetchAPI<RebalanceAnalysis>(`/rebalance/${portfolioId}/analysis`);
}

export async function executeRebalance(
  portfolioId: string,
  request: RebalanceRequest
): Promise<RebalanceResult> {
  return fetchAPI<RebalanceResult>(`/rebalance/${portfolioId}/execute`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function autoRebalance(portfolioId: string): Promise<RebalanceResult> {
  return fetchAPI<RebalanceResult>(`/rebalance/${portfolioId}/auto-rebalance`, {
    method: 'POST',
  });
}
