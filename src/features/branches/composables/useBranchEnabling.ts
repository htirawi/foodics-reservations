import { type Ref } from "vue";

import { useAsyncAction } from "@/composables/useAsyncAction";
import type { IEnableBranchesResult } from "@/types/async";

function notifyEnableResult(
    result: { enabled: string[]; failed: string[] },
    toast: { success: (msg: string) => void; error: (msg: string) => void },
    t: (key: string, params?: Record<string, unknown>) => string
): void {
    const { enabled, failed } = result;

    if (failed.length === 0) {
        toast.success(t("reservations.toast.enableAllSuccess", { count: enabled.length }));
    } else if (enabled.length > 0) {
        toast.success(
            t("reservations.toast.enablePartialSuccess", {
                enabledCount: enabled.length,
                failedCount: failed.length,
            })
        );
    } else {
        toast.error(t("reservations.toast.enableError"));
    }
}

function useBranchEnablingLogic(selectedBranchIds: Ref<string[]>, branchesStore: {
    enableBranches: (ids: string[]) => Promise<{
        ok: boolean;
        enabled: string[];
        failed: string[];
    }>;
}) {
    async function enableBranches(): Promise<{
        enabled: string[];
        failed: string[];
    }> {
        const result = await branchesStore.enableBranches(selectedBranchIds.value);
        return { enabled: result.enabled, failed: result.failed };
    }
    return { enableBranches };
}
export function useBranchEnabling(selectedBranchIds: Ref<string[]>, branchesStore: {
    enableBranches: (ids: string[]) => Promise<{
        ok: boolean;
        enabled: string[];
        failed: string[];
    }>;
}, toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
}, t: (key: string, params?: Record<string, unknown>) => string) {
    const { busy, run } = useAsyncAction();
    const { enableBranches } = useBranchEnablingLogic(selectedBranchIds, branchesStore);
    async function enableSelectedBranches(): Promise<IEnableBranchesResult> {
        if (selectedBranchIds.value.length === 0) {
            return { ok: true, enabled: [], failed: [] };
        }

        return run(async () => {
            const { enabled, failed } = await enableBranches();

            const result: IEnableBranchesResult = {
                ok: failed.length === 0,
                enabled,
                failed,
            };

            notifyEnableResult(result, toast, t);

            selectedBranchIds.value = failed;

            return result;
        }).catch(() => {
            toast.error(t("reservations.toast.enableError"));
            return { ok: false, enabled: [], failed: selectedBranchIds.value };
        });
    }
    return {
        enableSelectedBranches,
        saving: busy,
    };
}
