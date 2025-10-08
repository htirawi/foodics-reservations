/**
 * @file useRTL.spec.ts
 * @summary Unit tests for useRTL composable
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useRTL } from "@/composables/useRTL";
import * as useLocaleModule from "@/composables/useLocale";

describe("useRTL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return isRTL from useLocale", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { isRTL } = useRTL();

    expect(isRTL.value).toBe(false);
  });

  it("should return baseClasses when rtlClasses is undefined", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class")).toBe("base-class");
  });

  it("should return baseClasses when isRTL is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class", "rtl-class")).toBe("base-class");
  });

  it("should return rtlClasses when isRTL is true", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: true } as any,
      locale: { value: "ar" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getRTLClasses } = useRTL();

    expect(getRTLClasses("base-class", "rtl-class")).toBe("rtl-class");
  });

  it("should return empty string for icon transform when needsFlip is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: true } as any,
      locale: { value: "ar" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform(false)).toBe("");
  });

  it("should return empty string for icon transform when isRTL is false", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform()).toBe("");
  });

  it("should return rotate class for icon transform when isRTL is true", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: true } as any,
      locale: { value: "ar" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getIconTransform } = useRTL();

    expect(getIconTransform()).toBe("rtl:rotate-180");
  });

  it("should return correct logical position classes", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getLogicalPosition } = useRTL();

    expect(getLogicalPosition("start")).toBe("justify-start");
    expect(getLogicalPosition("end")).toBe("justify-end");
    expect(getLogicalPosition("center")).toBe("justify-center");
  });

  it("should return correct logical text align classes", () => {
    vi.spyOn(useLocaleModule, "useLocale").mockReturnValue({
      isRTL: { value: false } as any,
      locale: { value: "en" } as any,
      setLocale: vi.fn(),
      availableLocales: [],
      getLocaleName: vi.fn(),
    });

    const { getLogicalTextAlign } = useRTL();

    expect(getLogicalTextAlign("start")).toBe("text-start");
    expect(getLogicalTextAlign("end")).toBe("text-end");
    expect(getLogicalTextAlign("center")).toBe("text-center");
  });
});
