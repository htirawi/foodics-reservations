/**
 * useAddBranchesModal
 * Pure selection/filter logic for Add Branches modal (no DOM, no services)
 */

import { ref, computed, watch, type Ref } from 'vue';
import type { Branch } from '@/types/foodics';

function filterBranches(branches: Branch[] | undefined, query: string): Branch[] {
  if (!branches) return [];
  const q = query.trim().toLowerCase();
  if (!q) return branches;
  return branches.filter((branch) => {
    const name = branch.name?.toLowerCase() ?? '';
    const reference = branch.reference?.toLowerCase() ?? '';
    return name.includes(q) || reference.includes(q);
  });
}

export function useAddBranchesModal(disabledBranches: Ref<Branch[]> | Ref<Branch[] | undefined>) {
  const query = ref('');
  const selectedIds = ref<string[]>([]);
  const filtered = computed(() => filterBranches(disabledBranches.value, query.value));
  const selectedIdsSet = computed(() => new Set(selectedIds.value));
  const isAllSelected = computed(() =>
    filtered.value.length > 0 && filtered.value.every((b) => selectedIdsSet.value.has(b.id))
  );

  function toggleOne(id: string): void {
    const index = selectedIds.value.indexOf(id);
    if (index === -1) selectedIds.value.push(id);
    else selectedIds.value.splice(index, 1);
  }

  function toggleAll(): void {
    const filteredIds = filtered.value.map((b) => b.id);
    if (isAllSelected.value) {
      const filteredSet = new Set(filteredIds);
      selectedIds.value = selectedIds.value.filter((id) => !filteredSet.has(id));
    } else {
      const newIds = filteredIds.filter((id) => !selectedIdsSet.value.has(id));
      selectedIds.value.push(...newIds);
    }
  }

  watch(disabledBranches, () => {
    if (!disabledBranches.value) return;
    const validIds = new Set(disabledBranches.value.map((b) => b.id));
    selectedIds.value = selectedIds.value.filter((id) => validIds.has(id));
  });

  return {
    query,
    setQuery: (value: string) => { query.value = value; },
    filtered,
    selectedIds,
    selectedIdsSet,
    isAllSelected,
    toggleOne,
    toggleAll,
    clear: () => { selectedIds.value = []; query.value = ''; },
  };
}

