import { describe, it, expect } from "vitest";

import { DEFAULT_SLOT_END, DEFAULT_SLOT_START } from "@/constants/reservations";
import {
  addSlotToDay,
  removeSlotFromDay,
  updateSlotField,
  applyToAllDays,
  WEEKDAY_ORDER,
} from "@/features/branches/composables/slotEditorActions";
import type { ReservationTimes, Weekday } from "@/types/foodics";

describe("slotEditorActions", () => {
  const emptyTimes: ReservationTimes = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  const timesWithSlots: ReservationTimes = {
    saturday: [["09:00", "12:00"], ["14:00", "18:00"]],
    sunday: [],
    monday: [["10:00", "15:00"]],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  describe("WEEKDAY_ORDER", () => {
    it("should export weekday order constant", () => {
      expect(WEEKDAY_ORDER).toBeDefined();
      expect(WEEKDAY_ORDER).toHaveLength(7);
      expect(WEEKDAY_ORDER[0]).toBe("saturday");
    });
  });

  describe("addSlotToDay", () => {
    it("should add default slot to empty day", () => {
      const result = addSlotToDay(emptyTimes, "saturday");

      expect(result.saturday).toHaveLength(1);
      expect(result.saturday[0]).toEqual([DEFAULT_SLOT_START, DEFAULT_SLOT_END]);
    });

    it("should add default slot to day with existing slots", () => {
      const result = addSlotToDay(timesWithSlots, "saturday");

      expect(result.saturday).toHaveLength(3);
      expect(result.saturday[2]).toEqual([DEFAULT_SLOT_START, DEFAULT_SLOT_END]);
    });

    it("should not mutate original object", () => {
      const original = { ...emptyTimes };
      addSlotToDay(emptyTimes, "saturday");

      expect(emptyTimes).toEqual(original);
    });

    it("should preserve other days", () => {
      const result = addSlotToDay(timesWithSlots, "saturday");

      expect(result.sunday).toEqual(timesWithSlots.sunday);
      expect(result.monday).toEqual(timesWithSlots.monday);
    });
  });

  describe("removeSlotFromDay", () => {
    it("should remove slot by index", () => {
      const result = removeSlotFromDay(timesWithSlots, "saturday", 0);

      expect(result.saturday).toHaveLength(1);
      expect(result.saturday[0]).toEqual(["14:00", "18:00"]);
    });

    it("should handle removing last slot", () => {
      const result = removeSlotFromDay(timesWithSlots, "saturday", 1);

      expect(result.saturday).toHaveLength(1);
      expect(result.saturday[0]).toEqual(["09:00", "12:00"]);
    });

    it("should handle empty slots array", () => {
      const result = removeSlotFromDay(emptyTimes, "saturday", 0);

      expect(result.saturday).toEqual([]);
    });

    it("should not mutate original object", () => {
      const original = { ...timesWithSlots };
      removeSlotFromDay(timesWithSlots, "saturday", 0);

      expect(timesWithSlots).toEqual(original);
    });

    it("should preserve other days", () => {
      const result = removeSlotFromDay(timesWithSlots, "saturday", 0);

      expect(result.monday).toEqual(timesWithSlots.monday);
    });
  });

  describe("updateSlotField", () => {
    it("should update 'from' field", () => {
      const result = updateSlotField(timesWithSlots, {
        day: "saturday",
        index: 0,
        field: "from",
        value: "10:00",
      });

      expect(result.saturday[0]).toEqual(["10:00", "12:00"]);
    });

    it("should update 'to' field", () => {
      const result = updateSlotField(timesWithSlots, {
        day: "saturday",
        index: 0,
        field: "to",
        value: "13:00",
      });

      expect(result.saturday[0]).toEqual(["09:00", "13:00"]);
    });

    it("should return unchanged if slot does not exist", () => {
      const result = updateSlotField(timesWithSlots, {
        day: "saturday",
        index: 99,
        field: "from",
        value: "10:00",
      });

      expect(result).toEqual(timesWithSlots);
    });

    it("should not mutate original object", () => {
      const original = { ...timesWithSlots };
      updateSlotField(timesWithSlots, {
        day: "saturday",
        index: 0,
        field: "from",
        value: "10:00",
      });

      expect(timesWithSlots).toEqual(original);
    });

    it("should preserve other days", () => {
      const result = updateSlotField(timesWithSlots, {
        day: "saturday",
        index: 0,
        field: "from",
        value: "10:00",
      });

      expect(result.monday).toEqual(timesWithSlots.monday);
    });

    it("should handle empty slots array", () => {
      const result = updateSlotField(emptyTimes, {
        day: "saturday",
        index: 0,
        field: "from",
        value: "10:00",
      });

      expect(result).toEqual(emptyTimes);
    });
  });

  describe("applyToAllDays", () => {
    it("should copy slots to all days", () => {
      const result = applyToAllDays(timesWithSlots, "saturday");

      WEEKDAY_ORDER.forEach((day: Weekday) => {
        expect(result[day]).toEqual(timesWithSlots.saturday);
      });
    });

    it("should handle empty source day", () => {
      const result = applyToAllDays(timesWithSlots, "sunday");

      WEEKDAY_ORDER.forEach((day: Weekday) => {
        expect(result[day]).toEqual([]);
      });
    });

    it("should not mutate original object", () => {
      const original = { ...timesWithSlots };
      applyToAllDays(timesWithSlots, "saturday");

      expect(timesWithSlots).toEqual(original);
    });

    it("should create independent arrays for each day", () => {
      const result = applyToAllDays(timesWithSlots, "saturday");

      result.monday.push(["20:00", "22:00"]);

      expect(result.saturday).not.toEqual(result.monday);
      expect(result.tuesday).not.toEqual(result.monday);
    });
  });
});
