/**
 * Branch selection actions (toggle, select all)
 */

import { type Ref } from 'vue';

export function useBranchSelectionActions(
  selectedBranchIds: Ref<string[]>,
  disabledBranches: Ref<{ id: string }[]>,
  saving: Ref<boolean>
) {
  function toggleBranch(branchId: string): void {
    if (saving.value) return;
    
    const index = selectedBranchIds.value.indexOf(branchId);
    if (index > -1) {
      selectedBranchIds.value.splice(index, 1);
    } else {
      selectedBranchIds.value.push(branchId);
    }
  }

  function toggleSelectAll(): void {
    if (saving.value) return;
    
    if (selectedBranchIds.value.length === disabledBranches.value.length) {
      selectedBranchIds.value = [];
    } else {
      selectedBranchIds.value = disabledBranches.value.map((b) => b.id);
    }
  }

  return {
    toggleBranch,
    toggleSelectAll,
  };
}
