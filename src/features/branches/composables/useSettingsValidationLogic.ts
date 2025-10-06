/**
 * Settings validation logic
 */

import { type Ref } from 'vue';
import { useSettingsValidation } from './useSettingsValidation';
import type { Weekday, ReservationTimes } from '@/types/foodics';

export function useSettingsValidationLogic(
  duration: Ref<number>,
  weekSlots: Ref<ReservationTimes>,
  t: (key: string) => string
) {
  const { errors, validateDuration, validateDaySlots, clearAllErrors } = useSettingsValidation();

  function checkDuration(): boolean {
    return validateDuration(duration.value, t('settings.validation.durationMin'));
  }

  function checkSlots(day: Weekday): boolean {
    return validateDaySlots(weekSlots.value[day] ?? [], day, {
      missing: t('settings.validation.timeRequired'),
      invalid: t('settings.validation.timeInvalid'),
      overlap: t('settings.validation.timeOverlap'),
    });
  }

  return {
    errors,
    checkDuration,
    checkSlots,
    clearAllErrors,
  };
}
