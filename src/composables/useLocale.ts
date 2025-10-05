import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type SupportedLocale = 'en' | 'ar';

const LOCALE_STORAGE_KEY = 'foodics-locale';

/**
 * Locale composable
 * Manages i18n locale with persistence and <html dir/lang> attributes
 */
export const useLocale = () => {
  const { locale, availableLocales } = useI18n();

  const currentLocale = computed<SupportedLocale>(
    () => locale.value as SupportedLocale
  );

  const isRTL = computed(() => currentLocale.value === 'ar');

  /**
   * Set locale and persist
   * Updates i18n, localStorage, and <html dir/lang> attributes
   */
  const setLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale;
    
    // Update HTML attributes
    const dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', newLocale);
    
    // Persist to localStorage
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      // Silent fail for storage errors (e.g., private browsing)
      console.warn('Failed to persist locale:', error);
    }
  };

  /**
   * Restore locale from localStorage
   * Falls back to 'en' if not found or invalid
   */
  const restoreLocale = (): SupportedLocale => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') {
        setLocale(stored);
        return stored;
      }
    } catch (error) {
      // Silent fail for storage errors
      console.warn('Failed to restore locale:', error);
    }
    
    // Default to 'en'
    setLocale('en');
    return 'en';
  };

  const toggleLocale = () => {
    const newLocale = currentLocale.value === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
  };

  return {
    currentLocale,
    isRTL,
    availableLocales,
    setLocale,
    restoreLocale,
    toggleLocale,
  };
};
