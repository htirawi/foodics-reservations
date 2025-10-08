/**
 * @file slot-limits.spec.ts
 * @summary Unit tests for slot limit enforcement policies (15+ test cases)
 */
import { describe, it, expect } from 'vitest';
import {
  canAddWithinLimit,
  isAtLimit,
  remainingCapacity
} from '@/utils/policies/slot-limits';
import type { SlotTuple } from '@/types/foodics';

describe('Slot Limit Policies', () => {
  describe('canAddWithinLimit', () => {
    it('should allow adding to empty array (0 < 3)', () => {
      const existing: SlotTuple[] = [];
      const result = canAddWithinLimit(existing);
      expect(result).toEqual({ ok: true });
    });

    it('should allow adding when 1 slot exists (1 < 3)', () => {
      const existing: SlotTuple[] = [['09:00', '12:00']];
      const result = canAddWithinLimit(existing);
      expect(result).toEqual({ ok: true });
    });

    it('should allow adding when 2 slots exist (2 < 3)', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00']
      ];
      const result = canAddWithinLimit(existing);
      expect(result).toEqual({ ok: true });
    });

    it('should reject adding when 3 slots exist (3 >= 3)', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00']
      ];
      const result = canAddWithinLimit(existing);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.max' });
    });

    it('should reject adding when 4 slots exist (4 >= 3)', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00'],
        ['15:00', '16:00']
      ];
      const result = canAddWithinLimit(existing);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.max' });
    });
  });

  describe('canAddWithinLimit - Custom limit', () => {
    it('should enforce custom limit of 1', () => {
      const existing: SlotTuple[] = [['09:00', '12:00']];
      const result = canAddWithinLimit(existing, 1);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.max' });
    });

    it('should enforce custom limit of 2', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00']
      ];
      const result = canAddWithinLimit(existing, 2);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.max' });
    });

    it('should allow with custom limit of 5', () => {
      const existing: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00']
      ];
      const result = canAddWithinLimit(existing, 5);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('isAtLimit', () => {
    it('should return false for 0 slots (default limit 3)', () => {
      const slots: SlotTuple[] = [];
      expect(isAtLimit(slots)).toBe(false);
    });

    it('should return false for 2 slots (default limit 3)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00']
      ];
      expect(isAtLimit(slots)).toBe(false);
    });

    it('should return true for 3 slots (default limit 3)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00']
      ];
      expect(isAtLimit(slots)).toBe(true);
    });

    it('should return true for 4 slots (over limit)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00'],
        ['15:00', '16:00']
      ];
      expect(isAtLimit(slots)).toBe(true);
    });

    it('should respect custom limit', () => {
      const slots: SlotTuple[] = [['09:00', '10:00']];
      expect(isAtLimit(slots, 1)).toBe(true);
      expect(isAtLimit(slots, 2)).toBe(false);
    });
  });

  describe('remainingCapacity', () => {
    it('should return 3 for empty array (default limit)', () => {
      const slots: SlotTuple[] = [];
      expect(remainingCapacity(slots)).toBe(3);
    });

    it('should return 2 for 1 slot (default limit)', () => {
      const slots: SlotTuple[] = [['09:00', '10:00']];
      expect(remainingCapacity(slots)).toBe(2);
    });

    it('should return 1 for 2 slots (default limit)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00']
      ];
      expect(remainingCapacity(slots)).toBe(1);
    });

    it('should return 0 for 3 slots (default limit)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00']
      ];
      expect(remainingCapacity(slots)).toBe(0);
    });

    it('should return 0 for 4+ slots (over limit)', () => {
      const slots: SlotTuple[] = [
        ['09:00', '10:00'],
        ['11:00', '12:00'],
        ['13:00', '14:00'],
        ['15:00', '16:00']
      ];
      expect(remainingCapacity(slots)).toBe(0);
    });

    it('should respect custom limit', () => {
      const slots: SlotTuple[] = [['09:00', '10:00']];
      expect(remainingCapacity(slots, 1)).toBe(0);
      expect(remainingCapacity(slots, 5)).toBe(4);
    });
  });
});
