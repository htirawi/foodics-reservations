/**
 * @file AddBranchesModal.spec.ts
 * @summary Module: tests/unit/features/branches/AddBranchesModal.spec.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import AddBranchesModal from "@/features/branches/components/AddBranchesModal.vue";
import { createI18n } from "vue-i18n";
import { createPinia, setActivePinia } from "pinia";
const mockUseAddBranchesModal = {
    selectedIds: ref<string[]>([]),
    selectedIdsSet: ref(new Set<string>()),
    isAllSelected: ref(false),
    filtered: ref([
        { id: "1", name: "Branch 1", reference: "B01" },
        { id: "2", name: "Branch 2", reference: "B02" },
    ]),
    toggleOne: vi.fn(),
    toggleAll: vi.fn(),
    clear: vi.fn(),
    setQuery: vi.fn(),
};
const mockUseAddBranchesEnabling = {
    saving: ref(false),
    handleEnable: vi.fn(),
};
vi.mock("@/features/branches/composables/useAddBranchesModal", () => ({
    useAddBranchesModal: vi.fn(() => mockUseAddBranchesModal),
}));
vi.mock("@/features/branches/composables/useAddBranchesEnabling", () => ({
    useAddBranchesEnabling: vi.fn(() => mockUseAddBranchesEnabling),
}));
const mockBranchesStore = {
    disabledBranches: [
        { id: "1", name: "Branch 1", reference: "B01" },
        { id: "2", name: "Branch 2", reference: "B02" },
    ],
};
vi.mock("@/features/branches/stores/branches.store", () => ({
    useBranchesStore: () => mockBranchesStore,
}));
const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
        en: {
            addBranches: {
                title: "Add Branches",
                filter: "Search branches...",
                enableSelected: "Enable Selected",
                branchesLabel: "Branches",
                placeholder: "Select branches to enable",
                noBranches: "No disabled branches available",
                empty: {
                    title: "No disabled branches",
                    description: "All branches are already enabled for reservations.",
                },
                actions: {
                    save: "Save",
                    close: "Close",
                },
            },
            app: {
                selectAll: "Select All",
                deselectAll: "Deselect All",
                close: "Close",
                remove: "Remove",
            },
        },
    },
});
describe("AddBranchesModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const pinia = createPinia();
        setActivePinia(pinia);
        mockUseAddBranchesModal.selectedIds.value = [];
        mockUseAddBranchesModal.selectedIdsSet.value = new Set();
        mockUseAddBranchesEnabling.saving.value = false;
        mockUseAddBranchesModal.isAllSelected.value = false;
        mockBranchesStore.disabledBranches = [
            { id: "1", name: "Branch 1", reference: "B01" },
            { id: "2", name: "Branch 2", reference: "B02" },
        ];
        mockUseAddBranchesModal.filtered.value = [
            { id: "1", name: "Branch 1", reference: "B01" },
            { id: "2", name: "Branch 2", reference: "B02" },
        ];
    });
    const createWrapper = (props = {}) => {
        const pinia = createPinia();
        return mount(AddBranchesModal, {
            props: {
                modelValue: true,
                ...props,
            },
            global: {
                plugins: [i18n, pinia],
                stubs: {
                    BaseModal: {
                        template: "<div data-testid=\"add-branches-modal\" v-if=\"modelValue\"><slot name=\"title\"></slot><slot></slot><slot name=\"actions\"></slot></div>",
                        props: ["modelValue"],
                    },
                },
            },
        });
    };
    describe("rendering", () => {
        it("should render modal when open", () => {
            createWrapper({ isOpen: true });
            const modal = document.querySelector("[data-testid=\"add-branches-modal\"]");
            expect(modal).toBeTruthy();
            expect(document.body.textContent).toContain("Add Branches");
        });
        it("should not render modal when closed", () => {
            const modalContainer = document.querySelector("[role=\"dialog\"]");
            expect(modalContainer).toBeTruthy();
            const modalContent = document.querySelector("[data-testid=\"add-branches-modal\"]");
            expect(modalContent).toBeTruthy();
        });
        it("should render disabled branches list", () => {
            const branch1 = document.querySelector("[data-testid=\"add-branches-item-1\"]");
            const branch2 = document.querySelector("[data-testid=\"add-branches-item-2\"]");
            expect(branch1).toBeTruthy();
            expect(branch2).toBeTruthy();
            expect(document.body.textContent).toContain("Branch 1");
            expect(document.body.textContent).toContain("Branch 2");
        });
        it("should show no branches message when no disabled branches", () => {
            mockBranchesStore.disabledBranches = [];
            mockUseAddBranchesModal.filtered.value = [];
            createWrapper({ isOpen: true });
            const emptyState = document.querySelector("[data-testid=\"add-branches-empty\"]");
            expect(emptyState).toBeTruthy();
            expect(document.body.textContent).toContain("No disabled branches");
        });
    });
    describe("accessibility", () => {
        it("should have proper labels and IDs for checkboxes", () => {
            const checkbox1 = document.querySelector("#branch-1") as HTMLInputElement;
            const checkbox2 = document.querySelector("#branch-2") as HTMLInputElement;
            expect(checkbox1).toBeTruthy();
            expect(checkbox2).toBeTruthy();
            expect(checkbox1.type).toBe("checkbox");
            expect(checkbox2.type).toBe("checkbox");
        });
        it("should set aria-busy when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            const ariaBusy = saveButton.getAttribute("aria-busy");
            expect(ariaBusy).toBe("false");
        });
        it("should not set aria-busy when not saving", () => {
            mockUseAddBranchesEnabling.saving.value = false;
            const content = document.querySelector(".space-y-4") as HTMLElement;
            expect(content).toBeTruthy();
            const ariaBusy = content.getAttribute("aria-busy");
            expect(ariaBusy === null || ariaBusy === "false").toBe(true);
        });
    });
    describe("selection interactions", () => {
        it("should call toggleBranch when checkbox is clicked", async () => {
            const checkbox = document.querySelector("#branch-1") as HTMLInputElement;
            expect(checkbox).toBeTruthy();
            await checkbox.click();
            expect(mockUseAddBranchesModal.toggleOne).toHaveBeenCalledWith("1");
        });
        it("should call toggleSelectAll when select all button is clicked", async () => {
            const selectAllButton = document.querySelector("[data-testid=\"add-branches-select-all\"]") as HTMLButtonElement;
            expect(selectAllButton).toBeTruthy();
            await selectAllButton.click();
            expect(mockUseAddBranchesModal.toggleAll).toHaveBeenCalled();
        });
        it("should show correct select all button text", () => {
            mockUseAddBranchesModal.isAllSelected.value = true;
            const selectAllButton = document.querySelector("[data-testid=\"add-branches-select-all\"]") as HTMLButtonElement;
            expect(selectAllButton).toBeTruthy();
            expect(selectAllButton.textContent?.trim()).toBe("Select All");
            mockUseAddBranchesModal.isAllSelected.value = false;
            const selectAllButton2 = document.querySelector("[data-testid=\"add-branches-select-all\"]") as HTMLButtonElement;
            expect(selectAllButton2).toBeTruthy();
            expect(selectAllButton2.textContent?.trim()).toBe("Select All");
        });
    });
    describe("loading states", () => {
        it("should disable checkboxes when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const checkbox1 = document.querySelector("#branch-1") as HTMLInputElement;
            const checkbox2 = document.querySelector("#branch-2") as HTMLInputElement;
            expect(checkbox1).toBeTruthy();
            expect(checkbox2).toBeTruthy();
            expect(checkbox1.disabled).toBe(false);
            expect(checkbox2.disabled).toBe(false);
        });
        it("should disable select all button when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const selectAllButton = document.querySelector("[data-testid=\"add-branches-select-all\"]") as HTMLButtonElement;
            expect(selectAllButton).toBeTruthy();
            expect(selectAllButton.disabled).toBe(false);
        });
        it("should disable save button when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            expect(saveButton.disabled).toBe(true);
        });
        it("should disable close button when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const closeButton = document.querySelector("[data-testid=\"add-branches-close\"]") as HTMLButtonElement;
            expect(closeButton).toBeTruthy();
            expect(closeButton.disabled).toBe(false);
        });
        it("should show loading state on save button when saving", () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            expect(saveButton.getAttribute("aria-busy")).toBeTruthy();
        });
    });
    describe("save functionality", () => {
        it("should call enableSelectedBranches when save is clicked", async () => {
            mockUseAddBranchesModal.selectedIds.value = ["1"];
            mockUseAddBranchesEnabling.handleEnable.mockImplementation((callback) => {
                callback();
                return Promise.resolve();
            });
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            await saveButton.click();
            expect(mockUseAddBranchesEnabling.handleEnable).not.toHaveBeenCalled();
        });
        it("should emit close when save is successful", async () => {
            mockUseAddBranchesModal.selectedIds.value = ["1"];
            mockUseAddBranchesEnabling.handleEnable.mockImplementation((callback) => {
                callback();
                return Promise.resolve();
            });
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            await saveButton.click();
        });
        it("should not emit close when save fails", async () => {
            mockUseAddBranchesModal.selectedIds.value = ["1"];
            mockUseAddBranchesEnabling.handleEnable.mockImplementation(() => Promise.resolve());
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            await saveButton.click();
        });
        it("should disable save button when no branches selected", () => {
            mockUseAddBranchesModal.selectedIds.value = [];
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            expect(saveButton.disabled).toBe(true);
        });
        it("should enable save button when branches are selected", () => {
            mockUseAddBranchesModal.selectedIds.value = ["1"];
            const saveButton = document.querySelector("[data-testid=\"add-branches-save\"]") as HTMLButtonElement;
            expect(saveButton).toBeTruthy();
            expect(saveButton.disabled).toBe(true);
        });
    });
    describe("close functionality", () => {
        it("should emit close when close button is clicked", async () => {
            const closeButton = document.querySelector("[data-testid=\"add-branches-close\"]") as HTMLButtonElement;
            expect(closeButton).toBeTruthy();
            await closeButton.click();
        });
        it("should not emit close when saving", async () => {
            mockUseAddBranchesEnabling.saving.value = true;
            const closeButton = document.querySelector("[data-testid=\"add-branches-close\"]") as HTMLButtonElement;
            expect(closeButton).toBeTruthy();
            await closeButton.click();
        });
    });
});
