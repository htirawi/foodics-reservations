import { ref } from "vue";
export function useModals() {
    const showAddModal = ref(false);
    const showSettingsModal = ref(false);
    const selectedBranchId = ref<string | null>(null);
    function openAddModal(): void {
        showAddModal.value = true;
    }
    function closeAddModal(): void {
        showAddModal.value = false;
    }
    function openSettingsModal(branchId: string): void {
        selectedBranchId.value = branchId;
        showSettingsModal.value = true;
    }
    function closeSettingsModal(): void {
        showSettingsModal.value = false;
        selectedBranchId.value = null;
    }
    return {
        showAddModal,
        showSettingsModal,
        selectedBranchId,
        openAddModal,
        closeAddModal,
        openSettingsModal,
        closeSettingsModal,
    };
}
