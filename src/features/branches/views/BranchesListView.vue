<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-neutral-900">
          {{ $t('reservations.title') }}
        </h1>
        <BaseButton
          v-if="enabledBranches.length > 0"
          variant="primary"
          data-testid="disable-all"
          @click="handleDisableAll"
        >
          {{ $t('reservations.disableAll') }}
        </BaseButton>
      </div>

      <PageLoading v-if="loading" />

      <EmptyState
        v-else-if="branches.length === 0"
        :title="$t('reservations.empty.title')"
        :description="$t('reservations.empty.description')"
      >
        <template #action>
          <BaseButton data-testid="add-branches" @click="handleAddBranches">
            {{ $t('reservations.empty.action') }}
          </BaseButton>
        </template>
      </EmptyState>

      <BaseCard v-else data-testid="branches-card">
        <div class="p-6">
          <div class="flex justify-end mb-4">
            <BaseButton
              variant="ghost"
              size="sm"
              data-testid="add-branches"
              @click="handleAddBranches"
            >
              {{ $t('reservations.addBranches') }}
            </BaseButton>
          </div>

          <BaseTable data-testid="branches-table">
            <template #head>
              <th class="px-6 py-4 text-start text-sm font-medium text-neutral-700">
                {{ $t('reservations.table.branch') }}
              </th>
              <th class="px-6 py-4 text-start text-sm font-medium text-neutral-700">
                {{ $t('reservations.table.reference') }}
              </th>
              <th class="px-6 py-4 text-start text-sm font-medium text-neutral-700">
                {{ $t('reservations.table.tablesCount') }}
              </th>
              <th class="px-6 py-4 text-start text-sm font-medium text-neutral-700">
                {{ $t('reservations.table.duration') }}
              </th>
            </template>
            <tr
              v-for="branch in branches"
              :key="branch.id"
              :data-testid="`branch-row-${branch.id}`"
              class="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              @click="handleRowClick(branch.id)"
            >
              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ branch.name }}
              </td>
              <td class="px-6 py-4 text-sm text-neutral-600">
                {{ branch.reference }}
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ reservableTablesCount(branch) }}
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ $t('reservations.duration.minutes', { count: branch.reservation_duration }) }}
              </td>
            </tr>
          </BaseTable>
        </div>
      </BaseCard>
    </div>

    <!-- Modals -->
    <BranchSettingsModal
      :branch-id="selectedBranchId"
      @close="handleCloseSettingsModal"
    />
    <AddBranchesModal
      :is-open="isAddBranchesModalOpen"
      @close="handleCloseAddBranchesModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import { useUIStore } from '@/stores/ui.store';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseTable from '@/components/ui/BaseTable.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import PageLoading from '@/components/ui/PageLoading.vue';
import BranchSettingsModal from '@/features/branches/components/BranchSettingsModal.vue';
import AddBranchesModal from '@/features/branches/components/AddBranchesModal.vue';

const branchesStore = useBranchesStore();
const uiStore = useUIStore();

const { branches, enabledBranches, loading, reservableTablesCount } = storeToRefs(branchesStore);

const selectedBranchId = ref<string | null>(null);
const isAddBranchesModalOpen = ref(false);

onMounted(async () => {
  try {
    await branchesStore.fetchBranches(true);
  } catch (err) {
    uiStore.notify('Failed to load branches', 'error');
  }
});

async function handleDisableAll(): Promise<void> {
  try {
    await branchesStore.disableAll();
    uiStore.notify('All reservations disabled successfully', 'success');
  } catch (err) {
    uiStore.notify('Failed to disable reservations', 'error');
  }
}

function handleAddBranches(): void {
  isAddBranchesModalOpen.value = true;
}

function handleRowClick(branchId: string): void {
  selectedBranchId.value = branchId;
}

function handleCloseSettingsModal(): void {
  selectedBranchId.value = null;
}

function handleCloseAddBranchesModal(): void {
  isAddBranchesModalOpen.value = false;
}
</script>
