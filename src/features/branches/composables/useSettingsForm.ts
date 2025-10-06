/**
 * Settings form state management
 */

import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsState } from './useSettingsState';
import { useSettingsValidationLogic } from './useSettingsValidationLogic';
import { useSlotsManagement } from './useSlotsManagement';
import { useSettingsActions } from './useSettingsActions';

const weekdays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export function useSettingsForm(branchId: Readonly<{ branchId: string | null }>, onClose: () => void) {
  const { t } = useI18n();

  const state = useSettingsState(branchId);
  const validation = useSettingsValidationLogic(state.duration, state.weekSlots, t);
  const slots = useSlotsManagement(state.weekSlots);
  const actions = useSettingsActions(
    state,
    validation,
    onClose
  );

  watch(state.isOpen, (open) => {
    if (open && state.branch.value) {
      state.duration.value = state.branch.value.reservation_duration;
      state.weekSlots.value = { ...state.branch.value.reservation_times };
      validation.clearAllErrors();
    }
  });

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