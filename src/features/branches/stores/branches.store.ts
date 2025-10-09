import { ref, computed, type Ref, type ComputedRef } from "vue";

import { defineStore } from "pinia";

import {
    ERROR_MSG_FETCH_BRANCHES_FAILED,
    ERROR_MSG_ENABLE_BRANCHES_FAILED,
    ERROR_MSG_DISABLE_ALL_FAILED,
    ERROR_MSG_UPDATE_SETTINGS_FAILED,
    STORE_NAME_BRANCHES,
} from "@/constants";
import {
    processBatchResults,
    applyOptimisticUpdate,
    rollbackWithPartialSuccess,
    handleCompleteFailure,
} from "@/features/branches/utils/batch-operations";
import { countReservableTables, findBranchById } from "@/features/branches/utils/branch.helpers";
import { BranchesService } from "@/services/branches.service";
import type { IApiError } from "@/types/api";
import type { IBranch, IUpdateBranchSettingsPayload } from "@/types/foodics";
import { isEnabledBranch, isDisabledBranch } from "@/utils/branches";

function useBranchesState() {
    const branches = ref<IBranch[]>([]);
    const selectedBranchId = ref<string | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const enabledBranches = computed(() => (branches.value ?? []).filter(isEnabledBranch));
    const disabledBranches = computed(() => (branches.value ?? []).filter(isDisabledBranch));
    const branchById = computed(() => (id: string) => findBranchById(branches.value ?? [], id));
    const reservableTablesCount = computed(() => (branch: IBranch) => countReservableTables(branch));
    return { branches, selectedBranchId, loading, error, enabledBranches, disabledBranches, branchById, reservableTablesCount };
}
function useFetchBranches(branches: Ref<IBranch[]>, loading: Ref<boolean>, error: Ref<string | null>) {
    async function fetchBranches(includeSections = false): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            const result = await BranchesService.getAllBranches(includeSections);
            branches.value = result ?? [];
        }
        catch (err) {
            branches.value = [];
            const apiError = err as IApiError;
            error.value = apiError.message ?? ERROR_MSG_FETCH_BRANCHES_FAILED;
            throw err;
        }
        finally {
            loading.value = false;
        }
    }
    return { fetchBranches };
}
function useEnableAction(branches: Ref<IBranch[]>, error: Ref<string | null>) {
    async function enableBranches(ids: string[]): Promise<{
        ok: boolean;
        enabled: string[];
        failed: string[];
    }> {
        const snapshot = branches.value.map((b) => ({ ...b }));
        branches.value = applyOptimisticUpdate(branches.value, ids, true);

        const results = await Promise.allSettled(
            ids.map(async (id) => {
                await BranchesService.enableBranch(id);
                return id;
            })
        );

        const { succeeded: enabled, failed } = processBatchResults(results, ids);

        if (failed.length > 0) {
            branches.value = rollbackWithPartialSuccess(snapshot, enabled, true);

            if (enabled.length === 0) {
                handleCompleteFailure(results, error, ERROR_MSG_ENABLE_BRANCHES_FAILED);
            }

            return { ok: false, enabled, failed };
        }

        return { ok: true, enabled, failed: [] };
    }
    return { enableBranches };
}
function useDisableAllAction(branches: Ref<IBranch[]>, enabledBranches: ComputedRef<IBranch[]>, error: Ref<string | null>) {
    async function disableAll(): Promise<{ successCount: number; failedCount: number }> {
        const snapshot = branches.value.map((b) => ({ ...b }));
        const enabledIds = enabledBranches.value.map((b) => b.id);
        branches.value = branches.value.map((b) => ({ ...b, accepts_reservations: false }));

        const results = await Promise.allSettled(
            enabledIds.map(async (id) => {
                await BranchesService.disableBranch(id);
                return id;
            })
        );

        const { succeeded, failed } = processBatchResults(results, enabledIds);

        if (failed.length > 0) {
            branches.value = rollbackWithPartialSuccess(snapshot, succeeded, false);

            if (succeeded.length === 0) {
                handleCompleteFailure(results, error, ERROR_MSG_DISABLE_ALL_FAILED);
            }
        }

        return { successCount: succeeded.length, failedCount: failed.length };
    }
    return { disableAll };
}
function useUpdateSettings(branches: Ref<IBranch[]>, error: Ref<string | null>) {
    async function updateSettings(id: string, payload: IUpdateBranchSettingsPayload): Promise<void> {
        const snapshot = branches.value.map((b) => ({ ...b }));
        const targetIndex = branches.value.findIndex((b) => b.id === id);
        if (targetIndex === -1)
            throw new Error(`Branch with id ${id} not found`);
        const currentBranch = branches.value[targetIndex];
        if (!currentBranch)
            throw new Error(`Branch with id ${id} not found`);
        branches.value[targetIndex] = {
            ...currentBranch,
            reservation_duration: payload.reservation_duration,
            reservation_times: payload.reservation_times,
        };
        try {
            const updated = await BranchesService.updateBranchSettings(id, payload);
            branches.value[targetIndex] = updated;
        }
        catch (err) {
            branches.value = snapshot;
            const apiError = err as IApiError;
            error.value = apiError.message ?? ERROR_MSG_UPDATE_SETTINGS_FAILED;
            throw err;
        }
    }
    return { updateSettings };
}
export const useBranchesStore = defineStore(STORE_NAME_BRANCHES, () => {
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
