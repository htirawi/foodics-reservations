/**
 * Settings actions (save, disable)
 */

import { type Ref } from 'vue';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import type { Branch, Weekday, ReservationTimes } from '@/types/foodics';

const weekdays: Weekday[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export function useSettingsActions(
  state: { branch: Ref<Branch | null>; duration: Ref<number>; weekSlots: Ref<ReservationTimes> },
  validation: { checkDuration: () => boolean; checkSlots: (day: Weekday) => boolean },
  onClose: () => void
) {
  const branchesStore = useBranchesStore();

  async function handleSave(): Promise<void> {
    if (!state.branch.value) return;
    const isDurationValid = validation.checkDuration();
    const areSlotsValid = weekdays.every((day) => validation.checkSlots(day));
    if (!isDurationValid || !areSlotsValid) return;
    await branchesStore.updateSettings(state.branch.value.id, {
      reservation_duration: state.duration.value,
      reservation_times: state.weekSlots.value,
    });
    onClose();
  }

  async function handleDisable(): Promise<void> {
    if (!state.branch.value) return;
    await branchesStore.enableBranches([]);
    onClose();
  }

  return {
    handleSave,
    handleDisable,
  };
}
