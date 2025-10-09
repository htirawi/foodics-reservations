import { type Ref } from "vue";

import { useI18n } from "vue-i18n";

import { useToast } from "@/composables/useToast";
import { useBranchesStore } from "@/features/branches/stores/branches.store";

import { useBranchEnabling } from "@features/branches/composables/useBranchEnabling";
import { useBranchSelectionActions } from "@features/branches/composables/useBranchSelectionActions";
import { useBranchSelectionState } from "@features/branches/composables/useBranchSelectionState";

export function useBranchSelection(isOpen: Ref<boolean>) {
    const branchesStore = useBranchesStore();
    const { t } = useI18n();
    const toast = useToast();
    const state = useBranchSelectionState(isOpen);
    const actions = useBranchSelectionActions(state.selectedBranchIds, state.disabledBranches, state.saving);
    const enabling = useBranchEnabling(state.selectedBranchIds, branchesStore, toast, t);
    return {
        selectedBranchIds: state.selectedBranchIds,
        selectedIdsSet: state.selectedIdsSet,
        disabledBranches: state.disabledBranches,
        isAllSelected: state.isAllSelected,
        saving: enabling.saving,
        toggleBranch: actions.toggleBranch,
        toggleSelectAll: actions.toggleSelectAll,
        enableSelectedBranches: enabling.enableSelectedBranches,
    };
}
