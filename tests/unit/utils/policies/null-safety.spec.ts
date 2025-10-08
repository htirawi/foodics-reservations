/**
 * @file null-safety.spec.ts
 * @summary Unit tests for null safety policies (25+ test cases)
 */
import { describe, it, expect } from 'vitest';
import {
  safeString,
  safeArray,
  isNullish,
  isEmpty,
  safeNumber,
  safeGet
} from '@/utils/policies/null-safety';

describe('Null Safety Policies', () => {
  describe('safeString', () => {
    it('should return empty string for null', () => {
      expect(safeString(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(safeString(undefined)).toBe('');
    });

    it('should return string unchanged', () => {
      expect(safeString('hello')).toBe('hello');
    });

    it('should return empty string for empty string', () => {
      expect(safeString('')).toBe('');
    });

    it('should convert number to string', () => {
      expect(safeString(42)).toBe('42');
    });

    it('should convert boolean to string', () => {
      expect(safeString(true)).toBe('true');
    });

    it('should convert object to string', () => {
      expect(safeString({})).toBe('[object Object]');
    });
  });

  describe('safeArray', () => {
    it('should return empty array for null', () => {
      expect(safeArray(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(safeArray(undefined)).toEqual([]);
    });

    it('should return array unchanged', () => {
      const arr = [1, 2, 3];
      expect(safeArray(arr)).toBe(arr);
    });

    it('should return empty array for empty array', () => {
      expect(safeArray([])).toEqual([]);
    });

    it('should return empty array for non-array', () => {
      expect(safeArray('not array')).toEqual([]);
    });

    it('should return empty array for number', () => {
      expect(safeArray(42)).toEqual([]);
    });

    it('should preserve array type', () => {
      const slots: string[][] = [['09:00', '12:00']];
      expect(safeArray(slots)).toBe(slots);
    });
  });

  describe('isNullish', () => {
    it('should return true for null', () => {
      expect(isNullish(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isNullish(undefined)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNullish('')).toBe(false);
    });

    it('should return false for 0', () => {
      expect(isNullish(0)).toBe(false);
    });

    it('should return false for false', () => {
      expect(isNullish(false)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(isNullish([])).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isNullish({})).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return true for single space', () => {
      expect(isEmpty(' ')).toBe(true);
    });

    it('should return true for tab', () => {
      expect(isEmpty('\t')).toBe(true);
    });

    it('should return true for newline', () => {
      expect(isEmpty('\n')).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('should return false for string with leading/trailing spaces', () => {
      expect(isEmpty('  hello  ')).toBe(false);
    });
  });

  describe('safeNumber', () => {
    it('should return number unchanged', () => {
      expect(safeNumber(42)).toBe(42);
    });

    it('should return fallback for null', () => {
      expect(safeNumber(null)).toBe(0);
    });

    it('should return fallback for undefined', () => {
      expect(safeNumber(undefined)).toBe(0);
    });

    it('should return fallback for NaN', () => {
      expect(safeNumber(NaN)).toBe(0);
    });

    it('should return fallback for Infinity', () => {
      expect(safeNumber(Infinity)).toBe(0);
    });

    it('should return fallback for -Infinity', () => {
      expect(safeNumber(-Infinity)).toBe(0);
    });

    it('should parse valid number string', () => {
      expect(safeNumber('42')).toBe(42);
    });

    it('should parse float string', () => {
      expect(safeNumber('15.7')).toBe(15.7);
    });

    it('should return fallback for invalid string', () => {
      expect(safeNumber('abc')).toBe(0);
    });

    it('should return fallback for empty string', () => {
      expect(safeNumber('')).toBe(0);
    });

    it('should respect custom fallback', () => {
      expect(safeNumber(null, 99)).toBe(99);
    });

    it('should return custom fallback for NaN', () => {
      expect(safeNumber(NaN, -1)).toBe(-1);
    });
  });

  describe('safeGet', () => {
    it('should return property value', () => {
      const obj = { foo: 'bar' };
      expect(safeGet(obj, 'foo')).toBe('bar');
    });

    it('should return null for missing property', () => {
      const obj = { foo: 'bar' };
      expect(safeGet(obj, 'missing')).toBeNull();
    });

    it('should return null for null object', () => {
      expect(safeGet(null, 'foo')).toBeNull();
    });

    it('should return null for undefined object', () => {
      expect(safeGet(undefined, 'foo')).toBeNull();
    });

    it('should return null for non-object', () => {
      expect(safeGet('string', 'foo')).toBeNull();
    });

    it('should return null for number', () => {
      expect(safeGet(42, 'foo')).toBeNull();
    });

    it('should handle undefined property value as null', () => {
      const obj = { foo: undefined };
      expect(safeGet(obj, 'foo')).toBeNull();
    });

    it('should preserve null property value', () => {
      const obj = { foo: null };
      expect(safeGet(obj, 'foo')).toBeNull();
    });

    it('should preserve 0 property value', () => {
      const obj = { foo: 0 };
      expect(safeGet(obj, 'foo')).toBe(0);
    });

    it('should preserve false property value', () => {
      const obj = { foo: false };
      expect(safeGet(obj, 'foo')).toBe(false);
    });

    it('should preserve empty string property value', () => {
      const obj = { foo: '' };
      expect(safeGet(obj, 'foo')).toBe('');
    });
  });
});
