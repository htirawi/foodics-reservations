/**
 * @file useSettingsState.spec.ts
 * @summary Unit tests for useSettingsState composable
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { reactive } from "vue";
import { useSettingsState } from "@/features/branches/composables/useSettingsState";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import type { IBranch } from "@/types/foodics";

describe("useSettingsState", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with default values", () => {
    const branchId = reactive({ branchId: null });
    const { duration, weekSlots, isOpen, branch, availableTables } =
      useSettingsState(branchId);

    expect(duration.value).toBe(30);
    expect(weekSlots.value.monday).toEqual([]);
    expect(isOpen.value).toBe(false);
    expect(branch.value).toBeNull();
    expect(availableTables.value).toEqual([]);
  });

  it("should update isOpen when branchId changes", () => {
    const branchId = reactive({ branchId: null });
    const { isOpen } = useSettingsState(branchId);

    expect(isOpen.value).toBe(false);

    branchId.branchId = "branch-123";

    expect(isOpen.value).toBe(true);
  });

  it("should return null branch when branchId is null", () => {
    const branchId = reactive({ branchId: null });
    const { branch } = useSettingsState(branchId);

    expect(branch.value).toBeNull();
  });

  it("should return branch when branchId matches", () => {
    const branchesStore = useBranchesStore();
    const mockBranch: IBranch = {
      id: "branch-123",
      name: "Test Branch",
      reference: "REF-123",
      is_active: true,
      reservation_duration: 45,
      reservation_times: {
        saturday: [],
        sunday: [],
        monday: [["09:00", "12:00"]],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      },
      sections: [],
    };

    branchesStore.branches = [mockBranch];

    const branchId = reactive({ branchId: "branch-123" });
    const { branch } = useSettingsState(branchId);

    expect(branch.value).toEqual(mockBranch);
  });

  it("should return empty availableTables when branch has no sections", () => {
    const branchesStore = useBranchesStore();
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

    branchesStore.branches = [mockBranch];

    const branchId = reactive({ branchId: "branch-456" });
    const { availableTables } = useSettingsState(branchId);

    expect(availableTables.value).toEqual([]);
  });

  it("should extract reservable tables from sections", () => {
    const branchesStore = useBranchesStore();
    const mockBranch: IBranch = {
      id: "branch-789",
      name: "Test Branch",
      reference: "REF-789",
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
      sections: [
        {
          id: "section-1",
          name: "Main",
          tables: [
            {
              id: "table-1",
              name: "Table 1",
              accepts_reservations: true,
              capacity: 4,
            },
            {
              id: "table-2",
              name: "Table 2",
              accepts_reservations: false,
              capacity: 2,
            },
            {
              id: "table-3",
              name: "Table 3",
              accepts_reservations: true,
              capacity: 6,
            },
          ],
        },
        {
          id: "section-2",
          name: "Patio",
          tables: [
            {
              id: "table-4",
              name: "Table 4",
              accepts_reservations: true,
              capacity: 4,
            },
          ],
        },
      ],
    };

    branchesStore.branches = [mockBranch];

    const branchId = reactive({ branchId: "branch-789" });
    const { availableTables } = useSettingsState(branchId);

    expect(availableTables.value).toHaveLength(3);
    expect(availableTables.value.map((t) => t.id)).toEqual([
      "table-1",
      "table-3",
      "table-4",
    ]);
  });

  it("should handle sections without tables", () => {
    const branchesStore = useBranchesStore();
    const mockBranch: IBranch = {
      id: "branch-999",
      name: "Test Branch",
      reference: "REF-999",
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
      sections: [
        {
          id: "section-1",
          name: "Empty Section",
        },
      ],
    };

    branchesStore.branches = [mockBranch];

    const branchId = reactive({ branchId: "branch-999" });
    const { availableTables } = useSettingsState(branchId);

    expect(availableTables.value).toEqual([]);
  });
});
