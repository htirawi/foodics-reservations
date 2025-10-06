import { describe, it, expect } from 'vitest';
import {
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
  describe('isValidDuration', () => {
    it('returns true for valid durations', () => {
      expect(isValidDuration(1)).toBe(true);
      expect(isValidDuration(30)).toBe(true);
      expect(isValidDuration(60)).toBe(true);
      expect(isValidDuration(1440)).toBe(true);
    });

    it('returns false for invalid durations', () => {
      expect(isValidDuration(0)).toBe(false);
      expect(isValidDuration(-1)).toBe(false);
      expect(isValidDuration(1441)).toBe(false);
      expect(isValidDuration(NaN)).toBe(false);
      expect(isValidDuration(Infinity)).toBe(false);
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

