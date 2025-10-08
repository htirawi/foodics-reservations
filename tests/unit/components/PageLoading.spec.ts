/**
 * @file PageLoading.spec.ts
 * @summary Unit tests for PageLoading component
 */
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import PageLoading from "@/components/ui/PageLoading.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      loading: {
        message: "Loading...",
      },
    },
  },
});

describe("PageLoading", () => {
  it("should render loading container", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="page-loading"]').exists()).toBe(true);
  });

  it("should have role=status for accessibility", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    const container = wrapper.find('[role="status"]');
    expect(container.exists()).toBe(true);
  });

  it("should have aria-busy=true", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    const container = wrapper.find('[aria-busy="true"]');
    expect(container.exists()).toBe(true);
  });

  it("should display loading message", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain("Loading...");
  });

  it("should have sr-only text for screen readers", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find(".sr-only").exists()).toBe(true);
  });

  it("should have spinner animation", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    const spinner = wrapper.find(".animate-spin");
    expect(spinner.exists()).toBe(true);
  });

  it("should have aria-label attribute", () => {
    const wrapper = mount(PageLoading, {
      global: {
        plugins: [i18n],
      },
    });

    const container = wrapper.find('[role="status"]');
    expect(container.attributes("aria-label")).toBe("Loading...");
  });
});
