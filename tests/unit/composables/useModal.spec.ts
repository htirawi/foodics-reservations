/**
 * @file useModal.spec.ts
 * @summary Unit tests for useModal composable
 */
import { describe, it, expect } from "vitest";

import { useModal } from "@/composables/useModal";

describe("useModal", () => {
  it("should initialize with isOpen false", () => {
    const { isOpen } = useModal();

    expect(isOpen.value).toBe(false);
  });

  it("should open modal", () => {
    const { isOpen, open } = useModal();

    open();

    expect(isOpen.value).toBe(true);
  });

  it("should close modal", () => {
    const { isOpen, open, close } = useModal();

    open();
    expect(isOpen.value).toBe(true);

    close();
    expect(isOpen.value).toBe(false);
  });

  it("should open modal with options", () => {
    const { open, options } = useModal();

    open({ title: "Test Modal", size: "lg" });

    expect(options.value.title).toBe("Test Modal");
    expect(options.value.size).toBe("lg");
  });

  it("should clear options when closing", () => {
    const { open, close, options } = useModal();

    open({ title: "Test" });
    expect(options.value.title).toBe("Test");

    close();
    expect(options.value).toEqual({});
  });

  it("should handle multiple open calls", () => {
    const { isOpen, open } = useModal();

    open();
    open();

    expect(isOpen.value).toBe(true);
  });

  it("should handle multiple close calls", () => {
    const { isOpen, open, close } = useModal();

    open();
    close();
    close();

    expect(isOpen.value).toBe(false);
  });

  it("should update options on subsequent open calls", () => {
    const { open, options } = useModal();

    open({ title: "First" });
    expect(options.value.title).toBe("First");

    open({ title: "Second" });
    expect(options.value.title).toBe("Second");
  });
});
