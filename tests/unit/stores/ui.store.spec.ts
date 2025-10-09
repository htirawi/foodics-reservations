/**
 * @file ui.store.spec.ts
 * @summary Module: tests/unit/stores/ui.store.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useUIStore } from "@/stores/ui.store";

describe("useUIStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });
    describe("modals", () => {
        it("starts with no modals open", () => {
            const store = useUIStore();
            expect(store.isModalOpen("addBranches")).toBe(false);
            expect(store.isModalOpen("settings")).toBe(false);
        });
        it("opens a modal", () => {
            const store = useUIStore();
            store.openModal("addBranches");
            expect(store.isModalOpen("addBranches")).toBe(true);
            expect(store.isModalOpen("settings")).toBe(false);
        });
        it("closes a modal", () => {
            const store = useUIStore();
            store.openModal("addBranches");
            store.closeModal("addBranches");
            expect(store.isModalOpen("addBranches")).toBe(false);
        });
        it("handles multiple modals independently", () => {
            const store = useUIStore();
            store.openModal("addBranches");
            store.openModal("settings");
            expect(store.isModalOpen("addBranches")).toBe(true);
            expect(store.isModalOpen("settings")).toBe(true);
            store.closeModal("addBranches");
            expect(store.isModalOpen("addBranches")).toBe(false);
            expect(store.isModalOpen("settings")).toBe(true);
        });
    });
    describe("toasts", () => {
        it("starts with no toasts", () => {
            const store = useUIStore();
            expect(store.toasts).toEqual([]);
        });
        it("adds a toast with default type and duration", () => {
            const store = useUIStore();
            const id = store.notify("Test message");
            expect(store.toasts).toHaveLength(1);
            expect(store.toasts[0]?.message).toBe("Test message");
            expect(store.toasts[0]?.type).toBe("info");
            expect(store.toasts[0]?.duration).toBe(5000);
            expect(id).toBeTruthy();
        });
        it("adds a toast with custom type and duration", () => {
            const store = useUIStore();
            store.notify("Error message", "error", 3000);
            expect(store.toasts).toHaveLength(1);
            expect(store.toasts[0]?.type).toBe("error");
            expect(store.toasts[0]?.duration).toBe(3000);
        });
        it("auto-removes toast after duration", () => {
            const store = useUIStore();
            store.notify("Auto-remove", "info", 1000);
            expect(store.toasts).toHaveLength(1);
            vi.advanceTimersByTime(1001);
            expect(store.toasts).toHaveLength(0);
        });
        it("does not auto-remove when duration is 0", () => {
            const store = useUIStore();
            store.notify("Persistent", "info", 0);
            expect(store.toasts).toHaveLength(1);
            vi.advanceTimersByTime(10000);
            expect(store.toasts).toHaveLength(1);
        });
        it("manually removes a toast", () => {
            const store = useUIStore();
            const id = store.notify("Manual remove", "info", 0);
            expect(store.toasts).toHaveLength(1);
            store.removeToast(id);
            expect(store.toasts).toHaveLength(0);
        });
        it("handles multiple toasts", () => {
            const store = useUIStore();
            const id1 = store.notify("Toast 1");
            const id2 = store.notify("Toast 2");
            expect(store.toasts).toHaveLength(2);
            store.removeToast(id1);
            expect(store.toasts).toHaveLength(1);
            expect(store.toasts[0]?.id).toBe(id2);
        });
    });
    describe("confirm dialog", () => {
        it("starts with closed dialog", () => {
            const store = useUIStore();
            expect(store.confirmDialog.isOpen).toBe(false);
            expect(store.confirmDialog.options).toBeNull();
            expect(store.confirmDialog.resolve).toBeNull();
        });
        it("opens confirm dialog with options", () => {
            const store = useUIStore();
            const promise = store.confirm({
                title: "Delete Branch",
                message: "Are you sure?",
            });
            expect(store.confirmDialog.isOpen).toBe(true);
            expect(store.confirmDialog.options?.title).toBe("Delete Branch");
            expect(store.confirmDialog.options?.message).toBe("Are you sure?");
            expect(promise).toBeInstanceOf(Promise);
        });
        it("applies default confirm/cancel text", () => {
            const store = useUIStore();
            store.confirm({
                title: "Confirm",
                message: "Proceed?",
            });
            expect(store.confirmDialog.options?.confirmText).toBe("Confirm");
            expect(store.confirmDialog.options?.cancelText).toBe("Cancel");
            expect(store.confirmDialog.options?.variant).toBe("info");
        });
        it("accepts custom confirm/cancel text and variant", () => {
            const store = useUIStore();
            store.confirm({
                title: "Delete",
                message: "Are you sure?",
                confirmText: "Yes, delete",
                cancelText: "No, keep it",
                variant: "danger",
            });
            expect(store.confirmDialog.options?.confirmText).toBe("Yes, delete");
            expect(store.confirmDialog.options?.cancelText).toBe("No, keep it");
            expect(store.confirmDialog.options?.variant).toBe("danger");
        });
        it("resolves true on confirm", async () => {
            const store = useUIStore();
            const promise = store.confirm({
                title: "Confirm",
                message: "Proceed?",
            });
            store.resolveConfirm(true);
            await expect(promise).resolves.toBe(true);
            expect(store.confirmDialog.isOpen).toBe(false);
            expect(store.confirmDialog.options).toBeNull();
        });
        it("resolves false on cancel", async () => {
            const store = useUIStore();
            const promise = store.confirm({
                title: "Confirm",
                message: "Proceed?",
            });
            store.resolveConfirm(false);
            await expect(promise).resolves.toBe(false);
            expect(store.confirmDialog.isOpen).toBe(false);
            expect(store.confirmDialog.options).toBeNull();
        });
    });
});
