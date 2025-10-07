/**
 * @file ReservationSettingsModal.day-slots-editor.spec.ts
 * @summary Unit tests for DaySlotsEditor component
 * @remarks Deterministic, fast, offline; uses Vue Test Utils
 */
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DaySlotsEditor from "@/features/branches/components/ReservationSettingsModal/DaySlotsEditor.vue";
import type { ReservationTimes } from "@/types/foodics";
import { createI18n } from "vue-i18n";

// Mock useConfirm composable
vi.mock("@/composables/useConfirm", () => ({
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(true),
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      app: {
        remove: "Remove",
      },
      settings: {
        days: {
          saturday: "Saturday",
          sunday: "Sunday",
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
        },
        slots: {
          title: "Day-by-day time slots",
          add: "Add slot",
          applyAll: "Apply on all days",
          errors: {
            format: "Use HH:mm (e.g., 09:30).",
            order: "Start time must be before end time.",
            max: "At most 3 slots per day.",
            overlap: "Slots must not overlap.",
            overnight: "Overnight ranges not supported.",
          },
        },
      },
    },
  },
});

describe("DaySlotsEditor", () => {
  const emptyTimes: ReservationTimes = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  function createWrapper(modelValue: ReservationTimes = emptyTimes) {
    return mount(DaySlotsEditor, {
      props: {
        modelValue,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  describe("rendering", () => {
    it("should render component with title", () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="settings-day-slots"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Day-by-day time slots");
    });

    it("should render all 7 days in fixed order", () => {
      const wrapper = createWrapper();
      const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

      days.forEach((day) => {
        expect(wrapper.find(`[data-testid="settings-slot-day-${day}"]`).exists()).toBe(true);
      });
    });

    it("should render day headings with i18n", () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain("Saturday");
      expect(wrapper.text()).toContain("Sunday");
      expect(wrapper.text()).toContain("Friday");
    });

    it("should render add button for each day", () => {
      const wrapper = createWrapper();
      const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

      days.forEach((day) => {
        expect(wrapper.find(`[data-testid="settings-day-${day}-add"]`).exists()).toBe(true);
      });
    });

    it("should render 'Apply on all days' button only for Saturday", () => {
      const wrapper = createWrapper();
      const applyButton = wrapper.find('[data-testid="slots-apply-all"]');
      expect(applyButton.exists()).toBe(true);

      // Should be within Saturday's fieldset
      const saturdayFieldset = wrapper.find('[data-testid="settings-slot-day-saturday"]');
      expect(saturdayFieldset.html()).toContain('data-testid="slots-apply-all"');
    });
  });

  describe("slot display", () => {
    it("should render existing slots for a day", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"], ["13:00", "17:00"]],
      };
      const wrapper = createWrapper(times);

      const list = wrapper.find('[data-testid="settings-day-saturday-list"]');
      expect(list.exists()).toBe(true);

      const row0 = wrapper.find('[data-testid="settings-day-saturday-row-0"]');
      const row1 = wrapper.find('[data-testid="settings-day-saturday-row-1"]');
      expect(row0.exists()).toBe(true);
      expect(row1.exists()).toBe(true);
    });

    it("should not render list when day has no slots", () => {
      const wrapper = createWrapper(emptyTimes);
      const list = wrapper.find('[data-testid="settings-day-saturday-list"]');
      expect(list.exists()).toBe(false);
    });
  });

  describe("slot operations", () => {
    it("should emit update:modelValue when adding slot", async () => {
      const wrapper = createWrapper(emptyTimes);
      const addButton = wrapper.find('[data-testid="settings-day-saturday-add"]');

      await addButton.trigger("click");

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]?.[0]).toMatchObject({
        saturday: [["09:00", "17:00"]],
      });
    });

    it("should emit update:valid after adding slot", async () => {
      const wrapper = createWrapper(emptyTimes);
      const addButton = wrapper.find('[data-testid="settings-day-saturday-add"]');

      await addButton.trigger("click");

      const emitted = wrapper.emitted("update:valid");
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]?.[0]).toBe(true);
    });

    it("should disable add button when at max slots (3)", async () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [
          ["09:00", "10:00"],
          ["11:00", "12:00"],
          ["13:00", "14:00"],
        ],
      };
      const wrapper = createWrapper(times);
      const addButton = wrapper.find('[data-testid="settings-day-saturday-add"]');

      expect(addButton.attributes("disabled")).toBeDefined();
    });
  });

  describe("validation errors", () => {
    it("should display error message for invalid slots", async () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["14:00", "12:00"]], // Invalid order (2 PM to 12 PM)
      };
      const wrapper = createWrapper(times);

      const error = wrapper.find('[data-testid="error-saturday"]');
      expect(error.exists()).toBe(true);
      expect(error.text()).toContain("Overnight ranges not supported.");
    });

    it("should have aria-live on error message", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["12:00", "09:00"]],
      };
      const wrapper = createWrapper(times);

      const error = wrapper.find('[data-testid="error-saturday"]');
      expect(error.attributes("aria-live")).toBe("polite");
      expect(error.attributes("role")).toBe("alert");
    });

    it("should not display error when slots are valid", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const wrapper = createWrapper(times);

      const error = wrapper.find('[data-testid="error-saturday"]');
      expect(error.exists()).toBe(false);
    });

    it("should emit valid:false when slots have errors", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["12:00", "09:00"]], // Invalid
      };
      const wrapper = createWrapper(times);

      const emitted = wrapper.emitted("update:valid");
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]?.[0]).toBe(false);
    });
  });

  describe("accessibility", () => {
    it("should use fieldset for each day", () => {
      const wrapper = createWrapper();
      const fieldset = wrapper.find('[data-testid="settings-slot-day-saturday"]');
      expect(fieldset.element.tagName).toBe("FIELDSET");
    });

    it("should have aria-labelledby on fieldset", () => {
      const wrapper = createWrapper();
      const fieldset = wrapper.find('[data-testid="settings-slot-day-saturday"]');
      expect(fieldset.attributes("aria-labelledby")).toBe("day-heading-saturday");
    });

    it("should have corresponding id on heading", () => {
      const wrapper = createWrapper();
      const heading = wrapper.find("#day-heading-saturday");
      expect(heading.exists()).toBe(true);
      expect(heading.element.tagName).toBe("H4");
    });
  });

  describe("apply to all days", () => {
    it("should render apply-all button only in Saturday section", () => {
      const wrapper = createWrapper();
      
      // Should exist in Saturday
      const saturdaySection = wrapper.find('[data-testid="settings-slot-day-saturday"]');
      expect(saturdaySection.html()).toContain('data-testid="slots-apply-all"');

      // Should NOT exist in other days
      const sundaySection = wrapper.find('[data-testid="settings-slot-day-sunday"]');
      expect(sundaySection.html()).not.toContain('data-testid="slots-apply-all"');
    });
  });

  describe("i18n", () => {
    it("should display translated day names", () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain("Saturday");
      expect(wrapper.text()).toContain("Monday");
      expect(wrapper.text()).toContain("Friday");
    });

    it("should display translated error messages", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["14:00", "12:00"]], // Invalid order (2 PM to 12 PM)
      };
      const wrapper = createWrapper(times);
      const error = wrapper.find('[data-testid="error-saturday"]');
      expect(error.text()).toContain("Overnight ranges not supported.");
    });

    it("should display translated button text", () => {
      const wrapper = createWrapper();
      expect(wrapper.text()).toContain("Add slot");
      expect(wrapper.text()).toContain("Apply on all days");
    });
  });

  describe("data-testid attributes", () => {
    it("should have stable test IDs for all interactive elements", () => {
      const times: ReservationTimes = {
        ...emptyTimes,
        saturday: [["09:00", "12:00"]],
      };
      const wrapper = createWrapper(times);

      // Main container
      expect(wrapper.find('[data-testid="settings-day-slots"]').exists()).toBe(true);

      // Day fieldsets
      expect(wrapper.find('[data-testid="settings-slot-day-saturday"]').exists()).toBe(true);

      // Slot list
      expect(wrapper.find('[data-testid="settings-day-saturday-list"]').exists()).toBe(true);

      // Slot row
      expect(wrapper.find('[data-testid="settings-day-saturday-row-0"]').exists()).toBe(true);

      // Add button
      expect(wrapper.find('[data-testid="settings-day-saturday-add"]').exists()).toBe(true);

      // Apply-all button
      expect(wrapper.find('[data-testid="slots-apply-all"]').exists()).toBe(true);
    });
  });
});
