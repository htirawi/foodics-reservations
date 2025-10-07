/**
 * @file utils.time.spec.ts
 * @summary Unit tests for time utility functions
 * @remarks Deterministic, fast, offline; no date libs
 */
import { describe, it, expect } from "vitest";
import {
  parseHHmm,
  toMinutes,
  isHHmm,
  timeToMinutes,
  compareHHmm,
} from "@/utils/time";

describe("parseHHmm", () => {
  it("should parse valid HH:mm string", () => {
    const result = parseHHmm("09:30");
    expect(result).toEqual({ h: 9, m: 30 });
  });

  it("should parse midnight 00:00", () => {
    const result = parseHHmm("00:00");
    expect(result).toEqual({ h: 0, m: 0 });
  });

  it("should parse 23:59", () => {
    const result = parseHHmm("23:59");
    expect(result).toEqual({ h: 23, m: 59 });
  });

  it("should return null for invalid format", () => {
    expect(parseHHmm("9:30")).toBeNull();
    expect(parseHHmm("09:3")).toBeNull();
    expect(parseHHmm("24:00")).toBeNull();
    expect(parseHHmm("09:60")).toBeNull();
    expect(parseHHmm("abc")).toBeNull();
  });
});

describe("toMinutes", () => {
  it("should convert {h,m} to total minutes", () => {
    expect(toMinutes({ h: 9, m: 30 })).toBe(570);
    expect(toMinutes({ h: 0, m: 0 })).toBe(0);
    expect(toMinutes({ h: 23, m: 59 })).toBe(1439);
    expect(toMinutes({ h: 12, m: 0 })).toBe(720);
  });
});

describe("isHHmm", () => {
  it("should return true for valid HH:mm", () => {
    expect(isHHmm("09:30")).toBe(true);
    expect(isHHmm("00:00")).toBe(true);
    expect(isHHmm("23:59")).toBe(true);
  });

  it("should return false for invalid format", () => {
    expect(isHHmm("9:30")).toBe(false);
    expect(isHHmm("09:3")).toBe(false);
    expect(isHHmm("24:00")).toBe(false);
    expect(isHHmm("09:60")).toBe(false);
  });
});

describe("timeToMinutes", () => {
  it("should convert HH:mm string to minutes", () => {
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("should return null for invalid format", () => {
    expect(timeToMinutes("9:30")).toBeNull();
    expect(timeToMinutes("invalid")).toBeNull();
  });
});

describe("compareHHmm", () => {
  it("should return -1 when first time is earlier", () => {
    expect(compareHHmm("09:00", "12:00")).toBe(-1);
    expect(compareHHmm("00:00", "23:59")).toBe(-1);
  });

  it("should return 1 when first time is later", () => {
    expect(compareHHmm("12:00", "09:00")).toBe(1);
    expect(compareHHmm("23:59", "00:00")).toBe(1);
  });

  it("should return 0 when times are equal", () => {
    expect(compareHHmm("09:30", "09:30")).toBe(0);
    expect(compareHHmm("00:00", "00:00")).toBe(0);
  });

  it("should return 0 for invalid times", () => {
    expect(compareHHmm("invalid", "09:00")).toBe(0);
    expect(compareHHmm("09:00", "invalid")).toBe(0);
  });
});