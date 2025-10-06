/**
 * Branch selection state management
 */

import { ref, computed, watch, type Ref } from 'vue';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import { useAsyncAction } from '@/composables/useAsyncAction';

export function useBranchSelectionState(isOpen: Ref<boolean>) {
  const selectedBranchIds = ref<string[]>([]);
  const branchesStore = useBranchesStore();
  const { busy } = useAsyncAction();

  const disabledBranches = computed(() => branchesStore.disabledBranches);
  const selectedIdsSet = computed(() => new Set(selectedBranchIds.value));
  const isAllSelected = computed(
    () => selectedBranchIds.value.length > 0 &&
      selectedBranchIds.value.length === disabledBranches.value.length
  );

  // Reset selection when modal opens
  watch(
    () => isOpen.value,
    (open) => {
      if (open) {
        selectedBranchIds.value = [];
      }
    }
  );

  return {
    selectedBranchIds,
    disabledBranches,
    selectedIdsSet,
    isAllSelected,
    saving: busy,
  };
}
