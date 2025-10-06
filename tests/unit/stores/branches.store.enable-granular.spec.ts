/**
 * @file branches.store.enable-granular.spec.ts
 * @summary Module: tests/unit/stores/branches.store.enable-granular.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ApiError } from "@/types/api";
import { setActivePinia, createPinia } from "pinia";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { BranchesService } from "@/services/branches.service";
import type { Branch } from "@/types/foodics";
vi.mock("@/services/branches.service");
function createBranch(id: string, name: string, acceptsReservations = false): Branch {
    return {
        id,
        name,
        reference: `REF-${id}`,
        name_localized: name,
        accepts_reservations: acceptsReservations,
        reservation_duration: 60,
        reservation_times: {
            saturday: [],
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
        },
        type: 1,
        receives_online_orders: false,
        opening_from: "09:00:00",
        opening_to: "23:00:00",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        deleted_at: null,
    };
}
describe("useBranchesStore - enableBranches granular", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });
    it("returns ok:true when all branches enabled successfully", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockResolvedValue(createBranch("1", "Branch 1", true));
        const result = await store.enableBranches(["1", "2"]);
        expect(result).toEqual({
            ok: true,
            enabled: ["1", "2"],
            failed: [],
        });
    });
    it("updates state optimistically and keeps changes on success", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockResolvedValue(createBranch("1", "Branch 1", true));
        await store.enableBranches(["1"]);
        const branch1 = store.branches.find((b) => b.id === "1");
        expect(branch1?.accepts_reservations).toBe(true);
    });
    it("returns ok:false when some branches fail", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
            createBranch("3", "Branch 3", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockImplementation((id: string) => {
            if (id === "2") {
                return Promise.reject(new Error("Failed to enable branch 2"));
            }
            return Promise.resolve(createBranch(id, `Branch ${id}`, true));
        });
        const result = await store.enableBranches(["1", "2", "3"]);
        expect(result).toEqual({
            ok: false,
            enabled: ["1", "3"],
            failed: ["2"],
        });
    });
    it("partially rolls back state when some fail", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockImplementation((id: string) => {
            if (id === "2") {
                return Promise.reject(new Error("Failed"));
            }
            return Promise.resolve(createBranch(id, `Branch ${id}`, true));
        });
        await store.enableBranches(["1", "2"]);
        const branch1 = store.branches.find((b) => b.id === "1");
        const branch2 = store.branches.find((b) => b.id === "2");
        expect(branch1?.accepts_reservations).toBe(true);
        expect(branch2?.accepts_reservations).toBe(false);
    });
    it("returns ok:false when all fail", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockRejectedValue({
            message: "Network error",
            status: 500,
        } as ApiError);
        await expect(store.enableBranches(["1", "2"])).rejects.toMatchObject({
            message: "Network error",
            status: 500,
        });
    });
    it("sets error message when all fail", async () => {
        const store = useBranchesStore();
        store.branches = [createBranch("1", "Branch 1", false)];
        vi.mocked(BranchesService.enableBranch).mockRejectedValue({
            message: "API is down",
        });
        await expect(store.enableBranches(["1"])).rejects.toMatchObject({
            message: "API is down",
        });
        expect(store.error).toBe("API is down");
    });
    it("does not set error when some succeed", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockImplementation((id: string) => {
            if (id === "2") {
                return Promise.reject(new Error("Failed"));
            }
            return Promise.resolve(createBranch(id, `Branch ${id}`, true));
        });
        store.error = null;
        await store.enableBranches(["1", "2"]);
        expect(store.error).toBeNull();
    });
    it("calls BranchesService.enableBranch for each ID", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
            createBranch("3", "Branch 3", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockResolvedValue(createBranch("1", "Branch 1", true));
        await store.enableBranches(["1", "2", "3"]);
        expect(BranchesService.enableBranch).toHaveBeenCalledTimes(3);
        expect(BranchesService.enableBranch).toHaveBeenCalledWith("1");
        expect(BranchesService.enableBranch).toHaveBeenCalledWith("2");
        expect(BranchesService.enableBranch).toHaveBeenCalledWith("3");
    });
    it("handles empty array", async () => {
        const store = useBranchesStore();
        store.branches = [createBranch("1", "Branch 1", false)];
        const result = await store.enableBranches([]);
        expect(result).toEqual({
            ok: true,
            enabled: [],
            failed: [],
        });
    });
    it("returns correct failed IDs in order", async () => {
        const store = useBranchesStore();
        store.branches = [
            createBranch("1", "Branch 1", false),
            createBranch("2", "Branch 2", false),
            createBranch("3", "Branch 3", false),
            createBranch("4", "Branch 4", false),
        ];
        vi.mocked(BranchesService.enableBranch).mockImplementation((id: string) => {
            if (id === "2" || id === "4") {
                return Promise.reject(new Error("Failed"));
            }
            return Promise.resolve(createBranch(id, `Branch ${id}`, true));
        });
        const result = await store.enableBranches(["1", "2", "3", "4"]);
        expect(result.failed).toEqual(["2", "4"]);
        expect(result.enabled).toEqual(["1", "3"]);
    });
});
