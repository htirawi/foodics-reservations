/**
 * @file useModals.spec.ts
 * @summary Unit tests for useModals composable
 */
import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";

import { useModals } from "@/features/branches/composables/useModals";

describe("useModals", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with all modals closed", () => {
    const { showAddModal, showSettingsModal } = useModals();

    expect(showAddModal.value).toBe(false);
    expect(showSettingsModal.value).toBe(false);
  });

  it("should open add modal", () => {
    const { showAddModal, openAddModal } = useModals();

    openAddModal();

    expect(showAddModal.value).toBe(true);
  });

  it("should close add modal", () => {
    const { showAddModal, openAddModal, closeAddModal } = useModals();

    openAddModal();
    closeAddModal();

    expect(showAddModal.value).toBe(false);
  });

  it("should open settings modal with branch id", () => {
    const { selectedBranchId, showSettingsModal, openSettingsModal } =
      useModals();

    openSettingsModal("branch-123");

    expect(showSettingsModal.value).toBe(true);
    expect(selectedBranchId.value).toBe("branch-123");
  });

  it("should close settings modal and clear branch id", () => {
    const {
      selectedBranchId,
      showSettingsModal,
      openSettingsModal,
      closeSettingsModal,
    } = useModals();

    openSettingsModal("branch-456");
    closeSettingsModal();

    expect(showSettingsModal.value).toBe(false);
    expect(selectedBranchId.value).toBeNull();
  });

  it("should handle multiple modal operations", () => {
    const { showAddModal, showSettingsModal, openAddModal, openSettingsModal } =
      useModals();

    openAddModal();
    expect(showAddModal.value).toBe(true);

    openSettingsModal("branch-789");
    expect(showSettingsModal.value).toBe(true);

    // Both can be tracked independently
    expect(showAddModal.value).toBe(true);
  });
});
