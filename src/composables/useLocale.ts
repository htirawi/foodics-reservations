import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SupportedLocale } from "@/types/locale";
import { useUIStore } from "@/stores/ui.store";
import { LOCALE_STORAGE_KEY } from "@/constants/storage";

export const useLocale = () => {
    const { locale, availableLocales } = useI18n();
    const uiStore = useUIStore();
    const currentLocale = computed<SupportedLocale>(() => locale.value as SupportedLocale);
    const isRTL = computed(() => currentLocale.value === "ar");
    
    const setLocale = (newLocale: SupportedLocale) => {
        locale.value = newLocale;
        const dir = newLocale === "ar" ? "rtl" : "ltr";
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", newLocale);
        try {
            localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        }
        catch {
            uiStore.notify('Failed to save language preference. It will reset on page reload.', 'warning');
        }
    };
    
    const restoreLocale = (): SupportedLocale => {
        try {
            const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
            if (stored === "en" || stored === "ar") {
                setLocale(stored);
                return stored;
            }
        }
        catch {
            uiStore.notify('Failed to load language preference. Using default language.', 'warning');
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
