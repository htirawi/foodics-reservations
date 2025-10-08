/**
 * @file useSettingsValidationLogic.spec.ts
 * @summary Unit tests for useSettingsValidationLogic composable
 */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useSettingsValidationLogic } from "@/features/branches/composables/useSettingsValidationLogic";
import type { ReservationTimes, SlotTuple } from "@/types/foodics";

describe("useSettingsValidationLogic", () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      "settings.duration.errors.min": "Duration must be at least 1 minute",
      "settings.slots.errors.required": "At least one time slot is required",
      "settings.slots.errors.format": "Invalid time format",
      "settings.slots.errors.overlap": "Time slots cannot overlap",
    };
    return translations[key] || key;
  };

  describe("checkDuration", () => {
    it("should return true for valid duration", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkDuration } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkDuration()).toBe(true);
    });

    it("should return false for invalid duration", () => {
      const duration = ref(0);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkDuration, errors } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkDuration()).toBe(false);
      expect(errors.value.duration).toBe("Duration must be at least 1 minute");
    });
  });

  describe("checkSlots", () => {
    it("should return true for valid slots", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkSlots } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkSlots("monday")).toBe(true);
    });

    it("should return true for empty slots", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkSlots } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkSlots("monday")).toBe(true);
    });

    it("should return false for invalid time format", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["25:00", "12:00"] as SlotTuple],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkSlots, errors } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkSlots("monday")).toBe(false);
      expect(errors.value.slots?.monday).toBe("Invalid time format");
    });

    it("should return false for overlapping slots", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [
          ["09:00", "12:00"],
          ["11:00", "14:00"],
        ],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkSlots, errors } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkSlots("monday")).toBe(false);
      expect(errors.value.slots?.monday).toBe("Time slots cannot overlap");
    });

    it("should handle undefined slots gracefully", () => {
      const duration = ref(30);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkSlots } = useSettingsValidationLogic(
        duration,
        weekSlots,
        mockT,
      );

      expect(checkSlots("monday")).toBe(true);
    });
  });

  describe("clearAllErrors", () => {
    it("should clear all validation errors", () => {
      const duration = ref(0);
      const weekSlots = ref<ReservationTimes>({
        saturday: [],
        sunday: [],
        monday: [["25:00", "12:00"] as SlotTuple],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      });

      const { checkDuration, checkSlots, clearAllErrors, errors } =
        useSettingsValidationLogic(duration, weekSlots, mockT);

      checkDuration();
      checkSlots("monday");

      expect(errors.value.duration).toBeDefined();
      expect(errors.value.slots?.monday).toBeDefined();

      clearAllErrors();

      expect(errors.value.duration).toBeUndefined();
      expect(errors.value.slots).toBeUndefined();
    });
  });
});
