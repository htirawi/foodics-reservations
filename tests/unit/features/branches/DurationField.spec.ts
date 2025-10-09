/**
 * @file DurationField.spec.ts
 * @summary Module: tests/unit/features/branches/DurationField.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { mount } from "@vue/test-utils";

import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";

import DurationField from "@/features/branches/components/ReservationSettingsModal/DurationField.vue";

const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            settings: {
                duration: {
                    label: "Reservation Duration (minutes)",
                    placeholder: "Enter duration in minutes",
                    errors: {
                        required: "Duration is required.",
                        integer: "Use a whole number of minutes.",
                        min: "Duration must be at least {min} minutes.",
                        max: "Duration must be at most {max} minutes.",
                    },
                },
            },
        },
        ar: {
            settings: {
                duration: {
                    label: "\u0645\u062F\u0629 \u0627\u0644\u062D\u062C\u0632 (\u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642)",
                    placeholder: "\u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u062F\u0629 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642",
                    errors: {
                        required: "\u0627\u0644\u0645\u062F\u0629 \u0645\u0637\u0644\u0648\u0628\u0629.",
                        integer: "\u0627\u0633\u062A\u062E\u062F\u0645 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0646 \u0627\u0644\u062F\u0642\u0627\u0626\u0642.",
                        min: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u0645\u062F\u0629 {min} \u062F\u0642\u064A\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
                        max: "\u064A\u062C\u0628 \u0623\u0644\u0627 \u062A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u0645\u062F\u0629 {max} \u062F\u0642\u064A\u0642\u0629.",
                    },
                },
            },
        },
    },
});
describe("ReservationSettingsModal/DurationField", () => {
    it("renders with null initial value", () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        expect(wrapper.find("[data-testid=\"settings-duration\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"settings-duration-input\"]").exists()).toBe(true);
    });
    it("renders with numeric initial value", () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 60,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        expect(input.element.value).toBe("60");
    });
    it("has label associated with input", () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 60,
            },
            global: {
                plugins: [i18n],
            },
        });
        const label = wrapper.find("label");
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        expect(label.attributes("for")).toBe(input.attributes("id"));
    });
    it("emits update:modelValue with sanitized number when input changes", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        await input.setValue("120");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([120]);
    });
    it("emits null for empty input", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 60,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        await input.setValue("");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
    });
    it("emits valid:duration with true for valid duration", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 120,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted("valid:duration")).toBeTruthy();
        const emissions = wrapper.emitted("valid:duration") ?? [];
        expect(emissions[emissions.length - 1]).toEqual([true]);
    });
    it("emits valid:duration with false for null value", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted("valid:duration")).toBeTruthy();
        const emissions = wrapper.emitted("valid:duration") ?? [];
        expect(emissions[emissions.length - 1]).toEqual([false]);
    });
    it("shows required error for null value", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        const error = wrapper.find("[data-testid=\"settings-duration-error\"]");
        expect(error.exists()).toBe(true);
        expect(error.text()).toContain("required");
    });
    it("shows min error for value below min", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
                min: 1,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find("[data-testid=\"settings-duration-input\"]");
        await input.setValue("0");
        await input.trigger("input");
        const error = wrapper.find("[data-testid=\"settings-duration-error\"]");
        expect(error.exists()).toBe(true);
        expect(error.text()).toContain("1");
    });
    it("clamps value to max when above max", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
                max: 480,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find("[data-testid=\"settings-duration-input\"]");
        await input.setValue("500");
        await input.trigger("input");
        const error = wrapper.find("[data-testid=\"settings-duration-error\"]");
        expect(error.exists()).toBe(false);
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        const emittedValue = wrapper.emitted("update:modelValue")?.[0]?.[0];
        expect(emittedValue).toBe(480);
    });
    it("hides error for valid value", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 120,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        const error = wrapper.find("[data-testid=\"settings-duration-error\"]");
        expect(error.exists()).toBe(false);
    });
    it("sets aria-invalid to true when invalid", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        expect(input.attributes("aria-invalid")).toBe("true");
    });
    it("sets aria-invalid to false when valid", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 120,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        expect(input.attributes("aria-invalid")).toBe("false");
    });
    it("sets aria-describedby when error exists", async () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: null,
            },
            global: {
                plugins: [i18n],
            },
        });
        await wrapper.vm.$nextTick();
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        const error = wrapper.find("[data-testid=\"settings-duration-error\"]");
        const describedBy = input.attributes("aria-describedby");
        expect(describedBy).toBeTruthy();
        expect(error.attributes("id")).toBe(describedBy);
    });
    it("respects custom min/max props", () => {
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 50,
                min: 30,
                max: 120,
            },
            global: {
                plugins: [i18n],
            },
        });
        const input = wrapper.find<HTMLInputElement>("[data-testid=\"settings-duration-input\"]");
        expect(input.attributes("type")).toBe("text");
        expect(input.attributes("inputmode")).toBe("numeric");
    });
    it("mounts without errors in Arabic locale", async () => {
        const arI18n = createI18n({
            legacy: false,
            locale: "ar",
            messages: {
                en: i18n.global.messages.value.en,
                ar: i18n.global.messages.value.ar,
            },
        });
        const wrapper = mount(DurationField, {
            props: {
                modelValue: 120,
            },
            global: {
                plugins: [arI18n],
            },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find("[data-testid=\"settings-duration\"]").exists()).toBe(true);
        const label = wrapper.find("label");
        expect(label.text()).toContain("\u0645\u062F\u0629");
    });
});
