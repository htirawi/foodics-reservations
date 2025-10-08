/**
 * @file DaySlotsEditor.spec.ts
 * @summary Module: tests/unit/features/branches/DaySlotsEditor.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { createPinia, setActivePinia } from "pinia";
import DaySlotsEditor from "@/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue";
import type { ReservationTimes } from "@/types/foodics";
import { useUIStore } from "@/stores/ui.store";

let pinia: ReturnType<typeof createPinia>;

beforeEach(() => {
  pinia = createPinia();
  setActivePinia(pinia);
  const uiStore = useUIStore();
  // Mock the confirm method to always return true
  vi.spyOn(uiStore, "confirm").mockResolvedValue(true);
});
const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            app: {
                remove: "Remove",
            },
            settings: {
                slots: {
                    title: "Slots",
                    add: "Add slot",
                    applyAll: "Apply Saturday's slots to all days",
                    confirmApplyAll: "This will overwrite slots for all other days. Continue?",
                    errors: {
                        overlap: "Slots must not overlap.",
                    },
                },
                timeSlots: {
                    add: "Add",
                    applyToAll: "Apply to all",
                },
                days: {
                    saturday: "Saturday",
                    sunday: "Sunday",
                    monday: "Monday",
                    tuesday: "Tuesday",
                    wednesday: "Wednesday",
                    thursday: "Thursday",
                    friday: "Friday",
                },
            },
        },
    },
});
const mockReservationTimes: ReservationTimes = {
    saturday: [["09:00", "17:00"]],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
};
describe("ReservationSettingsModal/DaySlotsEditor", () => {
    it("renders all weekdays", () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        expect(wrapper.find("[data-testid=\"settings-day-slots\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"settings-slot-day-saturday\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"settings-slot-day-sunday\"]").exists()).toBe(true);
        expect(wrapper.find("[data-testid=\"settings-slot-day-monday\"]").exists()).toBe(true);
    });
    it("renders existing slots for a day", () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        expect(wrapper.find("[data-testid=\"settings-day-saturday-row-0\"]").exists()).toBe(true);
    });
    it("emits update:modelValue when adding a slot", async () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        await wrapper.find("[data-testid=\"settings-day-sunday-add\"]").trigger("click");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        const emittedValue = wrapper.emitted("update:modelValue")?.[0]?.[0] as ReservationTimes;
        expect(emittedValue.sunday.length).toBe(1);
    });
    it("emits update:modelValue when removing a slot", async () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        const timePill = wrapper.findComponent({ name: "TimePill" });
        await timePill.vm.$emit("remove");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        const emittedValue = wrapper.emitted("update:modelValue")?.[0]?.[0] as ReservationTimes;
        expect(emittedValue.saturday.length).toBe(0);
    });
    it("emits update:modelValue when updating a slot time", async () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        const timePill = wrapper.findComponent({ name: "TimePill" });
        await timePill.vm.$emit("update:from", "10:00");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        const emittedValue = wrapper.emitted("update:modelValue")?.[0]?.[0] as ReservationTimes;
        expect(emittedValue.saturday[0]?.[0]).toBe("10:00");
    });
    it("emits update:valid with true for valid slots", async () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        await wrapper.vm.$nextTick();
        await wrapper.find("[data-testid=\"settings-day-sunday-add\"]").trigger("click");
        expect(wrapper.emitted("update:valid")).toBeTruthy();
        expect(wrapper.emitted("update:valid")?.[0]).toEqual([true]);
    });
    it("applies slots to all days", async () => {
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: mockReservationTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        await wrapper.find("[data-testid=\"slots-apply-all\"]").trigger("click");
        await flushPromises();
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
        const emittedValue = wrapper.emitted("update:modelValue")?.[0]?.[0] as ReservationTimes;
        expect(emittedValue.sunday).toEqual([["09:00", "17:00"]]);
        expect(emittedValue.monday).toEqual([["09:00", "17:00"]]);
        expect(emittedValue.friday).toEqual([["09:00", "17:00"]]);
    });
    it("shows error message for invalid slots", async () => {
        const invalidTimes: ReservationTimes = {
            saturday: [
                ["09:00", "12:00"],
                ["11:00", "14:00"],
            ],
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
        };
        const wrapper = mount(DaySlotsEditor, {
            props: {
                modelValue: invalidTimes,
            },
            global: {
                plugins: [i18n, pinia],
            },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find("[data-testid=\"error-saturday\"]").exists()).toBe(true);
    });
});
