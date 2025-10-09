import { type Ref } from "vue";

import { MIN_DURATION_MINUTES } from "@/constants/reservations";
import type { Weekday, ReservationTimes } from "@/types/foodics";

import { useSettingsValidation } from "@features/branches/composables/useSettingsValidation";

export function useSettingsValidationLogic(duration: Ref<number>, weekSlots: Ref<ReservationTimes>, t: (key: string) => string) {
    const { errors, validateDaySlots, clearAllErrors } = useSettingsValidation();
    
    function checkDuration(): boolean {
        const val = duration.value;
        if (!Number.isInteger(val) || val < MIN_DURATION_MINUTES) {
            errors.value.duration = t("settings.duration.errors.min");
            return false;
        }
        errors.value.duration = undefined;
        return true;
    }
    function checkSlots(day: Weekday): boolean {
        return validateDaySlots(weekSlots.value[day] ?? [], day, {
            missing: t("settings.slots.errors.required"),
            invalid: t("settings.slots.errors.format"),
            overlap: t("settings.slots.errors.overlap"),
        });
    }
    return {
        errors,
        checkDuration,
        checkSlots,
        clearAllErrors,
    };
}
