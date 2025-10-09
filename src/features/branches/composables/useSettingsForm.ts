import { watch, type Ref, type ComputedRef } from "vue";

import { useI18n } from "vue-i18n";

import { useUnsavedChanges } from "@/composables/useUnsavedChanges";
import { WEEKDAYS } from "@/constants/reservations";
import type { IBranch, ITable, ReservationTimes, Weekday } from "@/types/foodics";

import { useSettingsActions } from "@features/branches/composables/useSettingsActions";
import { useSettingsState } from "@features/branches/composables/useSettingsState";
import { useSettingsValidationLogic } from "@features/branches/composables/useSettingsValidationLogic";
import { useSlotsManagement } from "@features/branches/composables/useSlotsManagement";

function setupValidationWatchers(
    duration: Ref<number>,
    weekSlots: Ref<ReservationTimes>,
    checkDuration: () => boolean,
    checkSlots: (day: Weekday) => boolean
): void {
    watch(duration, checkDuration);
    watch(weekSlots, () => WEEKDAYS.forEach((day) => checkSlots(day)), { deep: true });
}

function initializeFormData(branch: { reservation_duration: number; reservation_times?: ReservationTimes }): {
    duration: number;
    weekSlots: ReservationTimes;
} {
    return {
        duration: branch.reservation_duration,
        weekSlots: branch.reservation_times || {
            saturday: [], sunday: [], monday: [], tuesday: [],
            wednesday: [], thursday: [], friday: [],
        },
    };
}

function createTableDisplayName(branch: ComputedRef<IBranch | null>) {
    return (table: ITable): string => {
        const section = branch.value?.sections?.find(s => s.tables?.some(t => t.id === table.id));
        const sectionName = section?.name ?? "Unknown";
        const tableName = table.name ?? table.id;
        return `${sectionName} - ${tableName}`;
    };
}

function createCloseHandler(confirmClose: () => Promise<boolean>, onClose: () => void) {
    return (): void => {
        confirmClose().then((canClose) => {
            if (canClose) {
                onClose();
            }
        });
    };
}

const weekdays = WEEKDAYS;

export function useSettingsForm(branchId: Readonly<{ branchId: string | null }>, onClose: () => void) {
    const { t } = useI18n();
    const state = useSettingsState(branchId);
    const validation = useSettingsValidationLogic(state.duration, state.weekSlots, t);
    const slots = useSlotsManagement(state.weekSlots);
    const unsavedChanges = useUnsavedChanges(state.duration, state.weekSlots, state.isOpen);

    const actions = useSettingsActions(
        { branch: state.branch, duration: state.duration, weekSlots: state.weekSlots },
        { checkDuration: validation.checkDuration, checkSlots: validation.checkSlots },
        onClose
    );

    watch(state.isOpen, (open) => {
        if (open && state.branch.value) {
            const formData = initializeFormData(state.branch.value);
            state.duration.value = formData.duration;
            state.weekSlots.value = formData.weekSlots;
            validation.clearAllErrors();
        }
    }, { immediate: true });

    setupValidationWatchers(state.duration, state.weekSlots, validation.checkDuration, validation.checkSlots);

    return {
        isOpen: state.isOpen, branch: state.branch, duration: state.duration, weekSlots: state.weekSlots,
        weekdays, availableTables: state.availableTables, errors: validation.errors,
        checkDuration: validation.checkDuration, getTableDisplayName: createTableDisplayName(state.branch),
        addSlot: slots.addSlot, removeSlot: slots.removeSlot, updateSlot: slots.updateSlot,
        applyToAllDays: slots.applyToAllDays, handleSave: actions.handleSave,
        handleDisable: actions.handleDisable, handleClose: createCloseHandler(unsavedChanges.confirmClose, onClose),
        isSaving: actions.isSaving, isDisabling: actions.isDisabling,
    };
}
