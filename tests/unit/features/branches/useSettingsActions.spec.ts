/**
 * @file useSettingsActions.spec.ts
 * @summary Unit tests for useSettingsActions composable
 */
import { ref } from "vue";

import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSettingsActions } from "@/features/branches/composables/useSettingsActions";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { IBranch, ReservationTimes } from "@/types/foodics";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock UI store
vi.mock("@/stores/ui.store", () => ({
  useUIStore: () => ({
    notify: vi.fn(),
  }),
}));

describe("useSettingsActions", () => {
  let branchesStore: ReturnType<typeof useBranchesStore>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    branchesStore = useBranchesStore();
    mockOnClose = vi.fn();
  });

  describe("handleSave", () => {
    it("should save settings when all validations pass", async () => {
      const mockBranch: IBranch = {
        id: "branch-123",
        name: "Test Branch",
        reference: "REF-123",
        name_localized: null,
        type: 1,
        accepts_reservations: true,
        receives_online_orders: false,
        opening_from: "09:00",
        opening_to: "22:00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        reservation_duration: 30,
        reservation_times: {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
        sections: [],
      };

      const state = {
        branch: ref(mockBranch),
        duration: ref(45),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [["09:00", "12:00"]],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn().mockReturnValue(true),
        checkSlots: vi.fn().mockReturnValue(true),
      };

      vi.spyOn(branchesStore, "updateSettings").mockResolvedValue(undefined);

      const { handleSave } = useSettingsActions(state, validation, mockOnClose);
      await handleSave();

      expect(validation.checkDuration).toHaveBeenCalledOnce();
      expect(validation.checkSlots).toHaveBeenCalledTimes(7);
      expect(branchesStore.updateSettings).toHaveBeenCalledWith("branch-123", {
        reservation_duration: 45,
        reservation_times: state.weekSlots.value,
      });
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it("should not save when duration validation fails", async () => {
      const mockBranch: IBranch = {
        id: "branch-123",
        name: "Test Branch",
        reference: "REF-123",
        name_localized: null,
        type: 1,
        accepts_reservations: true,
        receives_online_orders: false,
        opening_from: "09:00",
        opening_to: "22:00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        reservation_duration: 30,
        reservation_times: {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
        sections: [],
      };

      const state = {
        branch: ref(mockBranch),
        duration: ref(0),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn().mockReturnValue(false),
        checkSlots: vi.fn().mockReturnValue(true),
      };

      vi.spyOn(branchesStore, "updateSettings").mockResolvedValue(undefined);

      const { handleSave } = useSettingsActions(state, validation, mockOnClose);
      await handleSave();

      expect(branchesStore.updateSettings).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should not save when slots validation fails", async () => {
      const mockBranch: IBranch = {
        id: "branch-123",
        name: "Test Branch",
        reference: "REF-123",
        name_localized: null,
        type: 1,
        accepts_reservations: true,
        receives_online_orders: false,
        opening_from: "09:00",
        opening_to: "22:00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        reservation_duration: 30,
        reservation_times: {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
        sections: [],
      };

      const state = {
        branch: ref(mockBranch),
        duration: ref(30),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [["25:00", "12:00"]],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn().mockReturnValue(true),
        checkSlots: vi.fn((day) => day !== "monday"),
      };

      vi.spyOn(branchesStore, "updateSettings").mockResolvedValue(undefined);

      const { handleSave } = useSettingsActions(state, validation, mockOnClose);
      await handleSave();

      expect(branchesStore.updateSettings).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should not save when branch is null", async () => {
      const state = {
        branch: ref(null),
        duration: ref(30),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn().mockReturnValue(true),
        checkSlots: vi.fn().mockReturnValue(true),
      };

      vi.spyOn(branchesStore, "updateSettings").mockResolvedValue(undefined);

      const { handleSave } = useSettingsActions(state, validation, mockOnClose);
      await handleSave();

      expect(validation.checkDuration).not.toHaveBeenCalled();
      expect(branchesStore.updateSettings).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("handleDisable", () => {
    it("should disable branch and close modal", async () => {
      const mockBranch: IBranch = {
        id: "branch-456",
        name: "Test Branch",
        reference: "REF-456",
        name_localized: null,
        type: 1,
        accepts_reservations: true,
        receives_online_orders: false,
        opening_from: "09:00",
        opening_to: "22:00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
        reservation_duration: 30,
        reservation_times: {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
        sections: [],
      };

      const state = {
        branch: ref(mockBranch),
        duration: ref(30),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn(),
        checkSlots: vi.fn(),
      };

      vi.spyOn(branchesStore, "enableBranches").mockResolvedValue({
        ok: true,
        enabled: ["branch-123"],
        failed: [],
      });

      const { handleDisable } = useSettingsActions(
        state,
        validation,
        mockOnClose,
      );
      await handleDisable();

      expect(branchesStore.enableBranches).toHaveBeenCalledWith([]);
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it("should not disable when branch is null", async () => {
      const state = {
        branch: ref(null),
        duration: ref(30),
        weekSlots: ref<ReservationTimes>({
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        }),
      };

      const validation = {
        checkDuration: vi.fn(),
        checkSlots: vi.fn(),
      };

      vi.spyOn(branchesStore, "enableBranches").mockResolvedValue({
        ok: true,
        enabled: ["branch-123"],
        failed: [],
      });

      const { handleDisable } = useSettingsActions(
        state,
        validation,
        mockOnClose,
      );
      await handleDisable();

      expect(branchesStore.enableBranches).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
