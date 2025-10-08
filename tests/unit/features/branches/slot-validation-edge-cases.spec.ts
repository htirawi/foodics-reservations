/**
 * @file slot-validation-edge-cases.spec.ts
 * @summary Edge case tests for slot validation  
 * @description
 *   Tests complex scenarios that were previously uncovered:
 *   - Multiple overlapping slots
 *   - Adjacent time boundaries
 *   - Format validation edge cases
 */

import { describe, it, expect } from 'vitest'
import {
  isValidSlotTuple,
  slotsOverlap,
} from '@/features/branches/utils/reservation.validation'
import { validateDaySlots } from '@/features/branches/utils/slot.validation'
import type { SlotTuple } from '@/types/foodics'

describe('Slot Validation - Complex Edge Cases', () => {
  describe('Multiple overlapping slots', () => {
    it('should detect when 3 slots overlap in chain', () => {
      const slots: SlotTuple[] = [
        ['10:00', '12:00'],
        ['11:00', '13:00'],
        ['12:30', '14:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect when all slots overlap at single point', () => {
      const slots: SlotTuple[] = [
        ['10:00', '12:00'],
        ['11:00', '13:00'],
        ['11:30', '12:30'],
        ['11:45', '12:15'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should allow non-overlapping slots with gaps', () => {
      const slots: SlotTuple[] = [
        ['08:00', '10:00'],
        ['10:30', '12:00'],
        ['13:00', '15:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect partial overlap in middle of list', () => {
      const slots: SlotTuple[] = [
        ['08:00', '09:00'], // OK
        ['10:00', '11:00'], // OK
        ['10:30', '11:30'], // Overlaps with previous
        ['12:00', '13:00'], // OK
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
    })
  })

  describe('Boundary conditions', () => {
    it('should allow adjacent slots (no gap)', () => {
      const slots: SlotTuple[] = [
        ['12:00', '14:00'],
        ['14:00', '16:00'],
        ['16:00', '18:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should allow single-minute slot', () => {
      const slots: SlotTuple[] = [['12:00', '12:01']]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should reject slot ending at start (zero duration)', () => {
      const slots: SlotTuple[] = [['12:00', '12:00']]

      const result = isValidSlotTuple(slots[0]!)
      expect(result).toBe(false)
    })

    it('should handle midnight boundary', () => {
      const slots: SlotTuple[] = [
        ['22:00', '23:59'],
        ['00:00', '02:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should handle slot ending at 23:59', () => {
      const slots: SlotTuple[] = [['20:00', '23:59']]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })
  })

  describe('Overlap detection precision', () => {
    it('should detect 1-minute overlap', () => {
      const slot1: SlotTuple = ['12:00', '13:01']
      const slot2: SlotTuple = ['13:00', '14:00']

      expect(slotsOverlap(slot1, slot2)).toBe(true)
    })

    it('should detect overlap when second slot contains first', () => {
      const slot1: SlotTuple = ['12:00', '13:00']
      const slot2: SlotTuple = ['11:00', '14:00']

      expect(slotsOverlap(slot1, slot2)).toBe(true)
    })

    it('should detect overlap when first slot contains second', () => {
      const slot1: SlotTuple = ['11:00', '14:00']
      const slot2: SlotTuple = ['12:00', '13:00']

      expect(slotsOverlap(slot1, slot2)).toBe(true)
    })

    it('should detect overlap when slots are identical', () => {
      const slot1: SlotTuple = ['12:00', '13:00']
      const slot2: SlotTuple = ['12:00', '13:00']

      expect(slotsOverlap(slot1, slot2)).toBe(true)
    })

    it('should not detect overlap for touching boundaries', () => {
      const slot1: SlotTuple = ['12:00', '13:00']
      const slot2: SlotTuple = ['13:00', '14:00']

      expect(slotsOverlap(slot1, slot2)).toBe(false)
    })

    it('should not detect overlap for slots with 1-minute gap', () => {
      const slot1: SlotTuple = ['12:00', '13:00']
      const slot2: SlotTuple = ['13:01', '14:00']

      expect(slotsOverlap(slot1, slot2)).toBe(false)
    })
  })

  describe('Format validation edge cases', () => {
    it('should reject hour > 23', () => {
      const slot: SlotTuple = ['25:00', '26:00'] as SlotTuple
      expect(isValidSlotTuple(slot)).toBe(false)
    })

    it('should reject minute > 59', () => {
      const slot: SlotTuple = ['12:60', '13:00'] as SlotTuple
      expect(isValidSlotTuple(slot)).toBe(false)
    })

    it('should reject negative hours', () => {
      const slot: SlotTuple = ['-01:00', '12:00'] as SlotTuple
      expect(isValidSlotTuple(slot)).toBe(false)
    })

    it('should reject single-digit hours without leading zero', () => {
      const slot: SlotTuple = ['9:00', '12:00'] as SlotTuple
      expect(isValidSlotTuple(slot)).toBe(false)
    })

    it('should reject single-digit minutes without leading zero', () => {
      const slot: SlotTuple = ['12:5', '13:00'] as SlotTuple
      expect(isValidSlotTuple(slot)).toBe(false)
    })

    it('should accept valid edge times', () => {
      const slots: SlotTuple[] = [
        ['00:00', '00:01'],
        ['23:58', '23:59'],
      ]

      slots.forEach((slot) => {
        expect(isValidSlotTuple(slot)).toBe(true)
      })
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle lunch and dinner service split', () => {
      const slots: SlotTuple[] = [
        ['11:30', '14:30'], // Lunch
        ['17:00', '22:00'], // Dinner
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should handle all-day service', () => {
      const slots: SlotTuple[] = [['09:00', '23:00']]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should detect accidental duplicate entry', () => {
      const slots: SlotTuple[] = [
        ['12:00', '14:00'],
        ['12:00', '14:00'], // Duplicate
        ['15:00', '17:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
    })

    it('should handle breakfast, lunch, dinner slots', () => {
      const slots: SlotTuple[] = [
        ['07:00', '10:00'], // Breakfast
        ['12:00', '15:00'], // Lunch
        ['18:00', '22:00'], // Dinner
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should detect off-by-one overlap in manual entry', () => {
      const slots: SlotTuple[] = [
        ['12:00', '14:00'],
        ['13:59', '16:00'], // Overlaps by 1 minute
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
    })
  })

  describe('Empty and edge cases', () => {
    it('should allow empty slot array', () => {
      const slots: SlotTuple[] = []
      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
    })

    it('should handle max slots (3)', () => {
      const slots: SlotTuple[] = [
        ['00:00', '02:00'],
        ['03:00', '05:00'],
        ['06:00', '08:00'],
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(true)
      expect(slots.length).toBe(3)
    })

    it('should reject more than 3 slots', () => {
      const slots: SlotTuple[] = [
        ['00:00', '01:00'],
        ['02:00', '03:00'],
        ['04:00', '05:00'],
        ['06:00', '07:00'], // 4th slot (exceeds max of 3)
      ]

      const result = validateDaySlots(slots)
      expect(result.ok).toBe(false)
      expect(result.errors).toContain('settings.slots.errors.max')
    })
  })
})
