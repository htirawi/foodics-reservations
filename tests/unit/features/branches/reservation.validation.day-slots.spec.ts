/**
 * @file reservation.validation.day-slots.spec.ts
 * @summary Unit tests for day slots validation utilities (CARD 9)
 * @remarks
 *   - Tests pure functions; no side effects.
 *   - TypeScript strict; no any/unknown.
 */

import { describe, it, expect } from "vitest";
import {
  parseHHmm,
  toMinutes,
  isHHmm,
  compareHHmm,
  slotOverlaps,
  normalizeSlots,
  validateDaySlots,
  validateReservationTimes,
} from "@/features/branches/utils/reservation.validation";
import type { SlotTuple, ReservationTimes } from "@/types/foodics";

describe("parseHHmm", () => {
  it("parses valid HH:mm format", () => {
    expect(parseHHmm("09:30")).toEqual({ h: 9, m: 30 });
    expect(parseHHmm("00:00")).toEqual({ h: 0, m: 0 });
    expect(parseHHmm("23:59")).toEqual({ h: 23, m: 59 });
  });

  it("handles leading zeros correctly", () => {
    expect(parseHHmm("00:00")).toEqual({ h: 0, m: 0 });
    expect(parseHHmm("01:05")).toEqual({ h: 1, m: 5 });
    expect(parseHHmm("09:09")).toEqual({ h: 9, m: 9 });
  });

  it("returns null for invalid format", () => {
    expect(parseHHmm("9:30")).toBeNull(); // Missing leading zero
    expect(parseHHmm("25:00")).toBeNull(); // Invalid hour
    expect(parseHHmm("12:60")).toBeNull(); // Invalid minute
    expect(parseHHmm("abc")).toBeNull();
    expect(parseHHmm("")).toBeNull();
  });

  it("handles 24-hour bounds", () => {
    expect(parseHHmm("23:59")).toEqual({ h: 23, m: 59 });
    expect(parseHHmm("24:00")).toBeNull(); // 24 is invalid
    expect(parseHHmm("00:00")).toEqual({ h: 0, m: 0 });
  });
});

describe("toMinutes", () => {
  it("converts hours and minutes to total minutes", () => {
    expect(toMinutes({ h: 0, m: 0 })).toBe(0);
    expect(toMinutes({ h: 1, m: 0 })).toBe(60);
    expect(toMinutes({ h: 0, m: 30 })).toBe(30);
    expect(toMinutes({ h: 9, m: 30 })).toBe(570);
    expect(toMinutes({ h: 23, m: 59 })).toBe(1439);
  });
});

describe("isHHmm", () => {
  it("returns true for valid HH:mm format", () => {
    expect(isHHmm("09:30")).toBe(true);
    expect(isHHmm("00:00")).toBe(true);
    expect(isHHmm("23:59")).toBe(true);
    expect(isHHmm("12:00")).toBe(true);
  });

  it("returns false for invalid format", () => {
    expect(isHHmm("9:30")).toBe(false);
    expect(isHHmm("25:00")).toBe(false);
    expect(isHHmm("12:60")).toBe(false);
    expect(isHHmm("abc")).toBe(false);
    expect(isHHmm("")).toBe(false);
  });
});

describe("compareHHmm", () => {
  it("returns -1 when first time is earlier", () => {
    expect(compareHHmm("09:00", "10:00")).toBe(-1);
    expect(compareHHmm("09:30", "09:31")).toBe(-1);
  });

  it("returns 0 when times are equal", () => {
    expect(compareHHmm("09:00", "09:00")).toBe(0);
    expect(compareHHmm("12:30", "12:30")).toBe(0);
  });

  it("returns 1 when first time is later", () => {
    expect(compareHHmm("10:00", "09:00")).toBe(1);
    expect(compareHHmm("09:31", "09:30")).toBe(1);
  });

  it("handles invalid times gracefully", () => {
    expect(compareHHmm("invalid", "09:00")).toBe(0);
    expect(compareHHmm("09:00", "invalid")).toBe(0);
  });
});

describe("slotOverlaps", () => {
  it("detects true overlaps", () => {
    const slot1: SlotTuple = ["09:00", "12:00"];
    const slot2: SlotTuple = ["11:00", "14:00"];
    expect(slotOverlaps(slot1, slot2)).toBe(true);
  });

  it("allows touching slots (per CARD 9)", () => {
    const slot1: SlotTuple = ["09:00", "12:00"];
    const slot2: SlotTuple = ["12:00", "15:00"];
    expect(slotOverlaps(slot1, slot2)).toBe(false);
  });

  it("returns false for completely separate slots", () => {
    const slot1: SlotTuple = ["09:00", "12:00"];
    const slot2: SlotTuple = ["13:00", "16:00"];
    expect(slotOverlaps(slot1, slot2)).toBe(false);
  });

  it("detects slot1 contains slot2", () => {
    const slot1: SlotTuple = ["09:00", "18:00"];
    const slot2: SlotTuple = ["12:00", "15:00"];
    expect(slotOverlaps(slot1, slot2)).toBe(true);
  });

  it("detects slot2 contains slot1", () => {
    const slot1: SlotTuple = ["12:00", "15:00"];
    const slot2: SlotTuple = ["09:00", "18:00"];
    expect(slotOverlaps(slot1, slot2)).toBe(true);
  });
});

