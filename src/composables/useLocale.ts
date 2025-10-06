/**
 * @file useLocale.ts
 * @summary Module: src/composables/useLocale.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";

export type SupportedLocale = "en" | "ar";
const LOCALE_STORAGE_KEY = "foodics-locale";

const persistLocale = (locale: SupportedLocale, showToast: ReturnType<typeof useToast>['show']): void => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    if (import.meta.env.DEV) {
      showToast("Failed to save language preference. Settings may not persist between sessions.", "warning");
    }
  }
};

const restoreStoredLocale = (showToast: ReturnType<typeof useToast>['show']): SupportedLocale | null => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "ar") {
      return stored;
    }
  } catch {
    if (import.meta.env.DEV) {
      showToast("Failed to restore language preference. Using default language.", "warning");
    }
  }
  return null;
};
export const useLocale = () => {
  const { locale, availableLocales } = useI18n();
  const { show } = useToast();
  const currentLocale = computed<SupportedLocale>(() => locale.value as SupportedLocale);
  const isRTL = computed(() => currentLocale.value === "ar");

  const setLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale;
    const dir = newLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", newLocale);
    persistLocale(newLocale, show);
  };

  const restoreLocale = (): SupportedLocale => {
    const stored = restoreStoredLocale(show);
    if (stored) {
      setLocale(stored);
      return stored;
    }
    setLocale("en");
    return "en";
  };

  const toggleLocale = () => {
    const newLocale = currentLocale.value === "en" ? "ar" : "en";
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
