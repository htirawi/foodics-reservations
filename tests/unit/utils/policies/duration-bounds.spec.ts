/**
 * @file duration-bounds.spec.ts
 * @summary Unit tests for duration bounds policies (20+ test cases)
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeDurationStrict,
  isValidDurationStrict
} from '@/utils/policies/duration-bounds';

describe('Duration Bounds Policies', () => {
  describe('sanitizeDurationStrict - Valid input', () => {
    it('should accept 1 (minimum)', () => {
      expect(sanitizeDurationStrict(1)).toBe(1);
    });

    it('should accept 1440 (maximum)', () => {
      expect(sanitizeDurationStrict(1440)).toBe(1440);
    });

    it('should accept 60 (typical hour)', () => {
      expect(sanitizeDurationStrict(60)).toBe(60);
    });

    it('should accept 30 (half hour)', () => {
      expect(sanitizeDurationStrict(30)).toBe(30);
    });

    it('should accept 720 (12 hours)', () => {
      expect(sanitizeDurationStrict(720)).toBe(720);
    });
  });

  describe('sanitizeDurationStrict - Clamping', () => {
    it('should clamp 1441 to 1440', () => {
      expect(sanitizeDurationStrict(1441)).toBe(1440);
    });

    it('should clamp 2000 to 1440', () => {
      expect(sanitizeDurationStrict(2000)).toBe(1440);
    });

    it('should clamp 10000 to 1440', () => {
      expect(sanitizeDurationStrict(10000)).toBe(1440);
    });
  });

  describe('sanitizeDurationStrict - Floor floats', () => {
    it('should floor 15.7 to 15', () => {
      expect(sanitizeDurationStrict(15.7)).toBe(15);
    });

    it('should floor 60.9 to 60', () => {
      expect(sanitizeDurationStrict(60.9)).toBe(60);
    });

    it('should floor 1440.1 to 1440', () => {
      expect(sanitizeDurationStrict(1440.1)).toBe(1440);
    });

    it('should floor 1.1 to 1', () => {
      expect(sanitizeDurationStrict(1.1)).toBe(1);
    });
  });

  describe('sanitizeDurationStrict - Reject invalid numbers', () => {
    it('should reject 0', () => {
      expect(sanitizeDurationStrict(0)).toBeNull();
    });

    it('should reject -10', () => {
      expect(sanitizeDurationStrict(-10)).toBeNull();
    });

    it('should reject -1', () => {
      expect(sanitizeDurationStrict(-1)).toBeNull();
    });

    it('should reject NaN', () => {
      expect(sanitizeDurationStrict(NaN)).toBeNull();
    });

    it('should reject Infinity', () => {
      expect(sanitizeDurationStrict(Infinity)).toBeNull();
    });

    it('should reject -Infinity', () => {
      expect(sanitizeDurationStrict(-Infinity)).toBeNull();
    });
  });

  describe('sanitizeDurationStrict - String input', () => {
    it('should parse "60" to 60', () => {
      expect(sanitizeDurationStrict('60')).toBe(60);
    });

    it('should parse "  30  " (whitespace) to 30', () => {
      expect(sanitizeDurationStrict('  30  ')).toBe(30);
    });

    it('should parse "15.7" to 15 (floor)', () => {
      expect(sanitizeDurationStrict('15.7')).toBe(15);
    });

    it('should reject empty string', () => {
      expect(sanitizeDurationStrict('')).toBeNull();
    });

    it('should reject "abc"', () => {
      expect(sanitizeDurationStrict('abc')).toBeNull();
    });

    it('should reject "  " (whitespace only)', () => {
      expect(sanitizeDurationStrict('  ')).toBeNull();
    });

    it('should reject "-"', () => {
      expect(sanitizeDurationStrict('-')).toBeNull();
    });

    it('should reject "."', () => {
      expect(sanitizeDurationStrict('.')).toBeNull();
    });

    it('should parse "1441" and clamp to 1440', () => {
      expect(sanitizeDurationStrict('1441')).toBe(1440);
    });

    it('should reject "0"', () => {
      expect(sanitizeDurationStrict('0')).toBeNull();
    });

    it('should reject "-5"', () => {
      expect(sanitizeDurationStrict('-5')).toBeNull();
    });
  });

  describe('sanitizeDurationStrict - Null/undefined', () => {
    it('should return null for null', () => {
      expect(sanitizeDurationStrict(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(sanitizeDurationStrict(undefined)).toBeNull();
    });
  });

  describe('sanitizeDurationStrict - Custom bounds', () => {
    it('should respect custom min', () => {
      expect(sanitizeDurationStrict(5, { min: 10 })).toBeNull();
    });

    it('should respect custom max', () => {
      expect(sanitizeDurationStrict(100, { max: 50 })).toBe(50);
    });

    it('should accept value in custom range', () => {
      expect(sanitizeDurationStrict(30, { min: 15, max: 60 })).toBe(30);
    });
  });

  describe('isValidDurationStrict', () => {
    it('should return true for valid integer in range', () => {
      expect(isValidDurationStrict(60)).toBe(true);
    });

    it('should return true for 1 (minimum)', () => {
      expect(isValidDurationStrict(1)).toBe(true);
    });

    it('should return true for 1440 (maximum)', () => {
      expect(isValidDurationStrict(1440)).toBe(true);
    });

    it('should return false for float', () => {
      expect(isValidDurationStrict(15.7)).toBe(false);
    });

    it('should return false for 0', () => {
      expect(isValidDurationStrict(0)).toBe(false);
    });

    it('should return false for negative', () => {
      expect(isValidDurationStrict(-10)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidDurationStrict(NaN)).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(isValidDurationStrict(Infinity)).toBe(false);
    });

    it('should return false for 1441 (over max)', () => {
      expect(isValidDurationStrict(1441)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isValidDurationStrict('60')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidDurationStrict(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDurationStrict(undefined)).toBe(false);
    });

    it('should respect custom bounds', () => {
      expect(isValidDurationStrict(30, { min: 15, max: 60 })).toBe(true);
      expect(isValidDurationStrict(10, { min: 15, max: 60 })).toBe(false);
      expect(isValidDurationStrict(70, { min: 15, max: 60 })).toBe(false);
    });
  });
});
