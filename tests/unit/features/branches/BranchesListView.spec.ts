import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import { ref } from "vue";
import BranchesListView from "@/features/branches/views/BranchesListView.vue";
import { useBranchesStore } from "@/features/branches/stores/branches.store";
import { useUIStore } from "@/stores/ui.store";
import * as useModalsModule from "@/features/branches/composables/useModals";
import { HTTP_STATUS_SERVER_ERROR_MIN } from "@/constants/http";
import type { IApiError } from "@/types/api";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      reservations: {
        title: "Reservations",
        addBranches: "Add Branches",
        empty: { title: "No branches", description: "Add branches to get started", action: "Add Branches" },
        error: { title: "Error loading branches" },
        toast: { fetchError: "Failed to fetch branches" },
      },
      errors: { server: { tryAgain: "Server error, please try again" } },
    },
  },
});

describe("BranchesListView", () => {
  let pinia: ReturnType<typeof createPinia>;
  let branchesStore: ReturnType<typeof useBranchesStore>;
  let uiStore: ReturnType<typeof useUIStore>;
  let mockModals: ReturnType<typeof useModalsModule.useModals>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    branchesStore = useBranchesStore();
    uiStore = useUIStore();

    mockModals = {
      showAddModal: ref(false),
      showSettingsModal: ref(false),
      selectedBranchId: ref<string | null>(null),
      openAddModal: vi.fn(),
      closeAddModal: vi.fn(),
      openSettingsModal: vi.fn(),
      closeSettingsModal: vi.fn(),
    };

    vi.spyOn(useModalsModule, "useModals").mockReturnValue(mockModals);

    // Reset store state
    branchesStore.loading = false;
    branchesStore.error = null;
    branchesStore.branches = [];
  });

  it("should render page with title", () => {
    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    expect(wrapper.find("h1").text()).toBe("Reservations");
  });

  it("should show loading state when loading", () => {
    branchesStore.loading = true;

    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: { template: '<div data-testid="loading">Loading...</div>' },
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="branches-loading"]').exists()).toBe(true);
  });

  it("should show error state when error exists", () => {
    branchesStore.loading = false;
    branchesStore.error = "Failed to load branches";

    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="branches-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Failed to load branches");
  });

  it("should show empty state when no enabled branches", () => {
    branchesStore.loading = false;
    branchesStore.error = null;
    branchesStore.branches = [];

    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: { template: '<div data-testid="empty-state">Empty</div>' },
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    expect(wrapper.find('[data-testid="branches-empty"]').exists()).toBe(true);
  });

  it("should show branches table when branches exist", () => {
    branchesStore.loading = false;
    branchesStore.error = null;
    branchesStore.branches = [
      {
        id: "1",
        name: "Branch 1",
        accepts_reservations: true,
        is_reservation_enabled: true,
        reservation_times: null,
      } as any,
    ];

    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: false,
          BranchesCards: true,
        },
      },
    });

    const branchesTable = wrapper.findComponent({ name: "BranchesTable" });
    expect(branchesTable.exists()).toBe(true);
  });

  it("should call openAddModal when add branches button is clicked", async () => {
    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: false,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    await wrapper.find('[data-testid="add-branches"]').trigger("click");
    expect(mockModals.openAddModal).toHaveBeenCalled();
  });

  it("should fetch branches on mount", async () => {
    const fetchSpy = vi.spyOn(branchesStore, "fetchBranches").mockResolvedValue();

    mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledWith(true);
  });

  it("should show toast for server errors (5xx) on mount", async () => {
    const serverError: IApiError = {
      message: "Internal Server Error",
      status: HTTP_STATUS_SERVER_ERROR_MIN,
    };

    vi.spyOn(branchesStore, "fetchBranches").mockRejectedValue(serverError);
    const notifySpy = vi.spyOn(uiStore, "notify");

    mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    await flushPromises();

    expect(notifySpy).toHaveBeenCalledWith("Server error, please try again", "error");
    expect(branchesStore.error).toBeNull();
  });

  it("should show toast for non-server errors on mount", async () => {
    const clientError: IApiError = {
      message: "Bad Request",
      status: 400,
    };

    vi.spyOn(branchesStore, "fetchBranches").mockRejectedValue(clientError);
    const notifySpy = vi.spyOn(uiStore, "notify");

    mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    await flushPromises();

    expect(notifySpy).toHaveBeenCalledWith("Failed to fetch branches", "error");
  });

  it("should render disable all button with correct disabled state", () => {
    branchesStore.branches = [];

    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: false,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    const disableAllButton = wrapper.findComponent({ name: "DisableAllButton" });
    expect(disableAllButton.props("disabled")).toBe(true);
  });

  it("should have correct data-test-id on page root", () => {
    const wrapper = mount(BranchesListView, {
      global: {
        plugins: [pinia, i18n],
        stubs: {
          BaseButton: true,
          DisableAllButton: true,
          PageLoading: true,
          EmptyState: true,
          AddBranchesModal: true,
          BranchSettingsModal: true,
          BranchesTable: true,
          BranchesCards: true,
        },
      },
    });

    expect(wrapper.find('[data-test-id="branches-page"]').exists()).toBe(true);
  });
});
