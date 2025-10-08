/**
 * @file useDisableAll.ts
 * @summary Module: src/features/branches/composables/useDisableAll.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { useI18n } from "vue-i18n";

// Composables
import { useAsyncAction } from "@/composables/useAsyncAction";
import { useToast } from "@/composables/useToast";

// Stores
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { useUIStore } from "@/stores/ui.store";
export function useDisableAll() {
    const { t } = useI18n();
    const branchesStore = useBranchesStore();
    const uiStore = useUIStore();
    const toast = useToast();
    const { busy, run } = useAsyncAction();
    async function disableAll(): Promise<void> {
        const confirmed = await uiStore.confirm({
            title: t("reservations.confirm.disableAll.title"),
            message: t("reservations.confirm.disableAll.message"),
            confirmText: t("reservations.confirm.disableAll.confirm"),
            cancelText: t("reservations.confirm.disableAll.cancel"),
            variant: "danger",
        });
        if (!confirmed)
            return;
        await run(async () => {
            await branchesStore.disableAll();
            toast.success(t("reservations.toast.disableAllSuccess"));
        }).catch(() => {
            toast.error(t("reservations.toast.disableAllError"));
        });
    }
    return {
        busy,
        disableAll,
    };
}
