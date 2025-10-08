/**
 * @file time-boundaries.spec.ts
 * @summary Unit tests for time boundary edge-case policies
 * @remarks Comprehensive edge-case coverage (25+ test cases)
 */
import { describe, it, expect } from 'vitest';
import { validateTimeBoundaries, isOvernightRange } from '@/utils/policies/time-boundaries';
import type { SlotTuple } from '@/types/foodics';

describe('Time Boundary Policies', () => {
  describe('Valid boundaries', () => {
    it('should allow 00:00 as start time', () => {
      const slot: SlotTuple = ['00:00', '01:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 23:59 as end time', () => {
      const slot: SlotTuple = ['22:00', '23:59'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 00:00-00:01 (minimum duration at start of day)', () => {
      const slot: SlotTuple = ['00:00', '00:01'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 23:58-23:59 (minimum duration at end of day)', () => {
      const slot: SlotTuple = ['23:58', '23:59'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 00:00-23:59 (full day slot)', () => {
      const slot: SlotTuple = ['00:00', '23:59'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 09:00-17:00 (typical business hours)', () => {
      const slot: SlotTuple = ['09:00', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 12:00-13:00 (1-hour midday slot)', () => {
      const slot: SlotTuple = ['12:00', '13:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 00:00-12:00 (morning half)', () => {
      const slot: SlotTuple = ['00:00', '12:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should allow 12:00-23:59 (afternoon/evening)', () => {
      const slot: SlotTuple = ['12:00', '23:59'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('Invalid boundaries - overnight ranges', () => {
    it('should reject 23:59-00:00 (overnight range)', () => {
      const slot: SlotTuple = ['23:59', '00:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });

    it('should reject 22:00-02:00 (overnight range)', () => {
      const slot: SlotTuple = ['22:00', '02:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });

    it('should reject 18:00-06:00 (overnight range)', () => {
      const slot: SlotTuple = ['18:00', '06:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });

    it('should reject 12:00-12:00 (zero duration)', () => {
      const slot: SlotTuple = ['12:00', '12:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });

    it('should reject 09:00-08:00 (reverse order)', () => {
      const slot: SlotTuple = ['09:00', '08:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });
  });

  describe('Invalid format', () => {
    it('should reject non-zero-padded start time', () => {
      const slot: SlotTuple = ['9:00', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });

    it('should reject non-zero-padded end time', () => {
      const slot: SlotTuple = ['09:00', '5:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });

    it('should reject hour > 23', () => {
      const slot: SlotTuple = ['25:00', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });

    it('should reject minute > 59', () => {
      const slot: SlotTuple = ['09:60', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });

    it('should reject invalid characters', () => {
      const slot: SlotTuple = ['abc', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });

    it('should reject empty string', () => {
      const slot: SlotTuple = ['', '17:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.format' });
    });
  });

  describe('isOvernightRange', () => {
    it('should detect 23:59-00:00 as overnight', () => {
      const slot: SlotTuple = ['23:59', '00:00'];
      expect(isOvernightRange(slot)).toBe(true);
    });

    it('should detect 22:00-02:00 as overnight', () => {
      const slot: SlotTuple = ['22:00', '02:00'];
      expect(isOvernightRange(slot));
    });

    it('should not detect 09:00-17:00 as overnight', () => {
      const slot: SlotTuple = ['09:00', '17:00'];
      expect(isOvernightRange(slot)).toBe(false);
    });

    it('should detect same time as overnight (zero duration)', () => {
      const slot: SlotTuple = ['12:00', '12:00'];
      expect(isOvernightRange(slot)).toBe(true);
    });

    it('should return false for invalid format', () => {
      const slot: SlotTuple = ['invalid', '17:00'];
      expect(isOvernightRange(slot)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle 00:01-00:02 (second minute of day)', () => {
      const slot: SlotTuple = ['00:01', '00:02'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should handle 23:57-23:58 (third-to-last minute)', () => {
      const slot: SlotTuple = ['23:57', '23:58'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: true });
    });

    it('should reject 00:00-00:00 (zero duration at start)', () => {
      const slot: SlotTuple = ['00:00', '00:00'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });

    it('should reject 23:59-23:59 (zero duration at end)', () => {
      const slot: SlotTuple = ['23:59', '23:59'];
      const result = validateTimeBoundaries(slot);
      expect(result).toEqual({ ok: false, error: 'settings.slots.errors.overnightNotSupported' });
    });
  });
});
