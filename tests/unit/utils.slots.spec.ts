/**
 * @file utils.slots.spec.ts
 * @summary Unit tests for slot validation utilities
 * @remarks Deterministic, fast, offline; no date libs; returns i18n keys
 */
import { describe, it, expect } from "vitest";

import type { SlotTuple, ReservationTimes } from "@/types/foodics";
import {
  isValidRange,
  isOverlapping,
  canAddSlot,
  copySaturdayToAll,
  normalizeDay,
} from "@/utils/slots";

describe("isValidRange", () => {
  it("should return ok:true for valid slot with start < end", () => {
    const slot: SlotTuple = ["09:00", "12:00"];
    const result = isValidRange(slot);
    expect(result).toEqual({ ok: true });
  });

  it("should return format error for invalid HH:mm format", () => {
    const badSlots: SlotTuple[] = [
      ["9:00", "12:00"],
      ["09:00", "12:0"],
      ["25:00", "12:00"],
      ["09:60", "12:00"],
      ["abc", "12:00"],
    ];

    for (const slot of badSlots) {
      const result = isValidRange(slot);
      expect(result).toEqual({ ok: false, error: "settings.slots.errors.format" });
    }
  });

  it("should return order error when start >= end", () => {
    const badSlots: SlotTuple[] = [
      ["12:00", "12:00"],
      ["15:00", "09:00"],
      ["23:59", "00:00"],
    ];

    for (const slot of badSlots) {
      const result = isValidRange(slot);
      expect(result).toEqual({ ok: false, error: "settings.slots.errors.order" });
    }
  });

  it("should accept edge case near midnight", () => {
    const slot: SlotTuple = ["00:00", "01:00"];
    const result = isValidRange(slot);
    expect(result).toEqual({ ok: true });
  });

  it("should accept edge case near end of day", () => {
    const slot: SlotTuple = ["22:00", "23:59"];
    const result = isValidRange(slot);
    expect(result).toEqual({ ok: true });
  });
});

describe("isOverlapping", () => {
  it("should return true for strictly overlapping slots", () => {
    expect(isOverlapping(["09:00", "12:00"], ["10:00", "13:00"])).toBe(true);
    expect(isOverlapping(["09:00", "15:00"], ["10:00", "11:00"])).toBe(true);
    expect(isOverlapping(["10:00", "11:00"], ["09:00", "15:00"])).toBe(true);
  });

  it("should return false for touching boundaries", () => {
    expect(isOverlapping(["09:00", "12:00"], ["12:00", "15:00"])).toBe(false);
    expect(isOverlapping(["12:00", "15:00"], ["09:00", "12:00"])).toBe(false);
  });

  it("should return false for completely separate slots", () => {
    expect(isOverlapping(["09:00", "10:00"], ["11:00", "12:00"])).toBe(false);
    expect(isOverlapping(["14:00", "15:00"], ["09:00", "10:00"])).toBe(false);
  });

  it("should return false if either slot has invalid format", () => {
    expect(isOverlapping(["invalid", "12:00"], ["10:00", "13:00"])).toBe(false);
    expect(isOverlapping(["09:00", "12:00"], ["invalid", "13:00"])).toBe(false);
  });

  it("should handle nested intervals correctly", () => {
    expect(isOverlapping(["09:00", "15:00"], ["10:00", "14:00"])).toBe(true);
    expect(isOverlapping(["10:00", "14:00"], ["09:00", "15:00"])).toBe(true);
  });
});

