/**
 * @file branches.store.ts
 * @summary Module: src/features/branches/stores/branches.store.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { ref, computed, type Ref, type ComputedRef } from "vue";
import { defineStore } from "pinia";

// Type imports
import type { IBranch, IUpdateBranchSettingsPayload } from "@/types/foodics";
import type { IApiError } from "@/types/api";

// Services
import { BranchesService } from "@/services/branches.service";

// Utils
import { countReservableTables, findBranchById } from "@/features/branches/utils/branch.helpers";

// Constants
import {
    ERROR_MSG_FETCH_BRANCHES_FAILED,
    ERROR_MSG_ENABLE_BRANCHES_FAILED,
    ERROR_MSG_DISABLE_ALL_FAILED,
    ERROR_MSG_UPDATE_SETTINGS_FAILED,
    STORE_NAME_BRANCHES,
} from "@/constants";
function useBranchesState() {
    const branches = ref<IBranch[]>([]);
    const selectedBranchId = ref<string | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const enabledBranches = computed(() => branches.value.filter((b) => b.accepts_reservations));
    const disabledBranches = computed(() => branches.value.filter((b) => !b.accepts_reservations));
    const branchById = computed(() => (id: string) => findBranchById(branches.value, id));
    const reservableTablesCount = computed(() => (branch: IBranch) => countReservableTables(branch));
    return { branches, selectedBranchId, loading, error, enabledBranches, disabledBranches, branchById, reservableTablesCount };
}
function useFetchBranches(branches: Ref<IBranch[]>, loading: Ref<boolean>, error: Ref<string | null>) {
    async function fetchBranches(includeSections = false): Promise<void> {
        loading.value = true;
        error.value = null;
        try {
            branches.value = await BranchesService.getBranches(includeSections);
        }
        catch (err) {
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
        branches.value = branches.value.map((b) => ids.includes(b.id) ? { ...b, accepts_reservations: true } : b);
        const results = await Promise.allSettled(ids.map(async (id) => {
            await BranchesService.enableBranch(id);
            return id;
        }));
        const enabled = results
            .filter((r) => r.status === "fulfilled")
            .map((r) => (r as PromiseFulfilledResult<string>).value);
        const failed = results
            .map((result, index) => ({ result, id: ids[index] }))
            .filter(({ result }) => result.status === "rejected")
            .map(({ id }) => id)
            .filter((id): id is string => id !== undefined);
        if (failed.length > 0) {
            branches.value = snapshot.map((b) => enabled.includes(b.id) ? { ...b, accepts_reservations: true } : b);
            if (enabled.length === 0) {
                const firstError = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
                const apiError = firstError?.reason as IApiError;
                error.value = apiError?.message ?? ERROR_MSG_ENABLE_BRANCHES_FAILED;
                throw apiError;
            }
            return { ok: false, enabled, failed };
        }
        return { ok: true, enabled, failed: [] };
    }
    return { enableBranches };
}
function useDisableAllAction(branches: Ref<IBranch[]>, enabledBranches: ComputedRef<IBranch[]>, error: Ref<string | null>) {
    async function disableAll(): Promise<void> {
        const snapshot = branches.value.map((b) => ({ ...b }));
        const enabledIds = enabledBranches.value.map((b) => b.id);
        branches.value = branches.value.map((b) => ({ ...b, accepts_reservations: false }));
        try {
            await Promise.all(enabledIds.map((id) => BranchesService.disableBranch(id)));
        }
        catch (err) {
            branches.value = snapshot;
            const apiError = err as IApiError;
            error.value = apiError.message ?? ERROR_MSG_DISABLE_ALL_FAILED;
            throw err;
        }
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
