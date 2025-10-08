/**
 * @file useToastDisplay.spec.ts
 * @summary Unit tests for useToastDisplay composable
 */
import { describe, it, expect } from "vitest";
import { useToastDisplay } from "@/composables/useToastDisplay";

describe("useToastDisplay", () => {
  it("should return toast styling functions", () => {
    const { toastClasses, closeButtonClasses, iconComponent } =
      useToastDisplay();

    expect(toastClasses).toBeDefined();
    expect(closeButtonClasses).toBeDefined();
    expect(iconComponent).toBeDefined();
  });

  describe("toastClasses", () => {
    it("should return success classes", () => {
      const { toastClasses } = useToastDisplay();

      const classes = toastClasses("success");

      expect(classes).toContain("bg-white");
      expect(classes).toContain("text-green-800");
    });

    it("should return error classes", () => {
      const { toastClasses } = useToastDisplay();

      const classes = toastClasses("error");

      expect(classes).toContain("bg-white");
      expect(classes).toContain("text-red-800");
    });

    it("should return warning classes", () => {
      const { toastClasses } = useToastDisplay();

      const classes = toastClasses("warning");

      expect(classes).toContain("bg-white");
      expect(classes).toContain("text-yellow-800");
    });

    it("should return info classes", () => {
      const { toastClasses } = useToastDisplay();

      const classes = toastClasses("info");

      expect(classes).toContain("bg-white");
      expect(classes).toContain("text-blue-800");
    });
  });

  describe("closeButtonClasses", () => {
    it("should return success close button classes", () => {
      const { closeButtonClasses } = useToastDisplay();

      const classes = closeButtonClasses("success");

      expect(classes).toContain("text-green-500");
      expect(classes).toContain("hover:text-green-600");
    });

    it("should return error close button classes", () => {
      const { closeButtonClasses } = useToastDisplay();

      const classes = closeButtonClasses("error");

      expect(classes).toContain("text-red-500");
      expect(classes).toContain("hover:text-red-600");
    });

    it("should return warning close button classes", () => {
      const { closeButtonClasses } = useToastDisplay();

      const classes = closeButtonClasses("warning");

      expect(classes).toContain("text-yellow-500");
      expect(classes).toContain("hover:text-yellow-600");
    });

    it("should return info close button classes", () => {
      const { closeButtonClasses } = useToastDisplay();

      const classes = closeButtonClasses("info");

      expect(classes).toContain("text-blue-500");
      expect(classes).toContain("hover:text-blue-600");
    });
  });

  describe("iconComponent", () => {
    it("should return success icon component", () => {
      const { iconComponent } = useToastDisplay();

      const icon = iconComponent("success");

      expect(icon).toBeDefined();
    });

    it("should return error icon component", () => {
      const { iconComponent } = useToastDisplay();

      const icon = iconComponent("error");

      expect(icon).toBeDefined();
    });

    it("should return warning icon component", () => {
      const { iconComponent } = useToastDisplay();

      const icon = iconComponent("warning");

      expect(icon).toBeDefined();
    });

    it("should return info icon component", () => {
      const { iconComponent } = useToastDisplay();

      const icon = iconComponent("info");

      expect(icon).toBeDefined();
    });
  });
});
