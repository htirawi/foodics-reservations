/**
 * @file DisableAllButton.spec.ts
 * @summary Module: tests/unit/features/branches/DisableAllButton.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { ref } from "vue";
import DisableAllButton from "@/features/branches/components/DisableAllButton.vue";
import { createI18n } from "vue-i18n";
import * as useDisableAllModule from "@/features/branches/composables/useDisableAll";
const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            reservations: {
                disableAll: "Disable Reservations",
            },
        },
    },
});
vi.mock("@/features/branches/composables/useDisableAll");
describe("DisableAllButton", () => {
    const mockDisableAll = vi.fn();
    const mockBusy = ref(false);
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(useDisableAllModule, "useDisableAll").mockReturnValue({
            busy: mockBusy,
            disableAll: mockDisableAll,
        });
    });
    it("renders button with correct text", () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        expect(wrapper.text()).toBe("Disable Reservations");
    });
    it("has correct test id", () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        expect(wrapper.find("[data-test-id=\"disable-all\"]").exists()).toBe(true);
    });
    it("is not disabled by default", () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        const button = wrapper.find("button");
        expect(button.attributes("disabled")).toBeUndefined();
    });
    it("can be disabled via prop", () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
            props: { disabled: true },
        });
        const button = wrapper.find("button");
        expect(button.attributes("disabled")).toBeDefined();
    });
    it("calls disableAll composable when clicked", async () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        await wrapper.find("button").trigger("click");
        expect(mockDisableAll).toHaveBeenCalledOnce();
    });
    it("is disabled when busy", () => {
        mockBusy.value = true;
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        const button = wrapper.find("button");
        expect(button.attributes("disabled")).toBeDefined();
    });
    it("is disabled when both prop disabled and busy", () => {
        mockBusy.value = true;
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
            props: { disabled: true },
        });
        const button = wrapper.find("button");
        expect(button.attributes("disabled")).toBeDefined();
    });
    it("uses correct button variant", () => {
        const wrapper = mount(DisableAllButton, {
            global: { plugins: [i18n, createPinia()] },
        });
        const button = wrapper.find("button");
        expect(button.classes()).toContain("bg-danger-600");
    });
});
