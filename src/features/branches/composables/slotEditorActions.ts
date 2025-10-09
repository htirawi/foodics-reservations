import { WEEKDAYS, DEFAULT_SLOT_START, DEFAULT_SLOT_END } from "@/constants/reservations";
import type { ReservationTimes, Weekday, SlotTuple } from "@/types/foodics";
import type { ISlotUpdateParams } from "@/types/slots";

export const WEEKDAY_ORDER = WEEKDAYS;

/**
 * Add a new slot to a specific day.
 * @param modelValue - Current reservation times
 * @param day - Target day
 * @returns Updated reservation times
 */
export function addSlotToDay(modelValue: ReservationTimes, day: Weekday): ReservationTimes {
  const newSlots = [...(modelValue[day] ?? [])];
  newSlots.push([DEFAULT_SLOT_START, DEFAULT_SLOT_END]);
  return { ...modelValue, [day]: newSlots };
}

/**
 * Remove a slot from a specific day.
 * @param modelValue - Current reservation times
 * @param day - Target day
 * @param index - Slot index to remove
 * @returns Updated reservation times
 */
export function removeSlotFromDay(
  modelValue: ReservationTimes,
  day: Weekday,
  index: number
): ReservationTimes {
  const slots = modelValue[day] ?? [];
  const newSlots = slots.filter((_, i) => i !== index);
  return { ...modelValue, [day]: newSlots };
}

/**
 * Update a single field in a slot.
 * @param modelValue - Current reservation times
 * @param params - Update parameters
 * @returns Updated reservation times
 */
export function updateSlotField(
  modelValue: ReservationTimes,
  params: ISlotUpdateParams
): ReservationTimes {
  const { day, index, field, value } = params;
  const slots = modelValue[day] ?? [];
  const newSlots = [...slots];
  const slot = newSlots[index];
  if (!slot) return modelValue;

  const updatedSlot: SlotTuple =
    field === "from" ? [value, slot[1]] : [slot[0], value];
  newSlots[index] = updatedSlot;
  return { ...modelValue, [day]: newSlots };
}

/**
 * Apply slots from source day to all days.
 * @param modelValue - Current reservation times
 * @param sourceDay - Day to copy from
 * @returns Updated reservation times with all days matching source
 */
export function applyToAllDays(modelValue: ReservationTimes, sourceDay: Weekday): ReservationTimes {
  const template = modelValue[sourceDay] ?? [];
  const updated: ReservationTimes = { ...modelValue };
  WEEKDAY_ORDER.forEach((day) => {
    updated[day] = [...template];
  });
  return updated;
}
