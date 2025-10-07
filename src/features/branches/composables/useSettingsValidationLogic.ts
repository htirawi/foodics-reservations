/**
 * @file useSettingsValidationLogic.ts
 * @summary Module: src/features/branches/composables/useSettingsValidationLogic.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
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
