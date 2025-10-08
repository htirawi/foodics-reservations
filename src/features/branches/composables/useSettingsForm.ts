/**
 * @file useSettingsForm.ts
 * @summary Module: src/features/branches/composables/useSettingsForm.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { watch } from "vue";
import { useI18n } from "vue-i18n";

// Composables
import { useSettingsActions } from "./useSettingsActions";
import { useSettingsState } from "./useSettingsState";
import { useSettingsValidationLogic } from "./useSettingsValidationLogic";
import { useSlotsManagement } from "./useSlotsManagement";

// Constants
import { WEEKDAYS } from "@/constants/reservations";

const weekdays = WEEKDAYS;
export function useSettingsForm(branchId: Readonly<{
    branchId: string | null;
}>, onClose: () => void) {
    const { t } = useI18n();
    const state = useSettingsState(branchId);
    const validation = useSettingsValidationLogic(state.duration, state.weekSlots, t);
    const slots = useSlotsManagement(state.weekSlots);
    const actions = useSettingsActions(state, validation, onClose);
    watch(state.isOpen, (open) => {
        if (open && state.branch.value) {
            state.duration.value = state.branch.value.reservation_duration;
            state.weekSlots.value = { ...state.branch.value.reservation_times };
            validation.clearAllErrors();
        }
    }, { immediate: true });
    return {
        isOpen: state.isOpen,
        branch: state.branch,
        duration: state.duration,
        weekSlots: state.weekSlots,
        weekdays,
        availableTables: state.availableTables,
        errors: validation.errors,
        checkDuration: validation.checkDuration,
        addSlot: slots.addSlot,
        removeSlot: slots.removeSlot,
        updateSlot: slots.updateSlot,
        applyToAllDays: slots.applyToAllDays,
        handleSave: actions.handleSave,
        handleDisable: actions.handleDisable,
    };
}
