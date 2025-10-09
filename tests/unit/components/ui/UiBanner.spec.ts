/**
 * @file UiBanner.spec.ts
 * @summary Unit tests for UiBanner component
 * @remarks Tests rendering, variants, dismiss, and accessibility
 */

import { mount } from "@vue/test-utils";

import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";

import UiBanner from "@/components/ui/UiBanner.vue";

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

describe("UiBanner", () => {
  it("renders with default props", () => {
    const wrapper = mount(UiBanner, {
      global: {
        plugins: [i18n],
      },
      slots: {
        default: "Test message",
      },
    });

    expect(wrapper.text()).toContain("Test message");
    expect(wrapper.attributes("role")).toBe("alert");
    expect(wrapper.attributes("aria-live")).toBe("polite");
  });

  it("renders with custom test ID", () => {
    const wrapper = mount(UiBanner, {
      global: {
        plugins: [i18n],
      },
      props: {
        testId: "custom-banner",
      },
      slots: {
        default: "Test message",
      },
    });

    expect(wrapper.attributes("data-testid")).toBe("custom-banner");
  });

  describe("variants", () => {
    it("applies info variant classes by default", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Info message",
        },
      });

      expect(wrapper.classes()).toContain("bg-blue-50");
      expect(wrapper.classes()).toContain("border-blue-200");
      expect(wrapper.classes()).toContain("text-blue-900");
    });

    it("applies warning variant classes", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          variant: "warning",
        },
        slots: {
          default: "Warning message",
        },
      });

      expect(wrapper.classes()).toContain("bg-yellow-50");
      expect(wrapper.classes()).toContain("border-yellow-200");
      expect(wrapper.classes()).toContain("text-yellow-900");
    });

    it("applies error variant classes", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          variant: "error",
        },
        slots: {
          default: "Error message",
        },
      });

      expect(wrapper.classes()).toContain("bg-red-50");
      expect(wrapper.classes()).toContain("border-red-200");
      expect(wrapper.classes()).toContain("text-red-900");
    });

    it("applies success variant classes", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          variant: "success",
        },
        slots: {
          default: "Success message",
        },
      });

      expect(wrapper.classes()).toContain("bg-green-50");
      expect(wrapper.classes()).toContain("border-green-200");
      expect(wrapper.classes()).toContain("text-green-900");
    });
  });

  describe("dismissible", () => {
    it("does not show close button by default", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Test message",
        },
      });

      expect(wrapper.find("[data-testid='banner-close']").exists()).toBe(false);
    });

    it("shows close button when dismissible is true", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          dismissible: true,
        },
        slots: {
          default: "Test message",
        },
      });

      expect(wrapper.find("[data-testid='banner-close']").exists()).toBe(true);
    });

    it("hides banner when close button is clicked", async () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          dismissible: true,
        },
        slots: {
          default: "Test message",
        },
      });

      await wrapper.find("[data-testid='banner-close']").trigger("click");

      expect(wrapper.find("[role='alert']").exists()).toBe(false);
    });

    it("emits close event when dismissed", async () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          dismissible: true,
        },
        slots: {
          default: "Test message",
        },
      });

      await wrapper.find("[data-testid='banner-close']").trigger("click");

      expect(wrapper.emitted()).toHaveProperty("close");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("accessibility", () => {
    it("has proper ARIA attributes", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Test message",
        },
      });

      expect(wrapper.attributes("role")).toBe("alert");
      expect(wrapper.attributes("aria-live")).toBe("polite");
    });

    it("close button has aria-label", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          dismissible: true,
        },
        slots: {
          default: "Test message",
        },
      });

      const closeButton = wrapper.find("[data-testid='banner-close']");
      expect(closeButton.attributes("aria-label")).toBe("Close");
    });

    it("close button has sr-only text", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        props: {
          dismissible: true,
        },
        slots: {
          default: "Test message",
        },
      });

      const srOnly = wrapper.find(".sr-only");
      expect(srOnly.exists()).toBe(true);
      expect(srOnly.text()).toBe("Close");
    });

    it("icon has aria-hidden attribute", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Test message",
        },
      });

      const icon = wrapper.find("svg");
      expect(icon.attributes("aria-hidden")).toBe("true");
    });
  });

  describe("RTL support", () => {
    it("uses gap for spacing (RTL-safe)", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Test message",
        },
      });

      expect(wrapper.classes()).toContain("gap-3");
    });

    it("uses logical padding (RTL-safe)", () => {
      const wrapper = mount(UiBanner, {
        global: {
          plugins: [i18n],
        },
        slots: {
          default: "Test message",
        },
      });

      expect(wrapper.classes()).toContain("p-4");
    });
  });
});

