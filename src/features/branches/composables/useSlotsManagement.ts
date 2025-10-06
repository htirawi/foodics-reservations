/**
 * Settings slots management
 */

import { type Ref } from 'vue';
import type { Weekday, SlotTuple, ReservationTimes } from '@/types/foodics';

const weekdays: Weekday[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export function useSlotsManagement(weekSlots: Ref<ReservationTimes>) {
  function addSlot(day: Weekday): void {
    weekSlots.value[day].push(['09:00', '17:00']);
  }

  function removeSlot(day: Weekday, index: number): void {
    const slots = weekSlots.value[day];
    if (index >= 0 && index < slots.length) {
      slots.splice(index, 1);
      // Force reactivity update
      weekSlots.value = { ...weekSlots.value };
    }
  }

  function updateSlot(day: Weekday, index: number, field: 'from' | 'to', value: string): void {
    const slot = weekSlots.value[day][index];
    if (!slot) return;
    slot[field === 'from' ? 0 : 1] = value;
  }

  function applyToAllDays(day: Weekday): void {
    const slotsToApply = weekSlots.value[day].map(([f, t]: SlotTuple) => [f, t] as SlotTuple);
    weekdays.forEach((d) => {
      weekSlots.value[d] = [...slotsToApply];
    });
  }

  return {
    addSlot,
    removeSlot,
    updateSlot,
    applyToAllDays,
  };
}
