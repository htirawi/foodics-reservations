import { watch, type Ref } from "vue";

import { useI18n } from "vue-i18n";

import { WEEKDAYS } from "@/constants/reservations";
import type { ReservationTimes, Weekday } from "@/types/foodics";

import { useSettingsActions } from "@features/branches/composables/useSettingsActions";
import { useSettingsState } from "@features/branches/composables/useSettingsState";
import { useSettingsValidationLogic } from "@features/branches/composables/useSettingsValidationLogic";
import { useSlotsManagement } from "@features/branches/composables/useSlotsManagement";

/**
 * Setup reactive validation watchers.
 */
function setupValidationWatchers(
    duration: Ref<number>,
    weekSlots: Ref<ReservationTimes>,
    checkDuration: () => boolean,
    checkSlots: (day: Weekday) => boolean
): void {
    watch(duration, checkDuration);
    watch(weekSlots, () => {
        WEEKDAYS.forEach((day) => checkSlots(day));
    }, { deep: true });
}

const weekdays = WEEKDAYS;
export function useSettingsForm(branchId: Readonly<{ branchId: string | null }>, onClose: () => void) {
    const { t } = useI18n();
    const state = useSettingsState(branchId);
    const validation = useSettingsValidationLogic(state.duration, state.weekSlots, t);
    const slots = useSlotsManagement(state.weekSlots);
    const actions = useSettingsActions(
        { branch: state.branch, duration: state.duration, weekSlots: state.weekSlots },
        { checkDuration: validation.checkDuration, checkSlots: validation.checkSlots },
        onClose
    );
    watch(state.isOpen, (open) => {
        if (open && state.branch.value) {
            state.duration.value = state.branch.value.reservation_duration;
            state.weekSlots.value = state.branch.value.reservation_times ? { ...state.branch.value.reservation_times } : {
                saturday: [],
                sunday: [],
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
            };
            validation.clearAllErrors();
        }
    }, { immediate: true });

    setupValidationWatchers(
        state.duration,
        state.weekSlots,
        validation.checkDuration,
        validation.checkSlots
    );
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
        isSaving: actions.isSaving,
        isDisabling: actions.isDisabling,
    };
}
