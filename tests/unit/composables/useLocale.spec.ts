/**
 * @file useLocale.spec.ts
 * @summary Module: tests/unit/composables/useLocale.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createI18n } from "vue-i18n";
import { useLocale } from "@/composables/useLocale";
import { useUIStore } from "@/stores/ui.store";

vi.mock("@/stores/ui.store", () => ({
    useUIStore: vi.fn(),
}));
const mockI18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {},
        ar: {},
    },
});
vi.mock("vue-i18n", async () => {
    const actual = await vi.importActual("vue-i18n");
    return {
        ...actual,
        useI18n: () => ({
            locale: mockI18n.global.locale,
            availableLocales: mockI18n.global.availableLocales,
        }),
    };
});
describe("useLocale", () => {
    const STORAGE_KEY = "foodics-locale";
    beforeEach(() => {
        mockI18n.global.locale.value = "en";
        localStorage.clear();
        document.documentElement.removeAttribute("dir");
        document.documentElement.removeAttribute("lang");
        vi.clearAllMocks();
        
        // Default mock for useUIStore
        vi.mocked(useUIStore).mockReturnValue({
            notify: vi.fn(() => "toast-id"),
        } as unknown as ReturnType<typeof useUIStore>);
    });
    afterEach(() => {
        localStorage.clear();
    });
    describe("setLocale", () => {
        it("updates i18n locale", () => {
            const { setLocale } = useLocale();
            setLocale("ar");
            expect(mockI18n.global.locale.value).toBe("ar");
        });
        it("updates HTML dir attribute to rtl for Arabic", () => {
            const { setLocale } = useLocale();
            setLocale("ar");
            expect(document.documentElement.getAttribute("dir")).toBe("rtl");
        });
        it("updates HTML dir attribute to ltr for English", () => {
            const { setLocale } = useLocale();
            setLocale("en");
            expect(document.documentElement.getAttribute("dir")).toBe("ltr");
        });
        it("updates HTML lang attribute", () => {
            const { setLocale } = useLocale();
            setLocale("ar");
            expect(document.documentElement.getAttribute("lang")).toBe("ar");
        });
        it("persists locale to localStorage", () => {
            const { setLocale } = useLocale();
            setLocale("ar");
            expect(localStorage.getItem(STORAGE_KEY)).toBe("ar");
        });
        it("is idempotent when called multiple times with same locale", () => {
            const { setLocale } = useLocale();
            setLocale("ar");
            setLocale("ar");
            setLocale("ar");
            expect(mockI18n.global.locale.value).toBe("ar");
            expect(document.documentElement.getAttribute("dir")).toBe("rtl");
            expect(document.documentElement.getAttribute("lang")).toBe("ar");
            expect(localStorage.getItem(STORAGE_KEY)).toBe("ar");
        });
        it("handles localStorage errors gracefully", () => {
            const mockNotify = vi.fn();
            vi.mocked(useUIStore).mockReturnValue({
                notify: mockNotify,
            } as unknown as ReturnType<typeof useUIStore>);
            
            const { setLocale } = useLocale();
            
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = vi.fn(() => {
                throw new Error("QuotaExceededError");
            });
            
            setLocale("ar");
            
            expect(mockI18n.global.locale.value).toBe("ar");
            expect(document.documentElement.getAttribute("dir")).toBe("rtl");
            expect(mockNotify).toHaveBeenCalledWith(
                'Failed to save language preference. It will reset on page reload.',
                'warning'
            );
            
            Storage.prototype.setItem = originalSetItem;
        });
    });
    describe("restoreLocale", () => {
        it("restores locale from localStorage", () => {
            localStorage.setItem(STORAGE_KEY, "ar");
            const { restoreLocale } = useLocale();
            const result = restoreLocale();
            expect(result).toBe("ar");
            expect(mockI18n.global.locale.value).toBe("ar");
            expect(document.documentElement.getAttribute("dir")).toBe("rtl");
            expect(document.documentElement.getAttribute("lang")).toBe("ar");
        });
        it("defaults to en when no locale is stored", () => {
            const { restoreLocale } = useLocale();
            const result = restoreLocale();
            expect(result).toBe("en");
            expect(mockI18n.global.locale.value).toBe("en");
            expect(document.documentElement.getAttribute("dir")).toBe("ltr");
            expect(document.documentElement.getAttribute("lang")).toBe("en");
        });
        it("defaults to en when invalid locale is stored", () => {
            localStorage.setItem(STORAGE_KEY, "invalid");
            const { restoreLocale } = useLocale();
            const result = restoreLocale();
            expect(result).toBe("en");
            expect(mockI18n.global.locale.value).toBe("en");
        });
        it("handles localStorage read errors gracefully", () => {
            const mockNotify = vi.fn();
            vi.mocked(useUIStore).mockReturnValue({
                notify: mockNotify,
            } as unknown as ReturnType<typeof useUIStore>);
            
            const { restoreLocale } = useLocale();
            
            const originalGetItem = Storage.prototype.getItem;
            Storage.prototype.getItem = vi.fn(() => {
                throw new Error("SecurityError");
            });
            
            const result = restoreLocale();
            
            expect(result).toBe("en");
            expect(mockNotify).toHaveBeenCalledWith(
                'Failed to load language preference. Using default language.',
                'warning'
            );
            
            Storage.prototype.getItem = originalGetItem;
        });
        it("accepts valid locales only", () => {
            const { restoreLocale } = useLocale();
            localStorage.setItem(STORAGE_KEY, "fr");
            const result = restoreLocale();
            expect(result).toBe("en");
            expect(mockI18n.global.locale.value).toBe("en");
        });
    });
    describe("toggleLocale", () => {
        it("toggles from en to ar", () => {
            const { toggleLocale } = useLocale();
            toggleLocale();
            expect(mockI18n.global.locale.value).toBe("ar");
            expect(document.documentElement.getAttribute("dir")).toBe("rtl");
            expect(localStorage.getItem(STORAGE_KEY)).toBe("ar");
        });
        it("toggles from ar to en", () => {
            const { setLocale, toggleLocale } = useLocale();
            setLocale("ar");
            toggleLocale();
            expect(mockI18n.global.locale.value).toBe("en");
            expect(document.documentElement.getAttribute("dir")).toBe("ltr");
            expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
        });
        it("toggles back and forth multiple times", () => {
            const { toggleLocale } = useLocale();
            toggleLocale();
            expect(mockI18n.global.locale.value).toBe("ar");
            toggleLocale();
            expect(mockI18n.global.locale.value).toBe("en");
            toggleLocale();
            expect(mockI18n.global.locale.value).toBe("ar");
        });
    });
    describe("computed properties", () => {
        it("currentLocale reflects i18n locale", () => {
            const { currentLocale, setLocale } = useLocale();
            expect(currentLocale.value).toBe("en");
            setLocale("ar");
            expect(currentLocale.value).toBe("ar");
        });
        it("isRTL is true for Arabic", () => {
            const { isRTL, setLocale } = useLocale();
            setLocale("ar");
            expect(isRTL.value).toBe(true);
        });
        it("isRTL is false for English", () => {
            const { isRTL, setLocale } = useLocale();
            setLocale("en");
            expect(isRTL.value).toBe(false);
        });
    });
});
