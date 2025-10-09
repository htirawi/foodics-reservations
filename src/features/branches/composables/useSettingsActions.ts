import { type Ref, ref } from "vue";

import { useI18n } from "vue-i18n";

import { WEEKDAYS } from "@/constants/reservations";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { useUIStore } from "@/stores/ui.store";
import type { IBranch, Weekday, ReservationTimes } from "@/types/foodics";

/**
 * Validate all settings before save.
 */
function validateAllSettings(
    checkDuration: () => boolean,
    checkSlots: (day: Weekday) => boolean
): boolean {
    const isDurationValid = checkDuration();
    const areSlotsValid = WEEKDAYS.every((day: Weekday) => checkSlots(day));
    return isDurationValid && areSlotsValid;
}

export function useSettingsActions(
    { branch, duration, weekSlots }: {
        branch: Ref<IBranch | null>;
        duration: Ref<number>;
        weekSlots: Ref<ReservationTimes>;
    },
    { checkDuration, checkSlots }: {
        checkDuration: () => boolean;
        checkSlots: (day: Weekday) => boolean;
    },
    onClose: () => void
) {
    const branchesStore = useBranchesStore();
    const uiStore = useUIStore();
    const { t } = useI18n();
    const isSaving = ref(false);
    const isDisabling = ref(false);

    async function handleSave(): Promise<void> {
        if (!branch.value || isSaving.value || !validateAllSettings(checkDuration, checkSlots)) return;

        isSaving.value = true;
        try {
            await branchesStore.updateSettings(branch.value.id, {
                reservation_duration: duration.value,
                reservation_times: weekSlots.value,
            });
            uiStore.notify(t("settings.toast.saveSuccess"), "success");
            onClose();
        } catch {
            uiStore.notify(t("settings.toast.saveError"), "error");
        } finally {
            isSaving.value = false;
        }
    }
    
    async function handleDisable(): Promise<void> {
        if (!branch.value || isDisabling.value) return;

        isDisabling.value = true;
        try {
            await branchesStore.enableBranches([]);
            uiStore.notify(t("settings.toast.disableSuccess"), "success");
            onClose();
        } catch {
            uiStore.notify(t("settings.toast.disableError"), "error");
        } finally {
            isDisabling.value = false;
        }
    }
    return { handleSave, handleDisable, isSaving, isDisabling };
}
