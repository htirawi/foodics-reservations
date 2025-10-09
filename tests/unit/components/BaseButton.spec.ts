/**
 * @file BaseButton.spec.ts
 * @summary Module: tests/unit/components/BaseButton.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { mount } from "@vue/test-utils";

import { describe, it, expect } from "vitest";

import BaseButton from "@/components/ui/BaseButton.vue";

describe("BaseButton", () => {
    it("renders with primary variant by default", () => {
        const wrapper = mount(BaseButton, {
            slots: {
                default: "Click me",
            },
        });
        expect(wrapper.text()).toBe("Click me");
        expect(wrapper.classes()).toContain("bg-primary-600");
    });
    it("renders ghost variant", () => {
        const wrapper = mount(BaseButton, {
            props: {
                variant: "ghost",
            },
            slots: {
                default: "Cancel",
            },
        });
        expect(wrapper.classes()).toContain("border-neutral-300");
        expect(wrapper.classes()).toContain("bg-white");
    });
    it("renders danger variant", () => {
        const wrapper = mount(BaseButton, {
            props: {
                variant: "danger",
            },
            slots: {
                default: "Delete",
            },
        });
        expect(wrapper.classes()).toContain("bg-danger-600");
    });
    it("applies size classes", () => {
        const small = mount(BaseButton, {
            props: { size: "sm" },
            slots: { default: "Small" },
        });
        const large = mount(BaseButton, {
            props: { size: "lg" },
            slots: { default: "Large" },
        });
        expect(small.classes()).toContain("px-3");
        expect(large.classes()).toContain("px-8");
    });
    it("emits click event", async () => {
        const wrapper = mount(BaseButton);
        await wrapper.trigger("click");
        expect(wrapper.emitted()).toHaveProperty("click");
    });
    it("disables button when disabled prop is true", () => {
        const wrapper = mount(BaseButton, {
            props: { disabled: true },
        });
        expect(wrapper.attributes("disabled")).toBeDefined();
        expect(wrapper.classes()).toContain("disabled:opacity-50");
    });
    it("applies data-testid", () => {
        const wrapper = mount(BaseButton, {
            props: { dataTestid: "test-button" },
        });
        expect(wrapper.attributes("data-testid")).toBe("test-button");
    });
});
