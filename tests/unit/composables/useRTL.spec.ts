/**
 * @file useRTL.spec.ts
 * @summary Unit tests for useRTL composable
 */
import { computed, type ComputedRef } from "vue";

import { describe, it, expect, beforeEach, vi } from "vitest";

import * as useLocaleModule from "@/composables/useLocale";
import { useRTL } from "@/composables/useRTL";
import type { SupportedLocale } from "@/types/locale";

describe("useRTL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return isRTL from useLocale", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { isRTL } = useRTL();

    expect(isRTL.value).toBe(false);
  });

  it("should return baseClasses when rtlClasses is undefined", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class")).toBe("base-class");
  });

  it("should return baseClasses when isRTL is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class", "rtl-class")).toBe("base-class");
  });

  it("should return rtlClasses when isRTL is true", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => true) as ComputedRef<boolean>,
      currentLocale: computed(() => "ar" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class", "rtl-class")).toBe("rtl-class");
  });

  it("should return empty string for icon transform when needsFlip is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => true) as ComputedRef<boolean>,
      currentLocale: computed(() => "ar" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform(false)).toBe("");
  });

  it("should return empty string for icon transform when isRTL is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform()).toBe("");
  });

  it("should return rotate class for icon transform when isRTL is true", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => true) as ComputedRef<boolean>,
      currentLocale: computed(() => "ar" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform()).toBe("rtl:rotate-180");
  });

  it("should return correct logical position classes", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getLogicalPosition } = useRTL();

    expect(getLogicalPosition("start")).toBe("justify-start");
    expect(getLogicalPosition("end")).toBe("justify-end");
    expect(getLogicalPosition("center")).toBe("justify-center");
  });

  it("should return correct logical text align classes", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: computed(() => false) as ComputedRef<boolean>,
      currentLocale: computed(() => "en" as SupportedLocale) as ComputedRef<SupportedLocale>,
      setLocale: vi.fn(),
      availableLocales: [],
      restoreLocale: vi.fn(),
      toggleLocale: vi.fn(),
    });

    const { getLogicalTextAlign } = useRTL();

    expect(getLogicalTextAlign("start")).toBe("text-start");
    expect(getLogicalTextAlign("end")).toBe("text-end");
    expect(getLogicalTextAlign("center")).toBe("text-center");
  });
});
