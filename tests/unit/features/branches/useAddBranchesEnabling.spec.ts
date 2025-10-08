/**
 * @file useAddBranchesEnabling.spec.ts
 * @summary Unit tests for useAddBranchesEnabling composable
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useAddBranchesEnabling } from "@/features/branches/composables/useAddBranchesEnabling";
import { useBranchesStore } from "@/features/branches/stores/branches.store";

describe("useAddBranchesEnabling", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with saving false", () => {
    const selectedIds = ref<string[]>([]);
    const clear = vi.fn();
    const toast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    const t = (key: string) => key;

    const { saving } = useAddBranchesEnabling(selectedIds, clear, toast, t);

    expect(saving.value).toBe(false);
  });

  it("should not call enableBranches when no branches selected", async () => {
    const selectedIds = ref<string[]>([]);
    const clear = vi.fn();
    const toast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    const t = (key: string) => key;
    const onSuccess = vi.fn();

    const branchesStore = useBranchesStore();
    vi.spyOn(branchesStore, "enableBranches");

    const { handleEnable } = useAddBranchesEnabling(
      selectedIds,
      clear,
      toast,
      t,
    );

    await handleEnable(onSuccess);

    expect(branchesStore.enableBranches).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should enable branches successfully", async () => {
    const selectedIds = ref<string[]>(["branch-1", "branch-2"]);
    const clear = vi.fn();
    const toast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    const t = (key: string, params?: any) =>
      `${key}:${JSON.stringify(params)}`;
    const onSuccess = vi.fn();

    const branchesStore = useBranchesStore();
    vi.spyOn(branchesStore, "enableBranches").mockResolvedValue({
      ok: true,
      enabled: ["branch-1", "branch-2"],
      failed: [],
    });

    const { handleEnable, saving } = useAddBranchesEnabling(
      selectedIds,
      clear,
      toast,
      t,
    );

    const promise = handleEnable(onSuccess);
    expect(saving.value).toBe(true);

    await promise;

    expect(saving.value).toBe(false);
    expect(toast.success).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle partial success", async () => {
    const selectedIds = ref<string[]>(["branch-1", "branch-2", "branch-3"]);
    const clear = vi.fn();
    const toast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    const t = (key: string, params?: any) =>
      `${key}:${JSON.stringify(params)}`;
    const onSuccess = vi.fn();

    const branchesStore = useBranchesStore();
    vi.spyOn(branchesStore, "enableBranches").mockResolvedValue({
      ok: false,
      enabled: ["branch-1", "branch-2"],
      failed: ["branch-3"],
    });

    const { handleEnable } = useAddBranchesEnabling(
      selectedIds,
      clear,
      toast,
      t,
    );

    await handleEnable(onSuccess);

    expect(toast.warning).toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(selectedIds.value).toEqual(["branch-3"]);
  });

  it("should handle errors", async () => {
    const selectedIds = ref<string[]>(["branch-1"]);
    const clear = vi.fn();
    const toast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    const t = (key: string) => key;
    const onSuccess = vi.fn();

    const branchesStore = useBranchesStore();
    vi.spyOn(branchesStore, "enableBranches").mockRejectedValue(
      new Error("Network error"),
    );

    const { handleEnable, saving } = useAddBranchesEnabling(
      selectedIds,
      clear,
      toast,
      t,
    );

    await handleEnable(onSuccess);

    expect(saving.value).toBe(false);
    expect(toast.error).toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
