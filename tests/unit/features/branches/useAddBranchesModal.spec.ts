/**
 * useAddBranchesModal Unit Tests
 * Filter, selection, toggle logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useAddBranchesModal } from '@/features/branches/composables/useAddBranchesModal';
import type { Branch } from '@/types/foodics';

function createBranch(id: string, name: string, reference: string): Branch {
  return {
    id,
    name,
    reference,
    name_localized: name,
    accepts_reservations: false,
    reservation_duration: 60,
    reservation_times: {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    type: 1,
    receives_online_orders: false,
    opening_from: '09:00:00',
    opening_to: '23:00:00',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  };
}

describe('useAddBranchesModal', () => {
  let disabledBranches: ReturnType<typeof ref<Branch[]>>;

  beforeEach(() => {
    disabledBranches = ref<Branch[]>([
      createBranch('1', 'Branch One', 'BR-001'),
      createBranch('2', 'Branch Two', 'BR-002'),
      createBranch('3', 'Another Branch', 'BR-003'),
    ]);
  });

  describe('filtering', () => {
    it('returns all branches when query is empty', () => {
      const { filtered } = useAddBranchesModal(disabledBranches);
      expect(filtered.value).toHaveLength(3);
    });

    it('filters by name (case-insensitive)', () => {
      const { setQuery, filtered } = useAddBranchesModal(disabledBranches);
      setQuery('branch one');
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0]?.id).toBe('1');
    });

    it('filters by reference (case-insensitive)', () => {
      const { setQuery, filtered } = useAddBranchesModal(disabledBranches);
      setQuery('br-002');
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0]?.id).toBe('2');
    });

    it('filters by partial match', () => {
      const { setQuery, filtered } = useAddBranchesModal(disabledBranches);
      setQuery('another');
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0]?.id).toBe('3');
    });

    it('returns empty array when no matches', () => {
      const { setQuery, filtered } = useAddBranchesModal(disabledBranches);
      setQuery('nonexistent');
      expect(filtered.value).toHaveLength(0);
    });

    it('trims whitespace from query', () => {
      const { setQuery, filtered } = useAddBranchesModal(disabledBranches);
      setQuery('  branch one  ');
      expect(filtered.value).toHaveLength(1);
      expect(filtered.value[0]?.id).toBe('1');
    });
  });

  describe('selection', () => {
    it('starts with no selection', () => {
      const { selectedIds, selectedIdsSet } = useAddBranchesModal(disabledBranches);
      expect(selectedIds.value).toHaveLength(0);
      expect(selectedIdsSet.value.size).toBe(0);
    });

    it('toggles one branch on', () => {
      const { toggleOne, selectedIds, selectedIdsSet } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      expect(selectedIds.value).toEqual(['1']);
      expect(selectedIdsSet.value.has('1')).toBe(true);
    });

    it('toggles one branch off', () => {
      const { toggleOne, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('1');
      expect(selectedIds.value).toEqual([]);
    });

    it('toggles multiple branches independently', () => {
      const { toggleOne, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('2');
      expect(selectedIds.value).toEqual(['1', '2']);
      toggleOne('1');
      expect(selectedIds.value).toEqual(['2']);
    });

    it('selectedIdsSet reflects selectedIds', () => {
      const { toggleOne, selectedIdsSet } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('3');
      expect(selectedIdsSet.value.has('1')).toBe(true);
      expect(selectedIdsSet.value.has('2')).toBe(false);
      expect(selectedIdsSet.value.has('3')).toBe(true);
    });
  });

  describe('toggle all', () => {
    it('selects all when none selected', () => {
      const { toggleAll, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleAll();
      expect(selectedIds.value).toEqual(['1', '2', '3']);
    });

    it('deselects all when all selected', () => {
      const { toggleAll, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleAll();
      expect(selectedIds.value).toEqual(['1', '2', '3']);
      toggleAll();
      expect(selectedIds.value).toEqual([]);
    });

    it('operates on filtered list only', () => {
      const { setQuery, toggleAll, selectedIds } = useAddBranchesModal(disabledBranches);
      setQuery('branch');
      toggleAll();
      expect(selectedIds.value).toEqual(['1', '2']);
    });

    it('deselects only filtered items', () => {
      const { setQuery, toggleOne, toggleAll, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('2');
      toggleOne('3');
      setQuery('branch');
      toggleAll();
      expect(selectedIds.value).toEqual(['3']);
    });

    it('isAllSelected is false when none selected', () => {
      const { isAllSelected } = useAddBranchesModal(disabledBranches);
      expect(isAllSelected.value).toBe(false);
    });

    it('isAllSelected is true when all filtered selected', () => {
      const { toggleAll, isAllSelected } = useAddBranchesModal(disabledBranches);
      toggleAll();
      expect(isAllSelected.value).toBe(true);
    });

    it('isAllSelected is false when filtered list is empty', () => {
      const { setQuery, isAllSelected } = useAddBranchesModal(disabledBranches);
      setQuery('nonexistent');
      expect(isAllSelected.value).toBe(false);
    });

    it('isAllSelected respects filter', () => {
      const { setQuery, toggleOne, isAllSelected } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('2');
      setQuery('branch');
      expect(isAllSelected.value).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears selection and query', () => {
      const { toggleOne, setQuery, clear, selectedIds, query } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('2');
      setQuery('test');
      clear();
      expect(selectedIds.value).toEqual([]);
      expect(query.value).toBe('');
    });
  });

  describe('watcher', () => {
    it('removes invalid IDs when disabled branches change', async () => {
      const { toggleOne, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleOne('1');
      toggleOne('2');
      toggleOne('3');

      disabledBranches.value = [createBranch('1', 'Branch One', 'BR-001')];
      await nextTick(); // Wait for watcher to run

      expect(selectedIds.value).toEqual(['1']);
    });

    it('keeps valid IDs when disabled branches change', async () => {
      const { toggleOne, selectedIds } = useAddBranchesModal(disabledBranches);
      toggleOne('2');

      disabledBranches.value = [
        createBranch('2', 'Branch Two', 'BR-002'),
        createBranch('4', 'Branch Four', 'BR-004'),
      ];
      await nextTick(); // Wait for watcher to run

      expect(selectedIds.value).toEqual(['2']);
    });
  });
});

