/**
 * Unit tests for BranchesService
 * Tests all API methods with success and error paths
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@/services/http';
import { BranchesService } from '@/services/branches.service';
import type { Branch, ReservationTimes } from '@/types/foodics';
import type { ApiError } from '@/types/api';

describe('BranchesService', () => {
  let mock: MockAdapter;

  const mockReservationTimes: ReservationTimes = {
    saturday: [['09:00', '12:00'], ['18:00', '22:00']],
    sunday: [['09:00', '12:00']],
    monday: [],
    tuesday: [['17:00', '23:00']],
    wednesday: [['17:00', '23:00']],
    thursday: [['17:00', '23:00']],
    friday: [['12:00', '23:00']],
  };

  const mockBranch: Branch = {
    id: 'branch-123',
    name: 'Downtown Location',
    name_localized: null,
    reference: 'DT-001',
    type: 1,
    accepts_reservations: true,
    reservation_duration: 90,
    reservation_times: mockReservationTimes,
    receives_online_orders: true,
    opening_from: '09:00',
    opening_to: '23:00',
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    deleted_at: null,
  };

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
    vi.stubEnv('VITE_FOODICS_TOKEN', 'test-token');
  });

  afterEach(() => {
    mock.restore();
    vi.unstubAllEnvs();
  });

  describe('getBranches', () => {
    it('should fetch all branches successfully without sections', async () => {
      const branches = [mockBranch, { ...mockBranch, id: 'branch-456' }];
      mock.onGet('/branches').reply(200, { data: branches });

      const result = await BranchesService.getBranches();

      expect(result).toEqual(branches);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('branch-123');
      expect(result[0]?.sections).toBeUndefined();
    });

    it('should fetch branches with sections when requested', async () => {
      const branchWithSections: Branch = {
        ...mockBranch,
        sections: [
          {
            id: 'section-1',
            branch_id: 'branch-123',
            name: 'Main Dining',
            name_localized: null,
            created_at: '2024-01-01 00:00:00',
            updated_at: '2024-01-01 00:00:00',
            deleted_at: null,
            tables: [
              {
                id: 'table-1',
                name: 'Table 1',
                section_id: 'section-1',
                accepts_reservations: true,
                seats: 4,
                status: 1,
                created_at: '2024-01-01 00:00:00',
                updated_at: '2024-01-01 00:00:00',
                deleted_at: null,
              },
            ],
          },
        ],
      };
      mock.onGet('/branches', { params: { include: 'sections.tables' } })
        .reply(200, { data: [branchWithSections] });

      const result = await BranchesService.getBranches(true);

      expect(result).toHaveLength(1);
      expect(result[0]?.sections).toBeDefined();
      expect(result[0]?.sections).toHaveLength(1);
      expect(result[0]?.sections?.[0]?.tables).toHaveLength(1);
    });

    it('should unwrap Foodics response wrapper', async () => {
      mock.onGet('/branches').reply(200, { data: [mockBranch] });

      const result = await BranchesService.getBranches();

      // Should return unwrapped array, not { data: [...] }
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]?.name).toBe('Downtown Location');
    });

    it('should handle empty branch list', async () => {
      mock.onGet('/branches').reply(200, { data: [] });

      const result = await BranchesService.getBranches();

      expect(result).toEqual([]);
    });

    it('should propagate normalized errors', async () => {
      mock.onGet('/branches').reply(500, { message: 'Server error' });

      await expect(BranchesService.getBranches()).rejects.toMatchObject({
        status: 500,
        message: 'Server error',
      } as ApiError);
    });

    it('should handle network failures', async () => {
      mock.onGet('/branches').networkError();

      await expect(BranchesService.getBranches()).rejects.toMatchObject({
        status: 500,
      } as ApiError);
    });
  });

  describe('enableBranch', () => {
    it('should enable reservations for a branch', async () => {
      const enabledBranch = { ...mockBranch, accepts_reservations: true };
      mock.onPatch('/branches/branch-123').reply(200, { data: enabledBranch });

      const result = await BranchesService.enableBranch('branch-123');

      expect(result.accepts_reservations).toBe(true);
      expect(result.id).toBe('branch-123');
    });

    it('should send accepts_reservations: true in payload', async () => {
      mock.onPatch('/branches/branch-123').reply((config) => {
        const payload = JSON.parse(config.data as string);
        expect(payload).toEqual({ accepts_reservations: true });
        return [200, { data: mockBranch }];
      });

      await BranchesService.enableBranch('branch-123');
    });

    it('should handle 404 for non-existent branch', async () => {
      mock.onPatch('/branches/invalid-id').reply(404, { message: 'Branch not found' });

      await expect(BranchesService.enableBranch('invalid-id')).rejects.toMatchObject({
        status: 404,
        message: 'Branch not found',
      } as ApiError);
    });

    it('should unwrap Foodics response wrapper', async () => {
      mock.onPatch('/branches/branch-123').reply(200, { data: mockBranch });

      const result = await BranchesService.enableBranch('branch-123');

      // Should return Branch, not { data: Branch }
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Downtown Location');
    });
  });

  describe('disableBranch', () => {
    it('should disable reservations for a branch', async () => {
      const disabledBranch = { ...mockBranch, accepts_reservations: false };
      mock.onPatch('/branches/branch-123').reply(200, { data: disabledBranch });

      const result = await BranchesService.disableBranch('branch-123');

      expect(result.accepts_reservations).toBe(false);
      expect(result.id).toBe('branch-123');
    });

    it('should send accepts_reservations: false in payload', async () => {
      mock.onPatch('/branches/branch-123').reply((config) => {
        const payload = JSON.parse(config.data as string);
        expect(payload).toEqual({ accepts_reservations: false });
        return [200, { data: mockBranch }];
      });

      await BranchesService.disableBranch('branch-123');
    });

    it('should handle authorization errors', async () => {
      mock.onPatch('/branches/branch-123').reply(403, { message: 'Forbidden' });

      await expect(BranchesService.disableBranch('branch-123')).rejects.toMatchObject({
        status: 403,
        message: 'Forbidden',
      } as ApiError);
    });
  });

  describe('updateBranchSettings', () => {
    const updatePayload = {
      reservation_duration: 120,
      reservation_times: {
        ...mockReservationTimes,
        saturday: [['10:00', '14:00'], ['19:00', '23:00']],
      },
    };

    it('should update branch reservation settings', async () => {
      const updatedBranch = { ...mockBranch, ...updatePayload };
      mock.onPatch('/branches/branch-123').reply(200, { data: updatedBranch });

      const result = await BranchesService.updateBranchSettings('branch-123', updatePayload);

      expect(result.reservation_duration).toBe(120);
      expect(result.reservation_times.saturday).toHaveLength(2);
    });

    it('should send complete payload to API', async () => {
      mock.onPatch('/branches/branch-123').reply((config) => {
        const payload = JSON.parse(config.data as string);
        expect(payload.reservation_duration).toBe(120);
        expect(payload.reservation_times).toBeDefined();
        expect(payload.reservation_times.saturday).toHaveLength(2);
        return [200, { data: mockBranch }];
      });

      await BranchesService.updateBranchSettings('branch-123', updatePayload);
    });

    it('should handle validation errors', async () => {
      mock.onPatch('/branches/branch-123').reply(422, {
        message: 'Validation failed',
        errors: {
          reservation_duration: ['Must be positive'],
        },
      });

      await expect(
        BranchesService.updateBranchSettings('branch-123', updatePayload)
      ).rejects.toMatchObject({
        status: 422,
        message: 'Validation failed',
      } as ApiError);
    });

    it('should handle partial updates', async () => {
      const partialPayload = {
        reservation_duration: 60,
        reservation_times: mockReservationTimes,
      };
      const updatedBranch = { ...mockBranch, reservation_duration: 60 };
      mock.onPatch('/branches/branch-123').reply(200, { data: updatedBranch });

      const result = await BranchesService.updateBranchSettings('branch-123', partialPayload);

      expect(result.reservation_duration).toBe(60);
    });

    it('should unwrap Foodics response wrapper', async () => {
      mock.onPatch('/branches/branch-123').reply(200, { data: mockBranch });

      const result = await BranchesService.updateBranchSettings('branch-123', updatePayload);

      // Should return Branch, not { data: Branch }
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.reservation_times).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed Branch objects', async () => {
      mock.onGet('/branches').reply(200, { data: [mockBranch] });

      const branches = await BranchesService.getBranches();
      const branch = branches[0];

      if (branch) {
        // These should compile without type errors
        expect(typeof branch.id).toBe('string');
        expect(typeof branch.name).toBe('string');
        expect(typeof branch.accepts_reservations).toBe('boolean');
        expect(typeof branch.reservation_duration).toBe('number');
        expect(typeof branch.type).toBe('number');
        expect(typeof branch.opening_from).toBe('string');
        expect(typeof branch.opening_to).toBe('string');
        expect(branch.reservation_times.saturday).toBeDefined();
        // sections is optional
        expect(branch.sections === undefined || Array.isArray(branch.sections)).toBe(true);
      }
    });
  });
});
