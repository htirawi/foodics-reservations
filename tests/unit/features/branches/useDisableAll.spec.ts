/**
 * @file useDisableAll.spec.ts
 * @summary Module: tests/unit/features/branches/useDisableAll.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDisableAll } from "@/features/branches/composables/useDisableAll";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { useUIStore } from "@/stores/ui.store";
import { useToast } from "@/composables/useToast";
vi.mock("@/features/branches/stores/branches.store");
vi.mock("@/stores/ui.store");
vi.mock("@/composables/useToast");
vi.mock("vue-i18n", () => ({
    useI18n: () => ({
        t: (key: string) => key,
    }),
}));
describe("useDisableAll", () => {
    let mockBranchesStore: { disableAll: ReturnType<typeof vi.fn> };
    let mockUIStore: { confirm: ReturnType<typeof vi.fn> };
    let mockToast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
    beforeEach(() => {
        vi.clearAllMocks();
        mockBranchesStore = {
            disableAll: vi.fn(),
        };
        mockUIStore = {
            confirm: vi.fn(),
        };
        mockToast = {
            success: vi.fn(),
            error: vi.fn(),
        };
        vi.mocked(useBranchesStore).mockReturnValue(mockBranchesStore as unknown as ReturnType<typeof useBranchesStore>);
        vi.mocked(useUIStore).mockReturnValue(mockUIStore as unknown as ReturnType<typeof useUIStore>);
        vi.mocked(useToast).mockReturnValue(mockToast as unknown as ReturnType<typeof useToast>);
    });
    it("should initialize with correct state", () => {
        const { busy } = useDisableAll();
        expect(busy.value).toBe(false);
    });
    it("should show confirmation dialog before disabling", async () => {
        const { disableAll } = useDisableAll();
        mockUIStore.confirm.mockResolvedValue(true);
        mockBranchesStore.disableAll.mockResolvedValue(undefined);
        await disableAll();
        expect(mockUIStore.confirm).toHaveBeenCalledWith({
            title: "reservations.confirm.disableAll.title",
            message: "reservations.confirm.disableAll.message",
            confirmText: "reservations.confirm.disableAll.confirm",
            cancelText: "reservations.confirm.disableAll.cancel",
            variant: "danger",
        });
    });
    it("should disable all branches when confirmed", async () => {
        const { disableAll } = useDisableAll();
        mockUIStore.confirm.mockResolvedValue(true);
        mockBranchesStore.disableAll.mockResolvedValue(undefined);
        await disableAll();
        expect(mockBranchesStore.disableAll).toHaveBeenCalledOnce();
        expect(mockToast.success).toHaveBeenCalledWith("reservations.toast.disableAllSuccess");
    });
    it("should not disable when user cancels confirmation", async () => {
        const { disableAll } = useDisableAll();
        mockUIStore.confirm.mockResolvedValue(false);
        await disableAll();
        expect(mockBranchesStore.disableAll).not.toHaveBeenCalled();
        expect(mockToast.success).not.toHaveBeenCalled();
        expect(mockToast.error).not.toHaveBeenCalled();
    });
    it("should show error toast when disable fails", async () => {
        const { disableAll } = useDisableAll();
        mockUIStore.confirm.mockResolvedValue(true);
        mockBranchesStore.disableAll.mockRejectedValue(new Error("Disable failed"));
        await disableAll();
        expect(mockToast.error).toHaveBeenCalledWith("reservations.toast.disableAllError");
        expect(mockToast.success).not.toHaveBeenCalled();
    });
    it("should set busy state during operation", async () => {
        const { busy, disableAll } = useDisableAll();
        mockUIStore.confirm.mockResolvedValue(true);
        mockBranchesStore.disableAll.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        const disablePromise = disableAll();
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(busy.value).toBe(true);
        await disablePromise;
        expect(busy.value).toBe(false);
    });
});
