/**
 * @file useSettingsForm.spec.ts
 * @summary Unit tests for useSettingsForm composable
 */
import { reactive, defineComponent, h } from "vue";

import { mount } from "@vue/test-utils";

import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import { createI18n } from "vue-i18n";

import { useSettingsForm } from "@/features/branches/composables/useSettingsForm";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      settings: {
        duration: {
          errors: {
            min: "Duration must be at least 1 minute",
          },
        },
        slots: {
          errors: {
            required: "Required",
            format: "Invalid format",
            overlap: "Overlap",
          },
          applyAll: "Apply to All Days",
          confirmApplyAll: "Confirm?",
        },
      },
    },
  },
});

// Helper to call composable within setup context
function withSetup<T>(composable: () => T): T {
  let result!: T;
  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return () => h("div");
    },
  });

  mount(TestComponent, {
    global: {
      plugins: [createPinia(), i18n],
    },
  });

  return result;
}

describe("useSettingsForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with default state", () => {
    const branchId = reactive({ branchId: null });
    const onClose = () => {};

    const form = withSetup(() => useSettingsForm(branchId, onClose));

    expect(form.isOpen.value).toBe(false);
    expect(form.branch.value).toBeNull();
    expect(form.duration.value).toBe(30);
    expect(form.weekdays).toBeDefined();
  });

  it("should compose all sub-composables", () => {
    const branchId = reactive({ branchId: null });
    const onClose = () => {};

    const form = withSetup(() => useSettingsForm(branchId, onClose));

    // Form composes all the pieces
    expect(form.isOpen).toBeDefined();
    expect(form.branch).toBeDefined();
    expect(form.duration).toBeDefined();
    expect(form.weekSlots).toBeDefined();
    expect(form.errors).toBeDefined();
    expect(form.availableTables).toBeDefined();
  });

  it("should expose all required methods", () => {
    const branchId = reactive({ branchId: null });
    const onClose = () => {};

    const form = withSetup(() => useSettingsForm(branchId, onClose));

    expect(form.checkDuration).toBeDefined();
    expect(form.addSlot).toBeDefined();
    expect(form.removeSlot).toBeDefined();
    expect(form.updateSlot).toBeDefined();
    expect(form.applyToAllDays).toBeDefined();
    expect(form.handleSave).toBeDefined();
    expect(form.handleDisable).toBeDefined();
  });
});
