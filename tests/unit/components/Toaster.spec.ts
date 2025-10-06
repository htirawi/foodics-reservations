/**
 * @file Toaster.spec.ts
 * @summary Module: tests/unit/components/Toaster.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import Toaster from "@/layouts/Toaster.vue";
import { useUIStore } from "@/stores/ui.store";
const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            app: {
                close: "Close",
            },
        },
    },
});
describe("Toaster", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });
    it("does not render when no toasts", () => {
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"toaster\"]").exists()).toBe(false);
    });
    it("renders toaster with data-testid when toasts exist", () => {
        const store = useUIStore();
        store.notify("Test message");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"toaster\"]").exists()).toBe(true);
    });
    it("has aria-live=\"polite\" attribute", () => {
        const store = useUIStore();
        store.notify("Test message");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toaster = wrapper.find("[data-testid=\"toaster\"]");
        expect(toaster.attributes("aria-live")).toBe("polite");
    });
    it("has role=\"status\" attribute", () => {
        const store = useUIStore();
        store.notify("Test message");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toaster = wrapper.find("[data-testid=\"toaster\"]");
        expect(toaster.attributes("role")).toBe("status");
    });
    it("displays success toast with correct styling", () => {
        const store = useUIStore();
        store.notify("Success message", "success");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toast = wrapper.find("[data-testid=\"toast-success\"]");
        expect(toast.exists()).toBe(true);
        expect(toast.text()).toContain("Success message");
    });
    it("displays error toast with correct styling", () => {
        const store = useUIStore();
        store.notify("Error message", "error");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toast = wrapper.find("[data-testid=\"toast-error\"]");
        expect(toast.exists()).toBe(true);
        expect(toast.text()).toContain("Error message");
    });
    it("displays warning toast with correct styling", () => {
        const store = useUIStore();
        store.notify("Warning message", "warning");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toast = wrapper.find("[data-testid=\"toast-warning\"]");
        expect(toast.exists()).toBe(true);
        expect(toast.text()).toContain("Warning message");
    });
    it("displays info toast with correct styling", () => {
        const store = useUIStore();
        store.notify("Info message", "info");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        const toast = wrapper.find("[data-testid=\"toast-info\"]");
        expect(toast.exists()).toBe(true);
        expect(toast.text()).toContain("Info message");
    });
    it("displays multiple toasts", () => {
        const store = useUIStore();
        store.notify("First message", "success");
        store.notify("Second message", "error");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"toast-success\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"toast-error\"]").exists()).toBe(true);
    });
    it("removes toast when close button clicked", async () => {
        const store = useUIStore();
        store.notify("Test message", "info");
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"toast-info\"]").exists()).toBe(true);
        await wrapper.find("button[aria-label=\"Close\"]").trigger("click");
        expect(wrapper.find("[data-testid=\"toast-info\"]").exists()).toBe(false);
    });
    it("auto-removes toast after duration", async () => {
        const store = useUIStore();
        store.notify("Test message", "info", 1000);
        const wrapper = mount(Toaster, {
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"toast-info\"]").exists()).toBe(true);
        vi.advanceTimersByTime(1001);
        await wrapper.vm.$nextTick();
        expect(wrapper.find("[data-testid=\"toast-info\"]").exists()).toBe(false);
    });
});
