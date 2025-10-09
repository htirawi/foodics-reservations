import { mount } from "@vue/test-utils";

import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";

import TimePill from "@/components/ui/TimePill.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      app: {
        remove: "Remove",
      },
    },
  },
});

describe("TimePill", () => {
  describe("non-editable mode", () => {
    it("should render time range in non-editable mode", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.text()).toContain("09:00 - 12:00");
    });

    it("should use timeRange prop when provided", () => {
      const wrapper = mount(TimePill, {
        props: {
          timeRange: "Morning Shift",
          editable: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.text()).toContain("Morning Shift");
    });

    it("should show remove button when removable is true", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: false,
          removable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const removeBtn = wrapper.find('button[aria-label="Remove"]');
      expect(removeBtn.exists()).toBe(true);
    });

    it("should not show remove button when removable is false", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: false,
          removable: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      const removeBtn = wrapper.find('button[aria-label="Remove"]');
      expect(removeBtn.exists()).toBe(false);
    });

    it("should emit remove event when remove button is clicked", async () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: false,
          removable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      await wrapper.find('button[aria-label="Remove"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("remove");
    });

    it("should render with data-testid when provided", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: false,
          dataTestid: "my-time-pill",
        },
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.find('[data-testid="my-time-pill"]').exists()).toBe(true);
    });
  });

  describe("editable mode", () => {
    it("should render time inputs in editable mode", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const inputs = wrapper.findAll('input[type="time"]');
      expect(inputs).toHaveLength(2);
    });

    it("should display correct values in time inputs", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const inputs = wrapper.findAll('input[type="time"]');
      expect((inputs[0]?.element as HTMLInputElement).value).toBe("09:00");
      expect((inputs[1]?.element as HTMLInputElement).value).toBe("12:00");
    });

    it("should emit update:from when from input changes", async () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const fromInput = wrapper.findAll('input[type="time"]')[0];
      if (fromInput) {
        await fromInput.setValue("10:00");
        await fromInput.trigger("input");
      }

      expect(wrapper.emitted("update:from")).toBeTruthy();
      expect(wrapper.emitted("update:from")?.[0]).toEqual(["10:00"]);
    });

    it("should emit update:to when to input changes", async () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const toInput = wrapper.findAll('input[type="time"]')[1];
      if (toInput) {
        await toInput.setValue("13:00");
        await toInput.trigger("input");
      }

      expect(wrapper.emitted("update:to")).toBeTruthy();
      expect(wrapper.emitted("update:to")?.[0]).toEqual(["13:00"]);
    });

    it("should show remove button when removable is true", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
          removable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const removeBtn = wrapper.find('[data-testid="slot-delete-btn"]');
      expect(removeBtn.exists()).toBe(true);
    });

    it("should not show remove button when removable is false", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
          removable: false,
        },
        global: {
          plugins: [i18n],
        },
      });

      const removeBtn = wrapper.find('[data-testid="slot-delete-btn"]');
      expect(removeBtn.exists()).toBe(false);
    });

    it("should emit remove event when remove button is clicked", async () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
          removable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      await wrapper.find('[data-testid="slot-delete-btn"]').trigger("click");
      expect(wrapper.emitted()).toHaveProperty("remove");
    });

    it("should render with data-testid when provided", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
          dataTestid: "my-editable-pill",
        },
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.find('[data-testid="my-editable-pill"]').exists()).toBe(true);
    });

    it("should include screen reader text for accessibility", () => {
      const wrapper = mount(TimePill, {
        props: {
          from: "09:00",
          to: "12:00",
          editable: true,
        },
        global: {
          plugins: [i18n],
        },
      });

      const srOnly = wrapper.find(".sr-only");
      expect(srOnly.exists()).toBe(true);
      expect(srOnly.text()).toBe("09:00 - 12:00");
    });
  });

  describe("default props", () => {
    it("should use empty string defaults for from, to, and timeRange", () => {
      const wrapper = mount(TimePill, {
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.props("from")).toBe("");
      expect(wrapper.props("to")).toBe("");
      expect(wrapper.props("timeRange")).toBe("");
    });

    it("should default to non-editable and non-removable", () => {
      const wrapper = mount(TimePill, {
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.props("editable")).toBe(false);
      expect(wrapper.props("removable")).toBe(false);
    });

    it("should render properly with default props", () => {
      const wrapper = mount(TimePill, {
        global: {
          plugins: [i18n],
        },
      });

      expect(wrapper.text()).toContain("-");
    });
  });
});
