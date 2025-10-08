/**
 * @file useSettingsValidation.spec.ts
 * @summary Unit tests for useSettingsValidation composable
 */
import { describe, it, expect } from "vitest";
import { useSettingsValidation } from "@/features/branches/composables/useSettingsValidation";
import type { SlotTuple } from "@/types/foodics";

describe("useSettingsValidation", () => {
  describe("validateDuration", () => {
    it("should return true for valid duration", () => {
      const { validateDuration } = useSettingsValidation();

      const result = validateDuration(30, "Invalid duration");

      expect(result).toBe(true);
    });

    it("should return false and set error for duration less than 1", () => {
      const { validateDuration, errors } = useSettingsValidation();

      const result = validateDuration(0, "Duration must be at least 1");

      expect(result).toBe(false);
      expect(errors.value.duration).toBe("Duration must be at least 1");
    });

    it("should return false and set error for missing duration", () => {
      const { validateDuration, errors } = useSettingsValidation();

      const result = validateDuration(0, "Duration is required");

      expect(result).toBe(false);
      expect(errors.value.duration).toBe("Duration is required");
    });

    it("should clear duration error for valid duration after error", () => {
      const { validateDuration, errors } = useSettingsValidation();

      validateDuration(0, "Invalid");
      expect(errors.value.duration).toBe("Invalid");

      validateDuration(30, "Invalid");
      expect(errors.value.duration).toBeUndefined();
    });
  });

  describe("validateDaySlots", () => {
    it("should return true for empty slots array", () => {
      const { validateDaySlots } = useSettingsValidation();

      const result = validateDaySlots([], "monday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });

      expect(result).toBe(true);
    });

    it("should return true for valid slots", () => {
      const { validateDaySlots } = useSettingsValidation();
      const slots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["14:00", "17:00"],
      ];

      const result = validateDaySlots(slots, "monday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });

      expect(result).toBe(true);
    });

    it("should return false for invalid time format", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const slots: SlotTuple[] = [["25:00", "12:00"]];

      const result = validateDaySlots(slots, "monday", {
        missing: "Required",
        invalid: "Invalid format",
        overlap: "Overlap",
      });

      expect(result).toBe(false);
      expect(errors.value.slots?.monday).toBe("Invalid format");
    });

    it("should return false for overlapping slots", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const slots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["11:00", "14:00"],
      ];

      const result = validateDaySlots(slots, "tuesday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Time slots overlap",
      });

      expect(result).toBe(false);
      expect(errors.value.slots?.tuesday).toBe("Time slots overlap");
    });

    it("should return false when end time is before start time", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const slots: SlotTuple[] = [["14:00", "09:00"]];

      const result = validateDaySlots(slots, "wednesday", {
        missing: "Required",
        invalid: "Invalid range",
        overlap: "Overlap",
      });

      expect(result).toBe(false);
      expect(errors.value.slots?.wednesday).toBe("Invalid range");
    });

    it("should clear day error when slots become valid", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const invalidSlots: SlotTuple[] = [["25:00", "12:00"]];
      const validSlots: SlotTuple[] = [["09:00", "12:00"]];

      validateDaySlots(invalidSlots, "thursday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });
      expect(errors.value.slots?.thursday).toBe("Invalid");

      validateDaySlots(validSlots, "thursday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });
      expect(errors.value.slots?.thursday).toBeUndefined();
    });

    it("should clear day error when slots are removed", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const invalidSlots: SlotTuple[] = [["25:00", "12:00"]];

      validateDaySlots(invalidSlots, "friday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });
      expect(errors.value.slots?.friday).toBe("Invalid");

      validateDaySlots([], "friday", {
        missing: "Required",
        invalid: "Invalid",
        overlap: "Overlap",
      });
      expect(errors.value.slots?.friday).toBeUndefined();
    });

    it("should handle multiple days with errors independently", () => {
      const { validateDaySlots, errors } = useSettingsValidation();
      const invalidSlots: SlotTuple[] = [["25:00", "12:00"]];

      validateDaySlots(invalidSlots, "monday", {
        missing: "R",
        invalid: "Invalid Monday",
        overlap: "O",
      });
      validateDaySlots(invalidSlots, "tuesday", {
        missing: "R",
        invalid: "Invalid Tuesday",
        overlap: "O",
      });

      expect(errors.value.slots?.monday).toBe("Invalid Monday");
      expect(errors.value.slots?.tuesday).toBe("Invalid Tuesday");
    });
  });

  describe("clearAllErrors", () => {
    it("should clear all errors", () => {
      const { validateDuration, validateDaySlots, clearAllErrors, errors } =
        useSettingsValidation();

      validateDuration(0, "Invalid duration");
      validateDaySlots([["25:00", "12:00"]], "monday", {
        missing: "R",
        invalid: "Invalid",
        overlap: "O",
      });

      expect(errors.value.duration).toBeDefined();
      expect(errors.value.slots?.monday).toBeDefined();

      clearAllErrors();

      expect(errors.value.duration).toBeUndefined();
      expect(errors.value.slots).toBeUndefined();
      expect(Object.keys(errors.value)).toHaveLength(0);
    });
  });
});
