/**
 * @file useConfirm.spec.ts
 * @summary Unit tests for useConfirm composable
 */
import { describe, it, expect } from "vitest";
import { useConfirm } from "@/composables/useConfirm";

describe("useConfirm", () => {
  it("should initialize with isOpen false", () => {
    const { isOpen } = useConfirm();

    expect(isOpen.value).toBe(false);
  });

  it("should open dialog and return promise", () => {
    const { isOpen, confirm, options } = useConfirm();

    const promise = confirm({
      title: "Test Title",
      message: "Test Message",
    });

    expect(isOpen.value).toBe(true);
    expect(options.value?.title).toBe("Test Title");
    expect(options.value?.message).toBe("Test Message");
    expect(promise).toBeInstanceOf(Promise);
  });

  it("should resolve with true when handleConfirm is called", async () => {
    const { confirm, handleConfirm } = useConfirm();

    const promise = confirm({
      title: "Test",
      message: "Test",
    });

    handleConfirm();

    const result = await promise;
    expect(result).toBe(true);
  });

  it("should resolve with false when handleCancel is called", async () => {
    const { confirm, handleCancel } = useConfirm();

    const promise = confirm({
      title: "Test",
      message: "Test",
    });

    handleCancel();

    const result = await promise;
    expect(result).toBe(false);
  });

  it("should close dialog after handleConfirm", async () => {
    const { isOpen, confirm, handleConfirm } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
    });

    expect(isOpen.value).toBe(true);

    handleConfirm();

    expect(isOpen.value).toBe(false);
  });

  it("should close dialog after handleCancel", async () => {
    const { isOpen, confirm, handleCancel } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
    });

    expect(isOpen.value).toBe(true);

    handleCancel();

    expect(isOpen.value).toBe(false);
  });

  it("should apply default values for optional fields", () => {
    const { confirm, options } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
    });

    expect(options.value?.confirmText).toBe("Confirm");
    expect(options.value?.cancelText).toBe("Cancel");
    expect(options.value?.variant).toBe("info");
  });

  it("should allow custom confirmText and cancelText", () => {
    const { confirm, options } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
      confirmText: "Yes, Delete",
      cancelText: "No, Keep",
    });

    expect(options.value?.confirmText).toBe("Yes, Delete");
    expect(options.value?.cancelText).toBe("No, Keep");
  });

  it("should support danger variant", () => {
    const { confirm, options } = useConfirm();

    confirm({
      title: "Delete",
      message: "Are you sure?",
      variant: "danger",
    });

    expect(options.value?.variant).toBe("danger");
  });

  it("should clear options after confirm", () => {
    const { confirm, handleConfirm, options } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
    });

    expect(options.value).not.toBeNull();

    handleConfirm();

    expect(options.value).toBeNull();
  });

  it("should clear options after cancel", () => {
    const { confirm, handleCancel, options } = useConfirm();

    confirm({
      title: "Test",
      message: "Test",
    });

    expect(options.value).not.toBeNull();

    handleCancel();

    expect(options.value).toBeNull();
  });
});
