/**
 * @file useSettingsActions.spec.ts
 * @summary Unit tests for useSettingsActions composable
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useSettingsActions } from "@/features/branches/composables/useSettingsActions";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { IBranch, ReservationTimes } from "@/types/foodics";

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
        is_active: true,
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
        is_active: true,
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
        is_active: true,
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
        is_active: true,
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

      vi.spyOn(branchesStore, "enableBranches").mockResolvedValue(undefined);

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

      vi.spyOn(branchesStore, "enableBranches").mockResolvedValue(undefined);

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
