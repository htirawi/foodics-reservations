import { mount } from "@vue/test-utils";

import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";

import DaySlots from "@/features/branches/components/DaySlots.vue";
import type { SlotTuple } from "@/types/foodics";

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
        },
        timeSlots: {
          applyToAll: "Apply on all days",
          add: "Add time slot",
        },
      },
    },
  },
});

describe("DaySlots", () => {
  const defaultSlots: SlotTuple[] = [["09:00", "12:00"], ["14:00", "18:00"]];

  describe("rendering", () => {
    it("should render day name", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      expect(wrapper.text()).toContain("Saturday");
    });

    it("should render with correct data-testid", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "monday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      expect(wrapper.find('[data-testid="day-monday"]').exists()).toBe(true);
    });

    it("should render TimePill for each slot", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: {
              template: '<div class="time-pill-stub"></div>',
            },
          },
        },
      });

      const pills = wrapper.findAll(".time-pill-stub");
      expect(pills).toHaveLength(2);
    });

    it("should render add button", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.exists()).toBe(true);
    });

    it("should show apply to all button only for Saturday", () => {
      const saturdayWrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const saturdayBtn = saturdayWrapper.find('[data-testid="apply-all-saturday"]');
      expect(saturdayBtn.exists()).toBe(true);

      const sundayWrapper = mount(DaySlots, {
        props: {
          day: "sunday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const sundayBtn = sundayWrapper.find('[data-testid="apply-all-sunday"]');
      expect(sundayBtn.exists()).toBe(false);
    });

    it("should render error message when error prop is provided", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
          error: "Invalid time range",
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const errorEl = wrapper.find('[data-testid="error-saturday"]');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe("Invalid time range");
    });

    it("should not render error message when error prop is undefined", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const errorEl = wrapper.find('[data-testid="error-saturday"]');
      expect(errorEl.exists()).toBe(false);
    });

    it("should disable add button when max slots reached", () => {
      const maxSlots: SlotTuple[] = [
        ["09:00", "12:00"],
        ["13:00", "15:00"],
        ["16:00", "18:00"],
      ];

      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: maxSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.attributes("disabled")).toBeDefined();
    });

    it("should enable add button when below max slots", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: [["09:00", "12:00"]],
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.attributes("disabled")).toBeUndefined();
    });

    it("should render with empty slots array", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: [],
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      expect(wrapper.find('[data-testid="day-saturday"]').exists()).toBe(true);
      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.exists()).toBe(true);
    });
  });

  describe("events", () => {
    it("should emit add event when add button is clicked", async () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      await wrapper.find('[data-testid="add-slot-saturday"]').trigger("click");
      expect(wrapper.emitted("add")).toBeTruthy();
    });

    it("should emit apply-to-all event when apply to all button is clicked", async () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      await wrapper.find('[data-testid="apply-all-saturday"]').trigger("click");
      expect(wrapper.emitted("apply-to-all")).toBeTruthy();
    });

    it("should emit update:slot event with correct parameters when from time changes", async () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
        },
      });

      const timePill = wrapper.findComponent({ name: "TimePill" });
      await timePill.vm.$emit("update:from", "10:00");

      expect(wrapper.emitted("update:slot")).toBeTruthy();
      expect(wrapper.emitted("update:slot")?.[0]).toEqual([0, "from", "10:00"]);
    });

    it("should emit update:slot event with correct parameters when to time changes", async () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
        },
      });

      const timePill = wrapper.findComponent({ name: "TimePill" });
      await timePill.vm.$emit("update:to", "13:00");

      expect(wrapper.emitted("update:slot")).toBeTruthy();
      expect(wrapper.emitted("update:slot")?.[0]).toEqual([0, "to", "13:00"]);
    });

    it("should emit remove event with correct index", async () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
        },
      });

      const timePills = wrapper.findAllComponents({ name: "TimePill" });
      await timePills[1]?.vm.$emit("remove");

      expect(wrapper.emitted("remove")).toBeTruthy();
      expect(wrapper.emitted("remove")?.[0]).toEqual([1]);
    });
  });

  describe("TimePill props", () => {
    it("should pass correct props to TimePill components", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
        },
      });

      const timePills = wrapper.findAllComponents({ name: "TimePill" });
      expect(timePills[0]?.props()).toMatchObject({
        from: "09:00",
        to: "12:00",
        editable: true,
        removable: true,
      });
    });

    it("should pass correct data-testid to TimePill", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
        },
      });

      const timePills = wrapper.findAllComponents({ name: "TimePill" });
      expect(timePills[0]?.props("dataTestid")).toBe("settings-slot-row-saturday-0");
      expect(timePills[1]?.props("dataTestid")).toBe("settings-slot-row-saturday-1");
    });
  });

  describe("accessibility", () => {
    it("should have aria-label on add button", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.attributes("aria-label")).toBe("Add time slot");
    });

    it("should have proper button type attributes", () => {
      const wrapper = mount(DaySlots, {
        props: {
          day: "saturday",
          slots: defaultSlots,
        },
        global: {
          plugins: [i18n],
          stubs: {
            TimePill: true,
          },
        },
      });

      const addBtn = wrapper.find('[data-testid="add-slot-saturday"]');
      expect(addBtn.attributes("type")).toBe("button");

      const applyBtn = wrapper.find('[data-testid="apply-all-saturday"]');
      expect(applyBtn.attributes("type")).toBe("button");
    });
  });
});