describe("normalizeSlots", () => {
  it("sorts slots by start time", () => {
    const slots: SlotTuple[] = [
      ["15:00", "18:00"],
      ["09:00", "12:00"],
      ["12:00", "15:00"],
    ];
    const normalized = normalizeSlots(slots);
    expect(normalized).toEqual([
      ["09:00", "12:00"],
      ["12:00", "15:00"],
      ["15:00", "18:00"],
    ]);
  });

  it("removes duplicate slots", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:00"],
      ["09:00", "12:00"],
      ["12:00", "15:00"],
    ];
    const normalized = normalizeSlots(slots);
    expect(normalized).toEqual([
      ["09:00", "12:00"],
      ["12:00", "15:00"],
    ]);
  });

  it("handles empty array", () => {
    expect(normalizeSlots([])).toEqual([]);
  });

  it("sorts and dedupes simultaneously", () => {
    const slots: SlotTuple[] = [
      ["15:00", "18:00"],
      ["09:00", "12:00"],
      ["15:00", "18:00"],
      ["12:00", "15:00"],
      ["09:00", "12:00"],
    ];
    const normalized = normalizeSlots(slots);
    expect(normalized).toEqual([
      ["09:00", "12:00"],
      ["12:00", "15:00"],
      ["15:00", "18:00"],
    ]);
  });
});

describe("validateDaySlots", () => {
  it("returns ok:true for valid slots", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:00"],
      ["12:00", "15:00"],
      ["15:00", "18:00"],
    ];
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("enforces max 3 slots per day", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:00"],
      ["12:00", "15:00"],
      ["15:00", "18:00"],
      ["18:00", "21:00"], // 4th slot
    ];
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("settings.slots.errors.max");
  });

  it("detects invalid format", () => {
    const slots: SlotTuple[] = [["9:00", "12:00"]]; // Missing leading zero
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("settings.slots.errors.format");
  });

  it("detects start >= end (order error)", () => {
    const slots: SlotTuple[] = [["12:00", "09:00"]]; // End before start
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("settings.slots.errors.overnightNotSupported");
  });

  it("detects overnight ranges", () => {
    const slots: SlotTuple[] = [["22:00", "02:00"]]; // Overnight
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("settings.slots.errors.overnightNotSupported");
  });

  it("detects overlapping slots", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:30"],
      ["12:00", "15:00"], // Overlaps with first
    ];
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("settings.slots.errors.overlap");
  });

  it("allows touching slots", () => {
    const slots: SlotTuple[] = [
      ["09:00", "12:00"],
      ["12:00", "15:00"], // Touches, not overlaps
    ];
    const result = validateDaySlots(slots);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("returns ok:true for empty slots", () => {
    const result = validateDaySlots([]);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("validateReservationTimes", () => {
  it("validates all days and returns per-day errors", () => {
    const times: ReservationTimes = {
      saturday: [["09:00", "12:00"]],
      sunday: [["9:00", "12:00"]], // Invalid format
      monday: [],
      tuesday: [["09:00", "12:00"]],
      wednesday: [["12:00", "09:00"]], // Overnight
      thursday: [["09:00", "12:00"]],
      friday: [["09:00", "12:00"]],
    };

    const result = validateReservationTimes(times);
    expect(result.ok).toBe(false);
    expect(result.perDay.sunday.length).toBeGreaterThan(0);
    expect(result.perDay.wednesday.length).toBeGreaterThan(0);
    expect(result.perDay.saturday).toEqual([]);
  });

  it("returns ok:true when all days are valid", () => {
    const times: ReservationTimes = {
      saturday: [["09:00", "12:00"]],
      sunday: [["09:00", "12:00"]],
      monday: [["09:00", "12:00"]],
      tuesday: [["09:00", "12:00"]],
      wednesday: [["09:00", "12:00"]],
      thursday: [["09:00", "12:00"]],
      friday: [["09:00", "12:00"]],
    };

    const result = validateReservationTimes(times);
    expect(result.ok).toBe(true);
    expect(Object.values(result.perDay).every((errors) => errors.length === 0)).toBe(true);
  });
});