describe("canAddSlot", () => {
  it("should return ok:true when slot is valid and no conflicts", () => {
    const existing: SlotTuple[] = [["09:00", "12:00"]];
    const candidate: SlotTuple = ["13:00", "15:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: true });
  });

  it("should return format error for invalid candidate format", () => {
    const existing: SlotTuple[] = [["09:00", "12:00"]];
    const candidate: SlotTuple = ["9:00", "15:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.format" });
  });

  it("should return order error when candidate start >= end", () => {
    const existing: SlotTuple[] = [["09:00", "12:00"]];
    const candidate: SlotTuple = ["15:00", "15:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.order" });
  });

  it("should return max error when already at limit", () => {
    const existing: SlotTuple[] = [
      ["09:00", "10:00"],
      ["11:00", "12:00"],
      ["13:00", "14:00"],
    ];
    const candidate: SlotTuple = ["15:00", "16:00"];
    const result = canAddSlot(existing, candidate, 3);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.max" });
  });

  it("should return overlap error when candidate overlaps existing", () => {
    const existing: SlotTuple[] = [["09:00", "12:00"]];
    const candidate: SlotTuple = ["10:00", "13:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.overlap" });
  });

  it("should allow touching boundaries (not overlap)", () => {
    const existing: SlotTuple[] = [["09:00", "12:00"]];
    const candidate: SlotTuple = ["12:00", "15:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: true });
  });

  it("should respect custom max parameter", () => {
    const existing: SlotTuple[] = [["09:00", "10:00"]];
    const candidate: SlotTuple = ["11:00", "12:00"];
    const result = canAddSlot(existing, candidate, 1);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.max" });
  });

  it("should check all existing slots for overlap", () => {
    const existing: SlotTuple[] = [
      ["09:00", "10:00"],
      ["14:00", "15:00"],
    ];
    const candidate: SlotTuple = ["14:30", "16:00"];
    const result = canAddSlot(existing, candidate);
    expect(result).toEqual({ ok: false, error: "settings.slots.errors.overlap" });
  });
});

describe("copySaturdayToAll", () => {
  it("should deep clone and copy Saturday to all days", () => {
    const original: ReservationTimes = {
      saturday: [["09:00", "12:00"], ["14:00", "17:00"]],
      sunday: [["10:00", "13:00"]],
      monday: [],
      tuesday: [["08:00", "11:00"]],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    const result = copySaturdayToAll(original);

    expect(result.saturday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.sunday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.monday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.tuesday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.wednesday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.thursday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);
    expect(result.friday).toEqual([["09:00", "12:00"], ["14:00", "17:00"]]);

    expect(result).not.toBe(original);
    expect(result.saturday).not.toBe(original.saturday);
    expect(result.sunday).not.toBe(original.sunday);
  });

  it("should handle empty Saturday slots", () => {
    const original: ReservationTimes = {
      saturday: [],
      sunday: [["10:00", "13:00"]],
      monday: [["08:00", "11:00"]],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    const result = copySaturdayToAll(original);

    for (const day of Object.keys(result)) {
      expect(result[day as keyof ReservationTimes]).toEqual([]);
    }
  });

  it("should create independent slot arrays (deep clone)", () => {
    const original: ReservationTimes = {
      saturday: [["09:00", "12:00"]],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    const result = copySaturdayToAll(original);

    result.saturday[0] = ["changed" as unknown as string, "value" as unknown as string] as SlotTuple;

    expect(original.saturday[0]).toEqual(["09:00", "12:00"]);
    expect(result.sunday[0]).toEqual(["09:00", "12:00"]);
  });
});

describe("normalizeDay", () => {
  it("should sort slots by start time", () => {
    const slots: SlotTuple[] = [
      ["14:00", "15:00"],
      ["09:00", "10:00"],
      ["12:00", "13:00"],
    ];

    const result = normalizeDay(slots);

    expect(result).toEqual([
      ["09:00", "10:00"],
      ["12:00", "13:00"],
      ["14:00", "15:00"],
    ]);
  });

  it("should deduplicate identical slots", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:00"],
      ["09:00", "12:00"],
      ["14:00", "15:00"],
    ];

    const result = normalizeDay(slots);

    expect(result).toEqual([
      ["09:00", "12:00"],
      ["14:00", "15:00"],
    ]);
  });

  it("should not mutate original array", () => {
    const slots: SlotTuple[] = [
      ["14:00", "15:00"],
      ["09:00", "10:00"],
    ];
    const original = [...slots];

    normalizeDay(slots);

    expect(slots).toEqual(original);
  });

  it("should handle empty array", () => {
    const result = normalizeDay([]);
    expect(result).toEqual([]);
  });

  it("should handle single slot", () => {
    const slots: SlotTuple[] = [["09:00", "12:00"]];
    const result = normalizeDay(slots);
    expect(result).toEqual([["09:00", "12:00"]]);
  });
});
