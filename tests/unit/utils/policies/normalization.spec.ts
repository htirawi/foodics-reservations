/**
 * @file normalization.spec.ts
 * @summary Unit tests for normalization policies (15+ test cases)
 */
import { describe, it, expect } from 'vitest';
import {
  normalizeSlotArray,
  isIdempotent,
  isStable,
  isDeepClone
} from '@/utils/policies/normalization';
import type { SlotTuple } from '@/types/foodics';

describe('Normalization Policies', () => {
  describe('normalizeSlotArray - Basic functionality', () => {
    it('should return empty array for empty input', () => {
      const slots: SlotTuple[] = [];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([]);
    });

    it('should return single slot unchanged', () => {
      const slots: SlotTuple[] = [['09:00', '12:00']];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([['09:00', '12:00']]);
    });

    it('should sort slots by start time', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '10:00'],
        ['12:00', '13:00']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([
        ['09:00', '10:00'],
        ['12:00', '13:00'],
        ['14:00', '15:00']
      ]);
    });

    it('should remove duplicate slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'],
        ['09:00', '12:00'],
        ['14:00', '15:00']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([
        ['09:00', '12:00'],
        ['14:00', '15:00']
      ]);
    });

    it('should sort and deduplicate', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '12:00'],
        ['09:00', '12:00'],
        ['12:00', '13:00']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([
        ['09:00', '12:00'],
        ['12:00', '13:00'],
        ['14:00', '15:00']
      ]);
    });
  });

  describe('normalizeSlotArray - Edge cases', () => {
    it('should handle 00:00 start time', () => {
      const slots: SlotTuple[] = [
        ['12:00', '13:00'],
        ['00:00', '01:00']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([
        ['00:00', '01:00'],
        ['12:00', '13:00']
      ]);
    });

    it('should handle 23:59 end time', () => {
      const slots: SlotTuple[] = [
        ['12:00', '13:00'],
        ['22:00', '23:59']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([
        ['12:00', '13:00'],
        ['22:00', '23:59']
      ]);
    });

    it('should handle all duplicate slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'],
        ['09:00', '12:00'],
        ['09:00', '12:00']
      ];
      const result = normalizeSlotArray(slots);
      expect(result).toEqual([['09:00', '12:00']]);
    });
  });

  describe('normalizeSlotArray - Stability', () => {
    it('should not mutate input array', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '10:00']
      ];
      const original = JSON.stringify(slots);
      normalizeSlotArray(slots);
      const after = JSON.stringify(slots);
      expect(after).toBe(original);
    });

    it('should create deep clone', () => {
      const slots: SlotTuple[] = [['09:00', '12:00']];
      const result = normalizeSlotArray(slots);

      // Mutate result
      if (result[0]) {
        result[0][0] = '99:99';
      }

      // Original should be unchanged
      expect(slots[0]).toEqual(['09:00', '12:00']);
    });
  });

  describe('normalizeSlotArray - Idempotency', () => {
    it('should be idempotent (calling twice yields same result)', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '12:00'],
        ['09:00', '12:00']
      ];
      const once = normalizeSlotArray(slots);
      const twice = normalizeSlotArray(once);
      expect(twice).toEqual(once);
    });

    it('should be idempotent for already normalized input', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['12:00', '13:00']
      ];
      const once = normalizeSlotArray(slots);
      const twice = normalizeSlotArray(once);
      expect(twice).toEqual(once);
    });
  });

  describe('isIdempotent helper', () => {
    it('should return true for normalizeSlotArray', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '10:00']
      ];
      expect(isIdempotent(normalizeSlotArray, slots)).toBe(true);
    });

    it('should return true for empty array', () => {
      const slots: SlotTuple[] = [];
      expect(isIdempotent(normalizeSlotArray, slots)).toBe(true);
    });
  });

  describe('isStable helper', () => {
    it('should return true for normalizeSlotArray (no mutation)', () => {
      const slots: SlotTuple[] = [
        ['14:00', '15:00'],
        ['09:00', '10:00']
      ];
      expect(isStable(normalizeSlotArray, slots)).toBe(true);
    });
  });

  describe('isDeepClone helper', () => {
    it('should return true for normalizeSlotArray', () => {
      const slots: SlotTuple[] = [['09:00', '12:00']];
      expect(isDeepClone(normalizeSlotArray, slots)).toBe(true);
    });

    it('should return true for empty array', () => {
      const slots: SlotTuple[] = [];
      expect(isDeepClone(normalizeSlotArray, slots)).toBe(true);
    });
  });
});
