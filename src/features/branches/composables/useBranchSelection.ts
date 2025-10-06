/**
 * Main branch selection composable
 * Orchestrates state, actions, and enabling logic
 */

import { type Ref } from 'vue';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import { useToast } from '@/composables/useToast';
import { useI18n } from 'vue-i18n';
import { useBranchSelectionState } from './useBranchSelectionState';
import { useBranchSelectionActions } from './useBranchSelectionActions';
import { useBranchEnabling } from './useBranchEnabling';

export function useBranchSelection(isOpen: Ref<boolean>) {
  const branchesStore = useBranchesStore();
  const { t } = useI18n();
  const toast = useToast();

  const state = useBranchSelectionState(isOpen);
  const actions = useBranchSelectionActions(
    state.selectedBranchIds,
    state.disabledBranches,
    state.saving
  );
  const enabling = useBranchEnabling(
    state.selectedBranchIds,
    branchesStore,
    toast,
    t
  );

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