import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type SupportedLocale = 'en' | 'ar';

export const useLocale = () => {
  const { locale, availableLocales } = useI18n();

  const currentLocale = computed<SupportedLocale>(
    () => locale.value as SupportedLocale
  );

  const isRTL = computed(() => currentLocale.value === 'ar');

  const setLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale;
    document.documentElement.setAttribute(
      'dir',
      newLocale === 'ar' ? 'rtl' : 'ltr'
    );
    document.documentElement.setAttribute('lang', newLocale);
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
    toggleLocale,
  };
};
