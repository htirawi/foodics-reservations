/**
 * @file index.ts
 * @summary Module: src/i18n/index.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
export const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
        en,
        ar,
    },
    numberFormats: {
        en: {
            decimal: {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
            currency: {
                style: "currency",
                currency: "USD",
                notation: "standard",
            },
        },
        ar: {
            decimal: {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
            currency: {
                style: "currency",
                currency: "SAR",
                notation: "standard",
            },
        },
    },
    datetimeFormats: {
        en: {
            short: {
                year: "numeric",
                month: "short",
                day: "numeric",
            },
            long: {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            },
            time: {
                hour: "numeric",
                minute: "numeric",
            },
        },
        ar: {
            short: {
                year: "numeric",
                month: "short",
                day: "numeric",
            },
            long: {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            },
            time: {
                hour: "numeric",
                minute: "numeric",
            },
        },
    },
});
