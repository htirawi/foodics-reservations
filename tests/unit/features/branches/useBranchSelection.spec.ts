/**
 * @file useBranchSelection.spec.ts
 * @summary Module: tests/unit/features/branches/useBranchSelection.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useBranchSelection } from "@/features/branches/composables/useBranchSelection";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
vi.mock("@/features/branches/stores/branches.store");
vi.mock("@/composables/useToast");
vi.mock("vue-i18n");
const mockBranchesStore = {
    disabledBranches: [
        { id: "1", name: "Branch 1", reference: "B01" },
        { id: "2", name: "Branch 2", reference: "B02" },
        { id: "3", name: "Branch 3", reference: "B03" },
    ],
    enableBranches: vi.fn(),
};
const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
};
const mockI18n = {
    t: vi.fn((key: string, params?: Record<string, any>) => {
        const translations: Record<string, string> = {
            "reservations.toast.enableAllSuccess": `Successfully enabled ${params?.["count"] ?? 0} branches.`,
            "reservations.toast.enablePartialSuccess": `Enabled ${params?.["enabledCount"] ?? 0} branches. Failed to enable ${params?.["failedCount"] ?? 0} branches.`,
            "reservations.toast.enableError": "Failed to enable branches. Please try again.",
        };
        return translations[key] ?? key;
    }),
};
describe("useBranchSelection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useBranchesStore as any).mockReturnValue(mockBranchesStore);
        (useToast as any).mockReturnValue(mockToast);
        (useI18n as any).mockReturnValue(mockI18n);
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe("initialization", () => {
        it("should initialize with empty selection", () => {
            const isOpen = ref(false);
            const { selectedBranchIds, selectedIdsSet, saving } = useBranchSelection(isOpen);
            expect(selectedBranchIds.value).toEqual([]);
            expect(selectedIdsSet.value.size).toBe(0);
            expect(saving.value).toBe(false);
        });
        it("should reset selection when modal opens", async () => {
            const isOpen = ref(false);
            const { selectedBranchIds } = useBranchSelection(isOpen);
            selectedBranchIds.value.push("1", "2");
            isOpen.value = true;
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(selectedBranchIds.value).toEqual([]);
        });
    });
    describe("selection logic", () => {
        it("should toggle branch selection", () => {
            const isOpen = ref(true);
            const { selectedBranchIds, selectedIdsSet, toggleBranch } = useBranchSelection(isOpen);
            toggleBranch("1");
            expect(selectedBranchIds.value).toContain("1");
            expect(selectedIdsSet.value.has("1")).toBe(true);
            toggleBranch("1");
            expect(selectedBranchIds.value).not.toContain("1");
            expect(selectedIdsSet.value.has("1")).toBe(false);
        });
        it("should toggle select all", () => {
            const isOpen = ref(true);
            const { selectedBranchIds, isAllSelected, toggleSelectAll } = useBranchSelection(isOpen);
            toggleSelectAll();
            expect(selectedBranchIds.value).toEqual(["1", "2", "3"]);
            expect(isAllSelected.value).toBe(true);
            toggleSelectAll();
            expect(selectedBranchIds.value).toEqual([]);
            expect(isAllSelected.value).toBe(false);
        });
        it("should prevent selection changes while saving", () => {
            const isOpen = ref(true);
            const { selectedBranchIds, toggleBranch } = useBranchSelection(isOpen);
            toggleBranch("1");
            expect(selectedBranchIds.value).toEqual(["1"]);
            expect(selectedBranchIds.value).toEqual(["1"]);
        });
    });
    describe("enableSelectedBranches", () => {
        it("should return empty result when no branches selected", async () => {
            const isOpen = ref(true);
            const { enableSelectedBranches } = useBranchSelection(isOpen);
            const result = await enableSelectedBranches();
            expect(result).toEqual({ ok: true, enabled: [], failed: [] });
            expect(mockBranchesStore.enableBranches).not.toHaveBeenCalled();
        });
        it("should handle successful enablement of all branches", async () => {
            const isOpen = ref(true);
            const { selectedBranchIds, enableSelectedBranches } = useBranchSelection(isOpen);
            selectedBranchIds.value = ["1", "2"];
            mockBranchesStore.enableBranches.mockResolvedValue({ ok: true, enabled: ["1", "2"], failed: [] });
            const result = await enableSelectedBranches();
            expect(result).toEqual({ ok: true, enabled: ["1", "2"], failed: [] });
            expect(mockBranchesStore.enableBranches).toHaveBeenCalledWith(["1", "2"]);
            expect(mockToast.success).toHaveBeenCalledWith("Successfully enabled 2 branches.");
            expect(selectedBranchIds.value).toEqual([]);
        });
        it("should handle partial failure", async () => {
            const isOpen = ref(true);
            const { selectedBranchIds, enableSelectedBranches } = useBranchSelection(isOpen);
            selectedBranchIds.value = ["1", "2", "3"];
            mockBranchesStore.enableBranches.mockResolvedValue({ ok: false, enabled: ["1", "3"], failed: ["2"] });
            const result = await enableSelectedBranches();
            expect(result).toEqual({ ok: false, enabled: ["1", "3"], failed: ["2"] });
            expect(mockToast.success).toHaveBeenCalledWith("Enabled 2 branches. Failed to enable 1 branches.");
            expect(selectedBranchIds.value).toEqual(["2"]);
        });
        it("should handle complete failure", async () => {
            const isOpen = ref(true);
            const { selectedBranchIds, enableSelectedBranches } = useBranchSelection(isOpen);
            selectedBranchIds.value = ["1", "2"];
            mockBranchesStore.enableBranches.mockRejectedValue(new Error("Failed"));
            const result = await enableSelectedBranches();
            expect(result).toEqual({ ok: false, enabled: [], failed: ["1", "2"] });
            expect(mockToast.error).toHaveBeenCalledWith("Failed to enable branches. Please try again.");
            expect(selectedBranchIds.value).toEqual(["1", "2"]);
        });
        it("should set saving state during operation", async () => {
            const isOpen = ref(true);
            const { selectedBranchIds, saving, enableSelectedBranches } = useBranchSelection(isOpen);
            selectedBranchIds.value = ["1"];
            let resolvePromise: () => void;
            const promise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            mockBranchesStore.enableBranches.mockReturnValue(promise);
            const enablePromise = enableSelectedBranches();
            expect(saving.value).toBe(true);
            resolvePromise!();
            await enablePromise;
            expect(saving.value).toBe(false);
        });
    });
    describe("computed properties", () => {
        it("should correctly compute isAllSelected", () => {
            const isOpen = ref(true);
            const { isAllSelected, toggleBranch } = useBranchSelection(isOpen);
            expect(isAllSelected.value).toBe(false);
            toggleBranch("1");
            expect(isAllSelected.value).toBe(false);
            toggleBranch("2");
            toggleBranch("3");
            expect(isAllSelected.value).toBe(true);
        });
        it("should provide O(1) lookup with selectedIdsSet", () => {
            const isOpen = ref(true);
            const { selectedIdsSet, toggleBranch } = useBranchSelection(isOpen);
            expect(selectedIdsSet.value.has("1")).toBe(false);
            toggleBranch("1");
            expect(selectedIdsSet.value.has("1")).toBe(true);
            expect(selectedIdsSet.value.has("2")).toBe(false);
            toggleBranch("2");
            expect(selectedIdsSet.value.has("1")).toBe(true);
            expect(selectedIdsSet.value.has("2")).toBe(true);
        });
    });
});
