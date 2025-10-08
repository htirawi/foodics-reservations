/**
 * @file useSettingsValidation.ts
 * @summary Module: src/features/branches/composables/useSettingsValidation.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { ref } from "vue";
import type { Weekday, SlotTuple } from "@/types/foodics";
import type { IValidationErrors } from "@/types/validation";
import { isValidRange, isOverlapping } from "@/utils/slots";

function validateIndividualSlots(slots: SlotTuple[], { invalid }: { invalid: string }): string | null {
    for (const slot of slots) {
        const validation = isValidRange(slot);
        if (!validation.ok) {
            return invalid;
        }
    }
    return null;
}

function validateSlotOverlaps(slots: SlotTuple[], { overlap }: { overlap: string; invalid: string }): string | null {
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot) continue;
        
        // Check this slot against all other slots for overlaps
        const hasOverlap = checkSlotOverlaps(slot, slots, i + 1);
        if (hasOverlap) {
            return overlap;
        }
    }
    return null;
}

function checkSlotOverlaps(slot: SlotTuple, slots: SlotTuple[], startIndex: number): boolean {
    for (let j = startIndex; j < slots.length; j++) {
        const otherSlot = slots[j];
        if (!otherSlot) continue;
        
        if (isOverlapping(slot, otherSlot)) {
            return true;
        }
    }
    return false;
}

function validateSlots(slots: SlotTuple[], { invalid, overlap }: {
    missing: string;
    invalid: string;
    overlap: string;
}): string | null {
    if (!slots || slots.length === 0) return null;
    
    const individualError = validateIndividualSlots(slots, { invalid });
    if (individualError) return individualError;
    
    return validateSlotOverlaps(slots, { overlap, invalid });
}

export function useSettingsValidation() {
  const errors = ref<IValidationErrors>({});
    
    function validateDuration(duration: number, errorMsg: string): boolean {
        if (!duration || duration < 1) {
            errors.value.duration = errorMsg;
            return false;
        }
        errors.value.duration = undefined;
        return true;
    }
    
    function validateDaySlots(slots: SlotTuple[], day: Weekday, { missing, invalid, overlap }: {
        missing: string;
        invalid: string;
        overlap: string;
    }): boolean {
        if (!slots || slots.length === 0) {
            clearDayError(day);
            return true;
        }
        const validationResult = validateSlots(slots, { missing, invalid, overlap });
        if (validationResult) {
            setDayError(day, validationResult);
            return false;
        }
        clearDayError(day);
        return true;
    }
    
    function setDayError(day: Weekday, message: string): void {
        errors.value.slots = { ...errors.value.slots, [day]: message };
    }
    
    function clearDayError(day: Weekday): void {
        if (!errors.value.slots) return;
        const newSlots = { ...errors.value.slots };
        delete newSlots[day];
        errors.value.slots = Object.keys(newSlots).length > 0 ? newSlots : undefined;
    }
    
    function clearAllErrors(): void {
        errors.value = {};
    }
    
    return {
        errors,
        validateDuration,
        validateDaySlots,
        clearAllErrors,
    };
}
