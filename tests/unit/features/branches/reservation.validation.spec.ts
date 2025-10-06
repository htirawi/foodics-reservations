import { describe, it, expect } from 'vitest';
import {
  sanitizeDuration,
  isValidDuration,
  isValidTimeFormat,
  timeToMinutes,
  isValidSlotTuple,
  slotsOverlap,
  validateDaySlots,
  isValidReservationTimes,
} from '@/features/branches/utils/reservation.validation';
import type { SlotTuple, ReservationTimes } from '@/types/foodics';

describe('reservation.validation', () => {
  describe('sanitizeDuration', () => {
    it('returns null for null/undefined', () => {
      expect(sanitizeDuration(null)).toBe(null);
      expect(sanitizeDuration(undefined)).toBe(null);
    });

    it('returns null for empty strings', () => {
      expect(sanitizeDuration('')).toBe(null);
      expect(sanitizeDuration('   ')).toBe(null);
    });

    it('parses valid string numbers', () => {
      expect(sanitizeDuration('60')).toBe(60);
      expect(sanitizeDuration('120')).toBe(120);
      expect(sanitizeDuration('  90  ')).toBe(90);
    });

    it('handles non-digit characters in strings', () => {
      expect(sanitizeDuration('abc')).toBe(null);
      expect(sanitizeDuration('12abc34')).toBe(1234); // removes non-digits
    });

    it('returns null for negative values', () => {
      expect(sanitizeDuration('-5')).toBe(null);
      expect(sanitizeDuration(-10)).toBe(null);
    });

    it('clamps to min/max bounds for strings', () => {
      expect(sanitizeDuration('0', { min: 1, max: 480 })).toBe(null);
      expect(sanitizeDuration('500', { min: 1, max: 480 })).toBe(480);
      expect(sanitizeDuration('999', { min: 1, max: 480 })).toBe(480);
    });

    it('handles number inputs correctly', () => {
      expect(sanitizeDuration(60)).toBe(60);
      expect(sanitizeDuration(120.5)).toBe(120); // floors decimals
      expect(sanitizeDuration(500, { max: 480 })).toBe(480);
    });

    it('returns null for invalid number types', () => {
      expect(sanitizeDuration(NaN)).toBe(null);
      expect(sanitizeDuration(Infinity)).toBe(null);
      expect(sanitizeDuration(-Infinity)).toBe(null);
    });

    it('returns null for unknown types', () => {
      expect(sanitizeDuration({})).toBe(null);
      expect(sanitizeDuration([])).toBe(null);
      expect(sanitizeDuration(true)).toBe(null);
    });

    it('respects custom min/max options', () => {
      expect(sanitizeDuration(50, { min: 30, max: 120 })).toBe(50);
      expect(sanitizeDuration(25, { min: 30, max: 120 })).toBe(null);
      expect(sanitizeDuration(150, { min: 30, max: 120 })).toBe(120);
    });
  });

  describe('isValidDuration', () => {
    it('returns true for valid durations with default bounds', () => {
      expect(isValidDuration(1)).toBe(true);
      expect(isValidDuration(30)).toBe(true);
      expect(isValidDuration(60)).toBe(true);
      expect(isValidDuration(1440)).toBe(true);
    });

    it('returns false for invalid durations with default bounds', () => {
      expect(isValidDuration(0)).toBe(false);
      expect(isValidDuration(-1)).toBe(false);
      expect(isValidDuration(1441)).toBe(false);
      expect(isValidDuration(NaN)).toBe(false);
      expect(isValidDuration(Infinity)).toBe(false);
    });

    it('returns false for non-integers', () => {
      expect(isValidDuration(30.5)).toBe(false);
      expect(isValidDuration(120.1)).toBe(false);
    });

    it('returns false for non-number types', () => {
      expect(isValidDuration(null)).toBe(false);
      expect(isValidDuration(undefined)).toBe(false);
      expect(isValidDuration('60')).toBe(false);
      expect(isValidDuration({})).toBe(false);
    });

    it('respects custom min/max options', () => {
      expect(isValidDuration(50, { min: 30, max: 120 })).toBe(true);
      expect(isValidDuration(30, { min: 30, max: 120 })).toBe(true);
      expect(isValidDuration(120, { min: 30, max: 120 })).toBe(true);
      expect(isValidDuration(29, { min: 30, max: 120 })).toBe(false);
      expect(isValidDuration(121, { min: 30, max: 120 })).toBe(false);
    });
  });

  describe('isValidTimeFormat', () => {
    it('returns true for valid HH:mm format', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:30')).toBe(true);
      expect(isValidTimeFormat('12:00')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
    });

    it('returns false for invalid formats', () => {
      expect(isValidTimeFormat('9:30')).toBe(false);
      expect(isValidTimeFormat('24:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('12-30')).toBe(false);
      expect(isValidTimeFormat('invalid')).toBe(false);
    });
  });

  describe('timeToMinutes', () => {
    it('converts valid time strings to minutes', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('12:00')).toBe(720);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('returns null for invalid formats', () => {
      expect(timeToMinutes('invalid')).toBe(null);
      expect(timeToMinutes('25:00')).toBe(null);
      expect(timeToMinutes('12:60')).toBe(null);
    });
  });

  describe('isValidSlotTuple', () => {
    it('returns true for valid slot tuples', () => {
      expect(isValidSlotTuple(['09:00', '17:00'])).toBe(true);
      expect(isValidSlotTuple(['08:30', '12:00'])).toBe(true);
      expect(isValidSlotTuple(['00:00', '23:59'])).toBe(true);
    });

    it('returns false when end time is before or equal to start time', () => {
      expect(isValidSlotTuple(['17:00', '09:00'])).toBe(false);
      expect(isValidSlotTuple(['12:00', '12:00'])).toBe(false);
    });

    it('returns false for invalid time formats', () => {
      expect(isValidSlotTuple(['9:00', '17:00'])).toBe(false);
      expect(isValidSlotTuple(['09:00', '25:00'])).toBe(false);
      expect(isValidSlotTuple(['invalid', '17:00'])).toBe(false);
    });

    it('returns false for empty strings', () => {
      expect(isValidSlotTuple(['', '17:00'])).toBe(false);
      expect(isValidSlotTuple(['09:00', ''])).toBe(false);
      expect(isValidSlotTuple(['', ''])).toBe(false);
    });
  });

  describe('slotsOverlap', () => {
    it('detects overlapping slots', () => {
      expect(slotsOverlap(['09:00', '12:00'], ['11:00', '14:00'])).toBe(true);
      expect(slotsOverlap(['08:00', '12:00'], ['09:00', '11:00'])).toBe(true);
      expect(slotsOverlap(['09:00', '11:00'], ['08:00', '12:00'])).toBe(true);
    });

    it('detects non-overlapping slots', () => {
      expect(slotsOverlap(['09:00', '12:00'], ['12:00', '14:00'])).toBe(false);
      expect(slotsOverlap(['08:00', '10:00'], ['10:00', '12:00'])).toBe(false);
      expect(slotsOverlap(['08:00', '10:00'], ['14:00', '16:00'])).toBe(false);
    });

    it('returns false for invalid slots', () => {
      expect(slotsOverlap(['invalid', '12:00'], ['11:00', '14:00'])).toBe(false);
      expect(slotsOverlap(['09:00', '12:00'], ['invalid', '14:00'])).toBe(false);
    });
  });

  describe('validateDaySlots', () => {
    it('returns empty array for valid non-overlapping slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'],
        ['13:00', '17:00'],
        ['18:00', '22:00'],
      ];
      expect(validateDaySlots(slots)).toEqual([]);
    });

    it('returns errors for invalid slot tuples', () => {
      const slots: SlotTuple[] = [
        ['17:00', '09:00'], // end before start
        ['13:00', '17:00'],
      ];
      const errors = validateDaySlots(slots);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Slot 1');
    });

    it('returns errors for overlapping slots', () => {
      const slots: SlotTuple[] = [
        ['09:00', '12:00'],
        ['11:00', '14:00'], // overlaps with first
      ];
      const errors = validateDaySlots(slots);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('overlap');
    });

    it('returns empty array for empty slots', () => {
      expect(validateDaySlots([])).toEqual([]);
    });
  });

  describe('isValidReservationTimes', () => {
    it('returns ok=true for valid reservation times', () => {
      const times: ReservationTimes = {
        saturday: [['09:00', '17:00']],
        sunday: [['09:00', '12:00'], ['13:00', '17:00']],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };
      const result = isValidReservationTimes(times);
      expect(result.ok).toBe(true);
      expect(result.errors.saturday).toEqual([]);
      expect(result.errors.sunday).toEqual([]);
    });

    it('returns ok=false and errors for invalid slots', () => {
      const times: ReservationTimes = {
        saturday: [['17:00', '09:00']], // invalid
        sunday: [
          ['09:00', '12:00'],
          ['11:00', '14:00'], // overlaps
        ],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };
      const result = isValidReservationTimes(times);
      expect(result.ok).toBe(false);
      expect(result.errors.saturday.length).toBeGreaterThan(0);
      expect(result.errors.sunday.length).toBeGreaterThan(0);
    });

    it('returns ok=true for all empty days', () => {
      const times: ReservationTimes = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };
      const result = isValidReservationTimes(times);
      expect(result.ok).toBe(true);
    });
  });
});

