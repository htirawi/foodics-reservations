/**
 * @file useBranchEnabling.ts
 * @summary Module: src/features/branches/composables/useBranchEnabling.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { type Ref } from "vue";
import { useAsyncAction } from "@/composables/useAsyncAction";
import type { EnableBranchesResult } from "@/types/async";
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
    async function enableSelectedBranches(): Promise<EnableBranchesResult> {
        if (selectedBranchIds.value.length === 0) {
            return { ok: true, enabled: [], failed: [] };
        }
        return run(async () => {
            const { enabled, failed } = await enableBranches();
            const result: EnableBranchesResult = {
                ok: failed.length === 0,
                enabled,
                failed
            };
            if (result.ok) {
                toast.success(t("reservations.toast.enableAllSuccess", { count: enabled.length }));
            }
            else if (enabled.length > 0) {
                toast.success(t("reservations.toast.enablePartialSuccess", {
                    enabledCount: enabled.length,
                    failedCount: failed.length
                }));
            }
            else {
                toast.error(t("reservations.toast.enableError"));
            }
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
