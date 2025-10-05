/**
 * Branches Store
 * Manages branch list, selection, and reservation settings with optimistic updates
 */

import { defineStore } from 'pinia';
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { BranchesService } from '@/services/branches.service';
import type { Branch, UpdateBranchSettingsPayload } from '@/types/foodics';
import type { ApiError } from '@/types/api';

function countReservableTables(branch: Branch): number {
  if (!branch.sections) return 0;
  return branch.sections.reduce((total, section) => {
    const sectionTables = section.tables ?? [];
    return total + sectionTables.filter((t) => t.accepts_reservations).length;
  }, 0);
}

function findBranchById(branches: Branch[], id: string): Branch | null {
  return branches.find((b) => b.id === id) ?? null;
}

function useBranchesState() {
  const branches = ref<Branch[]>([]);
  const selectedBranchId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const enabledBranches = computed(() =>
    branches.value.filter((b) => b.accepts_reservations)
  );

  const disabledBranches = computed(() =>
    branches.value.filter((b) => !b.accepts_reservations)
  );

  const branchById = computed(() => (id: string) => findBranchById(branches.value, id));
  const reservableTablesCount = computed(() => (branch: Branch) =>
    countReservableTables(branch)
  );

  return {
    branches,
    selectedBranchId,
    loading,
    error,
    enabledBranches,
    disabledBranches,
    branchById,
    reservableTablesCount,
  };
}

function useFetchBranches(
  branches: Ref<Branch[]>,
  loading: Ref<boolean>,
  error: Ref<string | null>
) {
  async function fetchBranches(includeSections = false): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      branches.value = await BranchesService.getBranches(includeSections);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message ?? 'Failed to fetch branches';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  return { fetchBranches };
}

function useEnableAction(branches: Ref<Branch[]>, error: Ref<string | null>) {
  async function enableBranches(ids: string[]): Promise<void> {
    const snapshot = branches.value.map((b) => ({ ...b }));
    branches.value = branches.value.map((b) =>
      ids.includes(b.id) ? { ...b, accepts_reservations: true } : b
    );
    try {
      await Promise.all(ids.map((id) => BranchesService.enableBranch(id)));
    } catch (err) {
      branches.value = snapshot;
      const apiError = err as ApiError;
      error.value = apiError.message ?? 'Failed to enable branches';
      throw err;
    }
  }
  return { enableBranches };
}

function useDisableAllAction(
  branches: Ref<Branch[]>,
  enabledBranches: ComputedRef<Branch[]>,
  error: Ref<string | null>
) {
  async function disableAll(): Promise<void> {
    const snapshot = branches.value.map((b) => ({ ...b }));
    const enabledIds = enabledBranches.value.map((b) => b.id);
    branches.value = branches.value.map((b) => ({ ...b, accepts_reservations: false }));
    try {
      await Promise.all(enabledIds.map((id) => BranchesService.disableBranch(id)));
    } catch (err) {
      branches.value = snapshot;
      const apiError = err as ApiError;
      error.value = apiError.message ?? 'Failed to disable all branches';
      throw err;
    }
  }
  return { disableAll };
}

function useUpdateSettings(branches: Ref<Branch[]>, error: Ref<string | null>) {
  async function updateSettings(id: string, payload: UpdateBranchSettingsPayload): Promise<void> {
    const snapshot = branches.value.map((b) => ({ ...b }));
    const targetIndex = branches.value.findIndex((b) => b.id === id);
    if (targetIndex === -1) throw new Error(`Branch with id ${id} not found`);
    const currentBranch = branches.value[targetIndex];
    if (!currentBranch) throw new Error(`Branch with id ${id} not found`);

    branches.value[targetIndex] = {
      ...currentBranch,
      reservation_duration: payload.reservation_duration,
      reservation_times: payload.reservation_times,
    };

    try {
      const updated = await BranchesService.updateBranchSettings(id, payload);
      branches.value[targetIndex] = updated;
    } catch (err) {
      branches.value = snapshot;
      const apiError = err as ApiError;
      error.value = apiError.message ?? 'Failed to update branch settings';
      throw err;
    }
  }
  return { updateSettings };
}

export const useBranchesStore = defineStore('branches', () => {
  const state = useBranchesState();
  const { fetchBranches } = useFetchBranches(state.branches, state.loading, state.error);
  const { enableBranches } = useEnableAction(state.branches, state.error);
  const { disableAll } = useDisableAllAction(state.branches, state.enabledBranches, state.error);
  const { updateSettings } = useUpdateSettings(state.branches, state.error);

  function selectBranch(id: string): void {
    state.selectedBranchId.value = id;
  }

  function clearSelection(): void {
    state.selectedBranchId.value = null;
  }

  return {
    ...state,
    fetchBranches,
    enableBranches,
    disableAll,
    updateSettings,
    selectBranch,
    clearSelection,
  };
});