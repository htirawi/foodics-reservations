/**
 * Settings form state management
 */

import { ref, computed, watch } from 'vue';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import { useSettingsValidation } from './useSettingsValidation';
import { useI18n } from 'vue-i18n';
import type { Branch, SlotTuple, Weekday, ReservationTimes, Table } from '@/types/foodics';

const weekdays: Weekday[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/* eslint-disable max-lines-per-function, max-nested-callbacks */
// Justification: Form state composable requires comprehensive state management logic
// Breaking into smaller functions would scatter related state and reduce cohesion
export function useSettingsForm(branchId: Readonly<{ branchId: string | null }>, onClose: () => void) {
  const { t } = useI18n();
  const branchesStore = useBranchesStore();
  const { errors, validateDuration, validateDaySlots, clearAllErrors } = useSettingsValidation();

  const duration = ref<number>(30);
  const weekSlots = ref<ReservationTimes>({
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  });

  const isOpen = computed(() => branchId.branchId !== null);
  const branch = computed<Branch | null>(() =>
    branchId.branchId ? branchesStore.branchById(branchId.branchId) : null
  );

  const availableTables = computed<Table[]>(() => {
    if (!branch.value?.sections) return [];
    return branch.value.sections.flatMap((s) => s.tables?.filter((t) => t.accepts_reservations) ?? []);
  });

  watch(isOpen, (open) => {
    if (open && branch.value) {
      duration.value = branch.value.reservation_duration;
      weekSlots.value = { ...branch.value.reservation_times };
      clearAllErrors();
    }
  });

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

  function addSlot(day: Weekday): void {
    weekSlots.value[day].push(['09:00', '17:00']);
  }

  function removeSlot(day: Weekday, index: number): void {
    weekSlots.value[day].splice(index, 1);
  }

  function updateSlot(day: Weekday, index: number, field: 'from' | 'to', value: string): void {
    const slot = weekSlots.value[day][index];
    if (!slot) return;
    slot[field === 'from' ? 0 : 1] = value;
    checkSlots(day);
  }

  function applyToAllDays(day: Weekday): void {
    const slotsToApply = weekSlots.value[day].map(([f, t]) => [f, t] as SlotTuple);
    weekdays.forEach((d) => {
      weekSlots.value[d] = [...slotsToApply];
    });
  }

  async function handleSave(): Promise<void> {
    if (!branch.value) return;
    const isDurationValid = checkDuration();
    const areSlotsValid = weekdays.every((day) => checkSlots(day));
    if (!isDurationValid || !areSlotsValid) return;
    try {
      await branchesStore.updateSettings(branch.value.id, {
        reservation_duration: duration.value,
        reservation_times: weekSlots.value,
      });
      onClose();
    } catch {
      // Error handled by store
    }
  }

  async function handleDisable(): Promise<void> {
    if (!branch.value) return;
    try {
      await branchesStore.enableBranches([]);
      onClose();
    } catch {
      // Error handled by store
    }
  }

  return {
    isOpen,
    branch,
    duration,
    weekSlots,
    weekdays,
    availableTables,
    errors,
    checkDuration,
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
    handleSave,
    handleDisable,
  };
}
