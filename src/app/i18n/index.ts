import { createI18n } from "vue-i18n";

import ar  from "@app/i18n/locales/ar.json";
import en  from "@app/i18n/locales/en.json";

export const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
        ar,
        en,
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
