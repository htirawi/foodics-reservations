/**
 * @file AuthTokenBanner.spec.ts
 * @summary Unit tests for AuthTokenBanner component
 * @remarks Tests visibility, dismiss, and i18n integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import AuthTokenBanner from "@/components/ui/AuthTokenBanner.vue";
import { useUIStore } from "@/stores/ui.store";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      errors: {
        auth: {
          title: "Authentication failed",
          message: "Please check your access token and try again.",
        },
      },
      app: {
        close: "Close",
      },
      actions: {
        retry: "Retry",
      },
    },
    ar: {
      errors: {
        auth: {
          title: "فشلت المصادقة",
          message: "يرجى التحقق من رمز الوصول والمحاولة مرة أخرى.",
        },
      },
      app: {
        close: "إغلاق",
      },
      actions: {
        retry: "إعادة المحاولة",
      },
    },
  },
});

describe("AuthTokenBanner", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("is hidden by default", () => {
    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="auth-token-banner"]').exists()).toBe(false);
  });

  it("shows when authBanner.isVisible is true", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="auth-token-banner"]').exists()).toBe(true);
  });

  it("displays default title and message", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain("Authentication failed");
    expect(wrapper.text()).toContain("Please check your access token");
  });

  it("displays custom message when provided", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner({ message: "Custom auth error message" });

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain("Authentication failed");
    expect(wrapper.text()).toContain("Custom auth error message");
  });

  it("hides banner when close button is clicked", async () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('[data-testid="auth-token-banner"]').exists()).toBe(true);

    await wrapper.find('[data-testid="banner-close"]').trigger("click");

    expect(uiStore.authBanner.isVisible).toBe(false);
  });

  it("renders with error variant", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const banner = wrapper.find('[data-testid="auth-token-banner"]');
    expect(banner.classes()).toContain("bg-red-50");
    expect(banner.classes()).toContain("border-red-200");
  });

  it("is dismissible", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const closeButton = wrapper.find('[data-testid="banner-close"]');
    expect(closeButton.exists()).toBe(true);
  });

  it("supports Arabic locale", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const arI18n = createI18n({
      legacy: false,
      locale: "ar",
      messages: {
        ar: {
          errors: {
            auth: {
              title: "فشلت المصادقة",
              message: "يرجى التحقق من رمز الوصول والمحاولة مرة أخرى.",
            },
          },
          app: {
            close: "إغلاق",
          },
        },
      },
    });

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [arI18n],
      },
    });

    expect(wrapper.text()).toContain("فشلت المصادقة");
    expect(wrapper.text()).toContain("يرجى التحقق من رمز الوصول");
  });

  it("has proper accessibility attributes", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const banner = wrapper.find('[data-testid="auth-token-banner"]');
    expect(banner.attributes("role")).toBe("alert");
    expect(banner.attributes("aria-live")).toBe("polite");
  });

  it("can be shown multiple times", () => {
    const uiStore = useUIStore();

    // Show
    uiStore.showAuthBanner();
    expect(uiStore.authBanner.isVisible).toBe(true);

    // Hide
    uiStore.hideAuthBanner();
    expect(uiStore.authBanner.isVisible).toBe(false);

    // Show again
    uiStore.showAuthBanner({ message: "Second error" });
    expect(uiStore.authBanner.isVisible).toBe(true);
    expect(uiStore.authBanner.message).toBe("Second error");
  });

  it("shows retry button when onRetry callback is provided", () => {
    const uiStore = useUIStore();
    const onRetry = vi.fn();

    uiStore.showAuthBanner({ onRetry });

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const retryButton = wrapper.find('[data-testid="auth-banner-retry"]');
    expect(retryButton.exists()).toBe(true);
    expect(retryButton.text()).toBe("Retry");
  });

  it("does not show retry button when onRetry is not provided", () => {
    const uiStore = useUIStore();
    uiStore.showAuthBanner();

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const retryButton = wrapper.find('[data-testid="auth-banner-retry"]');
    expect(retryButton.exists()).toBe(false);
  });

  it("calls onRetry callback when retry button is clicked", async () => {
    const uiStore = useUIStore();
    const onRetry = vi.fn();

    uiStore.showAuthBanner({ onRetry });

    const wrapper = mount(AuthTokenBanner, {
      global: {
        plugins: [i18n],
      },
    });

    const retryButton = wrapper.find('[data-testid="auth-banner-retry"]');
    await retryButton.trigger("click");

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after 10 seconds when autoDismiss is true", async () => {
    vi.useFakeTimers();
    const uiStore = useUIStore();

    uiStore.showAuthBanner({ autoDismiss: true });
    expect(uiStore.authBanner.isVisible).toBe(true);

    // Fast-forward time by 9 seconds - should still be visible
    vi.advanceTimersByTime(9000);
    expect(uiStore.authBanner.isVisible).toBe(true);

    // Fast-forward time by 1 more second (total 10) - should be hidden
    vi.advanceTimersByTime(1000);
    expect(uiStore.authBanner.isVisible).toBe(false);

    vi.useRealTimers();
  });

  it("clears timer when manually dismissed before auto-dismiss", async () => {
    vi.useFakeTimers();
    const uiStore = useUIStore();

    uiStore.showAuthBanner({ autoDismiss: true });
    expect(uiStore.authBanner.isVisible).toBe(true);

    // Manually dismiss after 5 seconds
    vi.advanceTimersByTime(5000);
    uiStore.hideAuthBanner();
    expect(uiStore.authBanner.isVisible).toBe(false);

    // Fast-forward past the 10-second mark - should stay hidden
    vi.advanceTimersByTime(6000);
    expect(uiStore.authBanner.isVisible).toBe(false);

    vi.useRealTimers();
  });

  it("clears previous timer when showing new banner with auto-dismiss", () => {
    vi.useFakeTimers();
    const uiStore = useUIStore();

    // Show first banner with auto-dismiss
    uiStore.showAuthBanner({ message: "First error", autoDismiss: true });
    expect(uiStore.authBanner.message).toBe("First error");

    // Show second banner with auto-dismiss before first timer expires
    vi.advanceTimersByTime(5000);
    uiStore.showAuthBanner({ message: "Second error", autoDismiss: true });
    expect(uiStore.authBanner.message).toBe("Second error");

    // First timer should be cleared, second timer active
    vi.advanceTimersByTime(6000); // 11 seconds total
    expect(uiStore.authBanner.isVisible).toBe(true); // Still visible (only 6s for second)

    vi.advanceTimersByTime(4000); // 10 seconds for second banner
    expect(uiStore.authBanner.isVisible).toBe(false);

    vi.useRealTimers();
  });
});

