/**
 * @file useBranchSelectionState.ts
 * @summary Module: src/features/branches/composables/useBranchSelectionState.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref, computed, watch, type Ref } from "vue";

import { useAsyncAction } from "@/composables/useAsyncAction";
import { useBranchesStore } from "@/features/branches/stores/branches.store";

export function useBranchSelectionState(isOpen: Ref<boolean>) {
    const selectedBranchIds = ref<string[]>([]);
    const branchesStore = useBranchesStore();
    const { busy } = useAsyncAction();
    const disabledBranches = computed(() => branchesStore.disabledBranches);
    const selectedIdsSet = computed(() => new Set(selectedBranchIds.value));
    const isAllSelected = computed(() => selectedBranchIds.value.length > 0 &&
        selectedBranchIds.value.length === disabledBranches.value.length);
    watch(() => isOpen.value, (open) => {
        if (open) {
            selectedBranchIds.value = [];
        }
    });
    return {
        selectedBranchIds,
        disabledBranches,
        selectedIdsSet,
        isAllSelected,
        saving: busy,
    };
}
