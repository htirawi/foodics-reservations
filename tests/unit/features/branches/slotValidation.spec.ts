import { describe, it, expect, vi } from "vitest";

import {
  getDayValidationErrors,
  validateDaySlots,
  emitValidity,
  getDaySlots,
  canAddSlotToDay,
  validateDaySlotsFor,
} from "@/features/branches/composables/slotValidation";
import type { ReservationTimes, SlotTuple } from "@/types/foodics";

describe("slotValidation", () => {
  describe("getDayValidationErrors", () => {
    it("should return empty array for empty slots", () => {
      const errors = getDayValidationErrors([]);
      expect(errors).toEqual([]);
    });

    it("should return empty array for null/undefined slots", () => {
      const errors = getDayValidationErrors(null as unknown as SlotTuple[]);
      expect(errors).toEqual([]);
    });

    it("should return empty array for valid slot", () => {
      const slots: SlotTuple[] = [["09:00", "12:00"]];
      const errors = getDayValidationErrors(slots);
      expect(errors).toEqual([]);
    });

    it("should return error for invalid range (from >= to)", () => {
      const slots: SlotTuple[] = [["12:00", "09:00"]];
      const errors = getDayValidationErrors(slots);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should return error for same from and to time", () => {
      const slots: SlotTuple[] = [["09:00", "09:00"]];
      const errors = getDayValidationErrors(slots);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should return error for overlapping slots", () => {
      const slots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["11:00", "14:00"],
      ];
      const errors = getDayValidationErrors(slots);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should not return error for adjacent slots", () => {
      const slots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["12:00", "15:00"],
      ];
      const errors = getDayValidationErrors(slots);
      expect(errors).toEqual([]);
    });

    it("should validate multiple slots and collect all errors", () => {
      const slots: SlotTuple[] = [
        ["12:00", "09:00"],
        ["11:00", "14:00"],
      ];
      const errors = getDayValidationErrors(slots);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateDaySlots", () => {
    it("should return true for empty slots", () => {
      const result = validateDaySlots([]);
      expect(result).toBe(true);
    });

    it("should return true for valid slots", () => {
      const slots: SlotTuple[] = [["09:00", "12:00"], ["14:00", "18:00"]];
      const result = validateDaySlots(slots);
      expect(result).toBe(true);
    });

    it("should return false for invalid slots", () => {
      const slots: SlotTuple[] = [["12:00", "09:00"]];
      const result = validateDaySlots(slots);
      expect(result).toBe(false);
    });

    it("should return false for overlapping slots", () => {
      const slots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["11:00", "14:00"],
      ];
      const result = validateDaySlots(slots);
      expect(result).toBe(false);
    });
  });

  describe("emitValidity", () => {
    it("should emit true when all days are valid", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"]],
        sunday: [["10:00", "15:00"]],
        monday: [],
        tuesday: [["14:00", "18:00"]],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const emit = vi.fn();
      emitValidity(times, emit);

      expect(emit).toHaveBeenCalledWith("update:valid", true);
    });

    it("should emit false when any day is invalid", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"]],
        sunday: [["12:00", "09:00"]],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const emit = vi.fn();
      emitValidity(times, emit);

      expect(emit).toHaveBeenCalledWith("update:valid", false);
    });

    it("should emit true for all empty days", () => {
      const times: ReservationTimes = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const emit = vi.fn();
      emitValidity(times, emit);

      expect(emit).toHaveBeenCalledWith("update:valid", true);
    });

    it("should emit false when multiple days are invalid", () => {
      const times: ReservationTimes = {
        saturday: [["12:00", "09:00"]],
        sunday: [["15:00", "10:00"]],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const emit = vi.fn();
      emitValidity(times, emit);

      expect(emit).toHaveBeenCalledWith("update:valid", false);
    });
  });

  describe("getDaySlots", () => {
    it("should return normalized slots for a day", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"]],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const slots = getDaySlots(times, "saturday");
      expect(slots).toEqual([["09:00", "12:00"]]);
    });

    it("should return normalized empty array for day without slots", () => {
      const times: ReservationTimes = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const slots = getDaySlots(times, "sunday");
      expect(slots).toEqual([]);
    });

    it("should normalize slots using normalizeDay utility", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"], ["14:00", "16:00"]],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const slots = getDaySlots(times, "saturday");
      expect(slots).toHaveLength(2);
    });
  });

  describe("canAddSlotToDay", () => {
    it("should return true when day has no slots", () => {
      const times: ReservationTimes = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const canAdd = canAddSlotToDay(times, "saturday");
      expect(canAdd).toBe(true);
    });

    it("should return true when day has fewer than max slots", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"]],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const canAdd = canAddSlotToDay(times, "saturday");
      expect(canAdd).toBe(true);
    });

    it("should return false when day has max slots (3)", () => {
      const times: ReservationTimes = {
        saturday: [
          ["09:00", "12:00"],
          ["13:00", "15:00"],
          ["16:00", "18:00"],
        ],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const canAdd = canAddSlotToDay(times, "saturday");
      expect(canAdd).toBe(false);
    });
  });

  describe("validateDaySlotsFor", () => {
    it("should return ok: true for valid slots", () => {
      const times: ReservationTimes = {
        saturday: [["09:00", "12:00"]],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const result = validateDaySlotsFor(times, "saturday");
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return ok: false with errors for invalid slots", () => {
      const times: ReservationTimes = {
        saturday: [["12:00", "09:00"]],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const result = validateDaySlotsFor(times, "saturday");
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return ok: true for empty slots", () => {
      const times: ReservationTimes = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const result = validateDaySlotsFor(times, "saturday");
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return all errors for multiple invalid slots", () => {
      const times: ReservationTimes = {
        saturday: [
          ["12:00", "09:00"],
          ["11:00", "14:00"],
        ],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };

      const result = validateDaySlotsFor(times, "saturday");
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
