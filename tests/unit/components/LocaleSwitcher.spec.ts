/**
 * @file LocaleSwitcher.spec.ts
 * @summary Module: tests/unit/components/LocaleSwitcher.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { mount } from "@vue/test-utils";

import { describe, it, expect, beforeEach } from "vitest";
import { createI18n } from "vue-i18n";

import LocaleSwitcher from "@/components/ui/LocaleSwitcher.vue";

const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            app: {
                switchToArabic: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
                switchToEnglish: "English",
            },
        },
        ar: {
            app: {
                switchToArabic: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
                switchToEnglish: "English",
            },
        },
    },
});
describe("LocaleSwitcher", () => {
    const STORAGE_KEY = "foodics-locale";
    beforeEach(() => {
        i18n.global.locale.value = "en";
        document.documentElement.removeAttribute("dir");
        document.documentElement.removeAttribute("lang");
        localStorage.clear();
    });
    it("renders with English locale by default", () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.text()).toBe("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
    });
    it("has data-testid attribute", () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"locale-switcher\"]").exists()).toBe(true);
    });
    it("toggles locale on click", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        expect(i18n.global.locale.value).toBe("en");
        await wrapper.find("button").trigger("click");
        expect(i18n.global.locale.value).toBe("ar");
    });
    it("updates dir attribute when locale changes", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.find("button").trigger("click");
        expect(document.documentElement.getAttribute("dir")).toBe("rtl");
        expect(document.documentElement.getAttribute("lang")).toBe("ar");
    });
    it("toggles back to English", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.find("button").trigger("click");
        expect(i18n.global.locale.value).toBe("ar");
        await wrapper.find("button").trigger("click");
        expect(i18n.global.locale.value).toBe("en");
        expect(document.documentElement.getAttribute("dir")).toBe("ltr");
        expect(document.documentElement.getAttribute("lang")).toBe("en");
    });
    it("displays correct label based on current locale", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.text()).toBe("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
        await wrapper.find("button").trigger("click");
        expect(wrapper.text()).toBe("English");
    });
    it("has proper aria-label", () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("button").attributes("aria-label")).toBe("\u0627\u0644\u0639\u0631\u0628\u064A\u0629");
    });
    it("persists locale to localStorage on toggle", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.find("button").trigger("click");
        expect(localStorage.getItem(STORAGE_KEY)).toBe("ar");
    });
    it("persists locale back to en when toggling again", async () => {
        const wrapper = mount(LocaleSwitcher, {
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.find("button").trigger("click");
        expect(localStorage.getItem(STORAGE_KEY)).toBe("ar");
        await wrapper.find("button").trigger("click");
        expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    });
});
