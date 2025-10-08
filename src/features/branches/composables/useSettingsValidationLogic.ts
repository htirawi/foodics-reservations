import { type Ref } from "vue";
import { useSettingsValidation } from "./useSettingsValidation";
import type { Weekday, ReservationTimes } from "@/types/foodics";
export function useSettingsValidationLogic(duration: Ref<number>, weekSlots: Ref<ReservationTimes>, t: (key: string) => string) {
    const { errors, validateDuration, validateDaySlots, clearAllErrors } = useSettingsValidation();
    function checkDuration(): boolean {
        return validateDuration(duration.value, t("settings.duration.errors.min"));
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
