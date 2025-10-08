import { ref, type Ref } from "vue";
import type { Composer } from "vue-i18n";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { useToast } from "@/composables/useToast";
export function useAddBranchesEnabling(selectedIds: Ref<string[]>, clear: () => void, toast: ReturnType<typeof useToast>, t: Composer["t"]) {
    const branchesStore = useBranchesStore();
    const saving = ref(false);
    async function handleEnable(onSuccess: () => void): Promise<void> {
        if (selectedIds.value.length === 0)
            return;
        saving.value = true;
        try {
            const result = await branchesStore.enableBranches(selectedIds.value);
            if (result.ok) {
                toast.success(t("reservations.toast.enableAllSuccess", { count: result.enabled.length }));
                clear();
                onSuccess();
            }
            else {
                toast.warning(t("reservations.toast.enablePartialSuccess", {
                    enabledCount: result.enabled.length,
                    failedCount: result.failed.length,
                }));
                selectedIds.value = result.failed;
            }
        }
        catch {
            toast.error(t("reservations.toast.enableError"));
        }
        finally {
            saving.value = false;
        }
    }
    return {
        saving,
        handleEnable,
    };
}
