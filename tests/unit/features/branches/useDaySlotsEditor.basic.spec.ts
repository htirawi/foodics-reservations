/**
 * @file useDaySlotsEditor.basic.spec.ts
 * @summary Basic tests for useDaySlotsEditor composable (CRUD, validation)
 * @remarks Deterministic, fast, offline; no DOM
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDaySlotsEditor } from "@/features/branches/composables/useDaySlotsEditor";
import type { ReservationTimes } from "@/types/foodics";

describe("useDaySlotsEditor - Basic Operations", () => {
  const mockEmit = vi.fn();

  beforeEach(() => {
    mockEmit.mockClear();
  });

  const emptyTimes: ReservationTimes = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  describe("weekdays property", () => {
    it("should return fixed order: Saturday → Friday", () => {
      const { weekdays } = useDaySlotsEditor(emptyTimes, mockEmit);
      expect(weekdays).toEqual([
        "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday",
      ]);
    });
  });

  describe("dayErrors computed property", () => {
    it("should return empty errors for valid slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["13:00", "17:00"]],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday).toEqual([]);
    });

    it("should detect format errors", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["9:00", "12:00"]],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday.length).toBeGreaterThan(0);
      expect(dayErrors.value.saturday[0]).toContain("format");
    });

    it("should detect max slots error (>3)", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [
          ["09:00", "10:00"], ["11:00", "12:00"], ["13:00", "14:00"], ["15:00", "16:00"],
        ],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday.length).toBeGreaterThan(0);
      expect(dayErrors.value.saturday[0]).toContain("max");
    });

    it("should detect overlap errors", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:30"], ["12:00", "15:00"]],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday.length).toBeGreaterThan(0);
      expect(dayErrors.value.saturday[0]).toContain("overlap");
    });

    it("should allow touching slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["12:00", "15:00"]],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday).toEqual([]);
    });

    it("should detect order errors", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["12:00", "09:00"]],
      };
      const { dayErrors } = useDaySlotsEditor(times, mockEmit);
      expect(dayErrors.value.saturday.length).toBeGreaterThan(0);
      expect(dayErrors.value.saturday[0]).toContain("order");
    });
  });

  describe("canAdd function", () => {
    it("should return true when less than 3 slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const { canAdd } = useDaySlotsEditor(times, mockEmit);
      expect(canAdd("saturday")).toBe(true);
    });

    it("should return false when already 3 slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "10:00"], ["11:00", "12:00"], ["13:00", "14:00"]],
      };
      const { canAdd } = useDaySlotsEditor(times, mockEmit);
      expect(canAdd("saturday")).toBe(false);
    });
  });

  describe("addSlot function", () => {
    it("should add new slot with default times", () => {
      const { addSlot } = useDaySlotsEditor(emptyTimes, mockEmit);
      addSlot("saturday");

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", {
        ...emptyTimes,
        saturday: [["09:00", "17:00"]],
      });
    });

    it("should emit validity after adding", () => {
      const { addSlot } = useDaySlotsEditor(emptyTimes, mockEmit);
      addSlot("saturday");
      expect(mockEmit).toHaveBeenCalledWith("update:valid", true);
    });

    it("should not add when at max", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "10:00"], ["11:00", "12:00"], ["13:00", "14:00"]],
      };
      const { addSlot } = useDaySlotsEditor(times, mockEmit);
      addSlot("saturday");
      expect(mockEmit).not.toHaveBeenCalledWith("update:modelValue", expect.anything());
    });
  });

  describe("removeSlot function", () => {
    it("should remove slot at index", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["13:00", "17:00"]],
      };
      const { removeSlot } = useDaySlotsEditor(times, mockEmit);
      removeSlot("saturday", 0);

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", {
        ...emptyTimes,
        saturday: [["13:00", "17:00"]],
      });
    });
  });

  describe("updateSlot function", () => {
    it("should update from field", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const { updateSlot } = useDaySlotsEditor(times, mockEmit);
      updateSlot("saturday", 0, "from", "10:00");

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", {
        ...emptyTimes,
        saturday: [["10:00", "12:00"]],
      });
    });

    it("should update to field", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const { updateSlot } = useDaySlotsEditor(times, mockEmit);
      updateSlot("saturday", 0, "to", "13:00");

      expect(mockEmit).toHaveBeenCalledWith("update:modelValue", {
        ...emptyTimes,
        saturday: [["09:00", "13:00"]],
      });
    });
  });

  describe("getDaySlots function", () => {
    it("should return normalized slots", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["13:00", "17:00"], ["09:00", "12:00"]],
      };
      const { getDaySlots } = useDaySlotsEditor(times, mockEmit);
      const slots = getDaySlots("saturday");

      expect(slots[0]).toEqual(["09:00", "12:00"]);
      expect(slots[1]).toEqual(["13:00", "17:00"]);
    });

    it("should remove duplicates", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["09:00", "12:00"]],
      };
      const { getDaySlots } = useDaySlotsEditor(times, mockEmit);
      expect(getDaySlots("saturday").length).toBe(1);
    });
  });
});
