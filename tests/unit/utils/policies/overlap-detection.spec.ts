/**
 * @file overlap-detection.spec.ts
 * @summary Unit tests for overlap detection policies (20+ edge cases)
 */
import { describe, it, expect } from 'vitest';
import {
  isStrictOverlap,
  canAddWithoutOverlap,
  findOverlappingSlots
} from '@/utils/policies/overlap-detection';
import type { SlotTuple } from '@/types/foodics';

describe('Overlap Detection Policies', () => {
  describe('isStrictOverlap - Touching boundaries (allowed)', () => {
    it('should NOT detect overlap for [09:00,12:00] + [12:00,15:00] (touching)', () => {
      const a: SlotTuple = ['09:00', '12:00'];
      const b: SlotTuple = ['12:00', '15:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
      expect(isStrictOverlap(b, a)).toBe(false); // Symmetric
    });

    it('should NOT detect overlap for [00:00,01:00] + [01:00,02:00] (edge-to-edge)', () => {
      const a: SlotTuple = ['00:00', '01:00'];
      const b: SlotTuple = ['01:00', '02:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });

    it('should NOT detect overlap for [23:00,23:30] + [23:30,23:59] (end of day touching)', () => {
      const a: SlotTuple = ['23:00', '23:30'];
      const b: SlotTuple = ['23:30', '23:59'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });
  });

  describe('isStrictOverlap - Strict overlap (forbidden)', () => {
    it('should detect overlap for [09:00,12:01] + [12:00,15:00] (1 min overlap)', () => {
      const a: SlotTuple = ['09:00', '12:01'];
      const b: SlotTuple = ['12:00', '15:00'];
      expect(isStrictOverlap(a, b)).toBe(true);
    });

    it('should detect overlap for [09:00,12:00] + [11:59,15:00] (1 min overlap)', () => {
      const a: SlotTuple = ['09:00', '12:00'];
      const b: SlotTuple = ['11:59', '15:00'];
      expect(isStrictOverlap(a, b)).toBe(true);
    });

    it('should detect overlap for [09:00,15:00] + [10:00,14:00] (nested)', () => {
      const a: SlotTuple = ['09:00', '15:00'];
      const b: SlotTuple = ['10:00', '14:00'];
      expect(isStrictOverlap(a, b)).toBe(true);
      expect(isStrictOverlap(b, a)).toBe(true); // Symmetric
    });

    it('should detect overlap for [10:00,13:00] + [09:00,12:00] (partial)', () => {
      const a: SlotTuple = ['10:00', '13:00'];
      const b: SlotTuple = ['09:00', '12:00'];
      expect(isStrictOverlap(a, b)).toBe(true);
    });

    it('should detect overlap for [09:00,12:00] + [10:00,13:00] (partial)', () => {
      const a: SlotTuple = ['09:00', '12:00'];
      const b: SlotTuple = ['10:00', '13:00'];
      expect(isStrictOverlap(a, b)).toBe(true);
    });
  });

  describe('isStrictOverlap - No overlap (completely separate)', () => {
    it('should NOT detect overlap for [09:00,10:00] + [11:00,12:00]', () => {
      const a: SlotTuple = ['09:00', '10:00'];
      const b: SlotTuple = ['11:00', '12:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });

    it('should NOT detect overlap for [14:00,15:00] + [09:00,10:00] (reverse order)', () => {
      const a: SlotTuple = ['14:00', '15:00'];
      const b: SlotTuple = ['09:00', '10:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });
  });

  describe('isStrictOverlap - Invalid input', () => {
    it('should return false for invalid format in first slot', () => {
      const a: SlotTuple = ['invalid', '12:00'];
      const b: SlotTuple = ['10:00', '13:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });

    it('should return false for invalid format in second slot', () => {
      const a: SlotTuple = ['09:00', '12:00'];
      const b: SlotTuple = ['invalid', '13:00'];
      expect(isStrictOverlap(a, b)).toBe(false);
    });
  });

  describe('canAddWithoutOverlap', () => {
    it('should allow adding non-overlapping slot', () => {
      const existing: SlotTuple[] = [['09:00', '12:00']];
      const candidate: SlotTuple = ['13:00', '15:00'];
      const result = canAddWithoutOverlap(existing, candidate);
      expect(result).toEqual({ ok: true });
    });

    it('should allow adding touching slot', () => {
      const existing: SlotTuple[] = [['09:00', '12:00']];
      const candidate: SlotTuple = ['12:00', '15:00'];
      const result = canAddWithoutOverlap(existing, candidate);
      expect(result).toEqual({ ok: true });
    });

    it('should reject overlapping slot', () => {
      const existing: SlotTuple[] = [['09:00', '12:00']];
      const candidate: SlotTuple = ['10:00', '13:00'];
      const result = canAddWithoutOverlap(existing, candidate);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overlap' });
    });

    it('should check all existing slots', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['14:00', '15:00']
      ];
      const candidate: SlotTuple = ['14:30', '16:00'];
      const result = canAddWithoutOverlap(existing, candidate);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overlap' });
    });

    it('should allow adding to empty array', () => {
      const existing: SlotTuple[] = [];
      const candidate: SlotTuple = ['09:00', '12:00'];
      const result = canAddWithoutOverlap(existing, candidate);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('findOverlappingSlots', () => {
    it('should find all overlapping slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'], // Overlaps 11:00-12:00
        ['10:00', '13:00'], // Overlaps 11:00-13:00
        ['14:00', '15:00']  // Overlaps 14:00-14:30
      ];
      const target: SlotTuple = ['11:00', '14:30'];
      const overlapping = findOverlappingSlots(slots, target);
      expect(overlapping).toHaveLength(3);
      expect(overlapping).toContainEqual(['09:00', '12:00']);
      expect(overlapping).toContainEqual(['10:00', '13:00']);
      expect(overlapping).toContainEqual(['14:00', '15:00']);
    });

    it('should return empty array if no overlaps', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00']
      ];
      const target: SlotTuple = ['13:00', '14:00'];
      const overlapping = findOverlappingSlots(slots, target);
      expect(overlapping).toHaveLength(0);
    });

    it('should NOT include touching slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'],
        ['15:00', '18:00']
      ];
      const target: SlotTuple = ['12:00', '15:00'];
      const overlapping = findOverlappingSlots(slots, target);
      expect(overlapping).toHaveLength(0); // Touching, not overlapping
    });
  });
});
