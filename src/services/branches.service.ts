/**
 * BranchesService
 * Typed API methods for branch operations
 */

import { httpClient } from '@/services/http';
import type { Branch, UpdateBranchSettingsPayload } from '@/types/foodics';
import type { FoodicsResponse } from '@/types/api';

export const BranchesService = {
  /**
   * Fetch all branches from the Foodics API
   * GET /branches?include[0]=sections&include[1]=sections.tables
   * @param includeSections - If true, includes sections and tables in response
   */
  async getBranches(includeSections = false): Promise<Branch[]> {
    const params = includeSections 
      ? { 'include[0]': 'sections', 'include[1]': 'sections.tables' }
      : {};
    const { data } = await httpClient.get<FoodicsResponse<Branch[]>>('/branches', { params });
    return data.data;
  },

  /**
   * Enable reservations for a branch
   * PUT /branches/:id with accepts_reservations: true
   */
  async enableBranch(id: string): Promise<Branch> {
    const { data } = await httpClient.put<FoodicsResponse<Branch>>(
      `/branches/${id}`,
      { accepts_reservations: true }
    );
    return data.data;
  },

  /**
   * Disable reservations for a branch
   * PUT /branches/:id with accepts_reservations: false
   */
  async disableBranch(id: string): Promise<Branch> {
    const { data } = await httpClient.put<FoodicsResponse<Branch>>(
      `/branches/${id}`,
      { accepts_reservations: false }
    );
    return data.data;
  },

  /**
   * Update branch reservation settings
   * PUT /branches/:id with duration & time slots
   */
  async updateBranchSettings(
    id: string,
    payload: UpdateBranchSettingsPayload
  ): Promise<Branch> {
    const { data } = await httpClient.put<FoodicsResponse<Branch>>(
      `/branches/${id}`,
      payload
    );
    return data.data;
  },
} as const;
