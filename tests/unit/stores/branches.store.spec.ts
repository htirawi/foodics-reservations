/**
 * Branches Store Unit Tests
 * Behavior-first tests with mocked services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import { BranchesService } from '@/services/branches.service';
import type { Branch, UpdateBranchSettingsPayload } from '@/types/foodics';

vi.mock('@/services/branches.service');

const mockBranch: Branch = {
  id: '1',
  name: 'Downtown Branch',
  name_localized: null,
  reference: 'BR-001',
  type: 1,
  accepts_reservations: true,
  reservation_duration: 60,
  reservation_times: {
    saturday: [['09:00', '17:00']],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  },
  receives_online_orders: false,
  opening_from: '09:00',
  opening_to: '22:00',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

const mockBranch2: Branch = {
  ...mockBranch,
  id: '2',
  name: 'Uptown Branch',
  accepts_reservations: false,
};

describe('useBranchesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty branches and null selection', () => {
      const store = useBranchesStore();

      expect(store.branches).toEqual([]);
      expect(store.selectedBranchId).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetchBranches', () => {
    it('loads branches successfully', async () => {
      const store = useBranchesStore();
      vi.mocked(BranchesService.getBranches).mockResolvedValue([mockBranch, mockBranch2]);

      await store.fetchBranches();

      expect(store.branches).toEqual([mockBranch, mockBranch2]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('sets loading state during fetch', async () => {
      const store = useBranchesStore();
      vi.mocked(BranchesService.getBranches).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([mockBranch]), 100))
      );

      const fetchPromise = store.fetchBranches();
      expect(store.loading).toBe(true);

      await fetchPromise;
      expect(store.loading).toBe(false);
    });

    it('handles fetch errors', async () => {
      const store = useBranchesStore();
      const apiError = { status: 500, message: 'Network error' };
      vi.mocked(BranchesService.getBranches).mockRejectedValue(apiError);

      await expect(store.fetchBranches()).rejects.toEqual(apiError);
      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('passes includeSections flag to service', async () => {
      const store = useBranchesStore();
      vi.mocked(BranchesService.getBranches).mockResolvedValue([]);

      await store.fetchBranches(true);

      expect(BranchesService.getBranches).toHaveBeenCalledWith(true);
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      const store = useBranchesStore();
      store.branches = [mockBranch, mockBranch2];
    });

    it('enabledBranches filters correctly', () => {
      const store = useBranchesStore();

      expect(store.enabledBranches).toHaveLength(1);
      expect(store.enabledBranches[0]?.id).toBe('1');
    });

    it('disabledBranches filters correctly', () => {
      const store = useBranchesStore();

      expect(store.disabledBranches).toHaveLength(1);
      expect(store.disabledBranches[0]?.id).toBe('2');
    });

    it('branchById returns correct branch', () => {
      const store = useBranchesStore();

      const branch = store.branchById('1');
      expect(branch).toEqual(mockBranch);
    });

    it('branchById returns null for missing id', () => {
      const store = useBranchesStore();

      const branch = store.branchById('999');
      expect(branch).toBeNull();
    });

    it('reservableTablesCount calculates correctly', () => {
      const store = useBranchesStore();
      const branchWithTables: Branch = {
        ...mockBranch,
        sections: [
          {
            id: 's1',
            branch_id: '1',
            name: 'Main',
            name_localized: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            tables: [
              {
                id: 't1',
                name: 'T1',
                section_id: 's1',
                accepts_reservations: true,
                seats: 4,
                status: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                deleted_at: null,
              },
              {
                id: 't2',
                name: 'T2',
                section_id: 's1',
                accepts_reservations: false,
                seats: 2,
                status: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                deleted_at: null,
              },
            ],
          },
        ],
      };

      const count = store.reservableTablesCount(branchWithTables);
      expect(count).toBe(1);
    });

    it('reservableTablesCount returns 0 when no sections', () => {
      const store = useBranchesStore();

      const count = store.reservableTablesCount(mockBranch);
      expect(count).toBe(0);
    });
  });

  describe('enableBranches (optimistic)', () => {
    it('optimistically enables branches and calls service', async () => {
      const store = useBranchesStore();
      store.branches = [mockBranch, mockBranch2];
      vi.mocked(BranchesService.enableBranch).mockResolvedValue(mockBranch2);

      await store.enableBranches(['2']);

      expect(store.branches[1]?.accepts_reservations).toBe(true);
      expect(BranchesService.enableBranch).toHaveBeenCalledWith('2');
    });

    it('rolls back on service failure', async () => {
      const store = useBranchesStore();
      const initialBranches = [mockBranch, mockBranch2];
      store.branches = [...initialBranches];

      const apiError = { status: 500, message: 'Failed to enable' };
      vi.mocked(BranchesService.enableBranch).mockRejectedValue(apiError);

      await expect(store.enableBranches(['2'])).rejects.toEqual(apiError);

      expect(store.branches).toEqual(initialBranches);
      expect(store.error).toBe('Failed to enable');
    });

    it('handles multiple branches optimistically', async () => {
      const store = useBranchesStore();
      const branch3: Branch = { ...mockBranch, id: '3', accepts_reservations: false };
      store.branches = [mockBranch, mockBranch2, branch3];

      vi.mocked(BranchesService.enableBranch).mockResolvedValue(mockBranch);

      await store.enableBranches(['2', '3']);

      expect(store.branches[1]?.accepts_reservations).toBe(true);
      expect(store.branches[2]?.accepts_reservations).toBe(true);
      expect(BranchesService.enableBranch).toHaveBeenCalledTimes(2);
    });
  });

  describe('disableAll (optimistic)', () => {
    it('optimistically disables all branches', async () => {
      const store = useBranchesStore();
      const enabledBranch3: Branch = { ...mockBranch, id: '3', accepts_reservations: true };
      store.branches = [mockBranch, mockBranch2, enabledBranch3];

      vi.mocked(BranchesService.disableBranch).mockResolvedValue(mockBranch);

      await store.disableAll();

      expect(store.branches.every((b) => !b.accepts_reservations)).toBe(true);
      expect(BranchesService.disableBranch).toHaveBeenCalledTimes(2);
      expect(BranchesService.disableBranch).toHaveBeenCalledWith('1');
      expect(BranchesService.disableBranch).toHaveBeenCalledWith('3');
    });

    it('rolls back on failure', async () => {
      const store = useBranchesStore();
      const initialBranches = [mockBranch, mockBranch2];
      store.branches = [...initialBranches];

      const apiError = { status: 500, message: 'Failed to disable' };
      vi.mocked(BranchesService.disableBranch).mockRejectedValue(apiError);

      await expect(store.disableAll()).rejects.toEqual(apiError);

      expect(store.branches).toEqual(initialBranches);
      expect(store.error).toBe('Failed to disable');
    });
  });

  describe('updateSettings (optimistic)', () => {
    it('optimistically updates settings and calls service', async () => {
      const store = useBranchesStore();
      store.branches = [mockBranch];

      const payload: UpdateBranchSettingsPayload = {
        reservation_duration: 90,
        reservation_times: {
          saturday: [['10:00', '18:00']],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
      };

      const updatedBranch: Branch = { ...mockBranch, ...payload };
      vi.mocked(BranchesService.updateBranchSettings).mockResolvedValue(updatedBranch);

      await store.updateSettings('1', payload);

      expect(store.branches[0]?.reservation_duration).toBe(90);
      expect(BranchesService.updateBranchSettings).toHaveBeenCalledWith('1', payload);
    });

    it('rolls back on service failure', async () => {
      const store = useBranchesStore();
      const initialBranch = { ...mockBranch };
      store.branches = [initialBranch];

      const apiError = { status: 400, message: 'Invalid settings' };
      vi.mocked(BranchesService.updateBranchSettings).mockRejectedValue(apiError);

      const payload: UpdateBranchSettingsPayload = {
        reservation_duration: 120,
        reservation_times: mockBranch.reservation_times,
      };

      await expect(store.updateSettings('1', payload)).rejects.toEqual(apiError);

      expect(store.branches[0]).toEqual(initialBranch);
      expect(store.error).toBe('Invalid settings');
    });

    it('throws error for non-existent branch', async () => {
      const store = useBranchesStore();
      store.branches = [mockBranch];

      const payload: UpdateBranchSettingsPayload = {
        reservation_duration: 90,
        reservation_times: mockBranch.reservation_times,
      };

      await expect(store.updateSettings('999', payload)).rejects.toThrow(
        'Branch with id 999 not found'
      );
    });
  });

  describe('selection actions', () => {
    it('selectBranch sets selected ID', () => {
      const store = useBranchesStore();

      store.selectBranch('1');

      expect(store.selectedBranchId).toBe('1');
    });

    it('clearSelection resets selected ID', () => {
      const store = useBranchesStore();
      store.selectedBranchId = '1';

      store.clearSelection();

      expect(store.selectedBranchId).toBeNull();
    });
  });
});
