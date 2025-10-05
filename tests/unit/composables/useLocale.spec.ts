/**
 * useLocale Composable Unit Tests
 * Validates locale persistence, HTML dir/lang updates, and idempotent behavior
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { useLocale } from '@/composables/useLocale';

// Mock i18n instance
const mockI18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
    ar: {},
  },
});

// Mock useI18n
vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual('vue-i18n');
  return {
    ...actual,
    useI18n: () => ({
      locale: mockI18n.global.locale,
      availableLocales: mockI18n.global.availableLocales,
    }),
  };
});

describe('useLocale', () => {
  const STORAGE_KEY = 'foodics-locale';

  beforeEach(() => {
    // Reset state
    mockI18n.global.locale.value = 'en';
    localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setLocale', () => {
    it('updates i18n locale', () => {
      const { setLocale } = useLocale();
      
      setLocale('ar');
      
      expect(mockI18n.global.locale.value).toBe('ar');
    });

    it('updates HTML dir attribute to rtl for Arabic', () => {
      const { setLocale } = useLocale();
      
      setLocale('ar');
      
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('updates HTML dir attribute to ltr for English', () => {
      const { setLocale } = useLocale();
      
      setLocale('en');
      
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('updates HTML lang attribute', () => {
      const { setLocale } = useLocale();
      
      setLocale('ar');
      
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
    });

    it('persists locale to localStorage', () => {
      const { setLocale } = useLocale();
      
      setLocale('ar');
      
      expect(localStorage.getItem(STORAGE_KEY)).toBe('ar');
    });

    it('is idempotent when called multiple times with same locale', () => {
      const { setLocale } = useLocale();
      
      setLocale('ar');
      setLocale('ar');
      setLocale('ar');
      
      expect(mockI18n.global.locale.value).toBe('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('ar');
    });

    it('handles localStorage errors gracefully', () => {
      const { setLocale } = useLocale();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      setLocale('ar');
      
      // Should still update i18n and HTML attributes
      expect(mockI18n.global.locale.value).toBe('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to persist locale:',
        expect.any(Error)
      );
      
      // Restore original
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('restoreLocale', () => {
    it('restores locale from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'ar');
      
      const { restoreLocale } = useLocale();
      const result = restoreLocale();
      
      expect(result).toBe('ar');
      expect(mockI18n.global.locale.value).toBe('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
    });

    it('defaults to en when no locale is stored', () => {
      const { restoreLocale } = useLocale();
      const result = restoreLocale();
      
      expect(result).toBe('en');
      expect(mockI18n.global.locale.value).toBe('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('defaults to en when invalid locale is stored', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid');
      
      const { restoreLocale } = useLocale();
      const result = restoreLocale();
      
      expect(result).toBe('en');
      expect(mockI18n.global.locale.value).toBe('en');
    });

    it('handles localStorage read errors gracefully', () => {
      const { restoreLocale } = useLocale();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.getItem to throw
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('SecurityError');
      });
      
      const result = restoreLocale();
      
      expect(result).toBe('en');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to restore locale:',
        expect.any(Error)
      );
      
      // Restore original
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });

    it('accepts valid locales only', () => {
      const { restoreLocale } = useLocale();
      
      localStorage.setItem(STORAGE_KEY, 'fr');
      const result = restoreLocale();
      
      expect(result).toBe('en');
      expect(mockI18n.global.locale.value).toBe('en');
    });
  });

  describe('toggleLocale', () => {
    it('toggles from en to ar', () => {
      const { toggleLocale } = useLocale();
      
      toggleLocale();
      
      expect(mockI18n.global.locale.value).toBe('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('ar');
    });

    it('toggles from ar to en', () => {
      const { setLocale, toggleLocale } = useLocale();
      
      setLocale('ar');
      toggleLocale();
      
      expect(mockI18n.global.locale.value).toBe('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
    });

    it('toggles back and forth multiple times', () => {
      const { toggleLocale } = useLocale();
      
      toggleLocale(); // en -> ar
      expect(mockI18n.global.locale.value).toBe('ar');
      
      toggleLocale(); // ar -> en
      expect(mockI18n.global.locale.value).toBe('en');
      
      toggleLocale(); // en -> ar
      expect(mockI18n.global.locale.value).toBe('ar');
    });
  });

  describe('computed properties', () => {
    it('currentLocale reflects i18n locale', () => {
      const { currentLocale, setLocale } = useLocale();
      
      expect(currentLocale.value).toBe('en');
      
      setLocale('ar');
      expect(currentLocale.value).toBe('ar');
    });

    it('isRTL is true for Arabic', () => {
      const { isRTL, setLocale } = useLocale();
      
      setLocale('ar');
      expect(isRTL.value).toBe(true);
    });

    it('isRTL is false for English', () => {
      const { isRTL, setLocale } = useLocale();
      
      setLocale('en');
      expect(isRTL.value).toBe(false);
    });
  });
});
