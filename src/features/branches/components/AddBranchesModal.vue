<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBranchesStore } from '@/features/branches/stores/branches.store';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {
    isOpen: false,
  }
);

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const branchesStore = useBranchesStore();

const selectedBranchIds = ref<string[]>([]);

const disabledBranches = computed(() => branchesStore.disabledBranches);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedBranchIds.value = [];
    }
  }
);

function toggleBranch(branchId: string): void {
  const index = selectedBranchIds.value.indexOf(branchId);
  if (index > -1) {
    selectedBranchIds.value.splice(index, 1);
  } else {
    selectedBranchIds.value.push(branchId);
  }
}

function toggleSelectAll(): void {
  if (selectedBranchIds.value.length === disabledBranches.value.length) {
    selectedBranchIds.value = [];
  } else {
    selectedBranchIds.value = disabledBranches.value.map((b) => b.id);
  }
}

const isAllSelected = computed(
  () => selectedBranchIds.value.length > 0 &&
    selectedBranchIds.value.length === disabledBranches.value.length
);

async function handleSave(): Promise<void> {
  if (selectedBranchIds.value.length === 0) {
    emit('close');
    return;
  }

  try {
    await branchesStore.enableBranches(selectedBranchIds.value);
    emit('close');
  } catch (err) {
    // Error already handled by store
  }
}

function handleClose(): void {
  emit('close');
}
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    size="md"
    data-testid="add-branches-modal"
    @update:model-value="handleClose"
  >
    <template #title>
      {{ t('addBranches.title') }}
    </template>

    <div class="space-y-4">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-medium text-neutral-700">
            {{ t('addBranches.branchesLabel') }}
          </label>
          <button
            v-if="disabledBranches.length > 0"
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700"
            data-testid="select-all"
            @click="toggleSelectAll"
          >
            {{ isAllSelected ? t('app.deselectAll', 'Deselect All') : t('app.selectAll', 'Select All') }}
          </button>
        </div>

        <div v-if="disabledBranches.length > 0" class="space-y-2">
          <label
            v-for="branch in disabledBranches"
            :key="branch.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
            :data-testid="`branch-${branch.id}`"
          >
            <input
              type="checkbox"
              :checked="selectedBranchIds.includes(branch.id)"
              class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              @change="toggleBranch(branch.id)"
            />
            <span class="text-sm text-neutral-900">
              {{ branch.name }} ({{ branch.reference }})
            </span>
          </label>
        </div>

        <p v-else class="text-sm text-neutral-500" data-testid="no-branches">
          {{ t('addBranches.noBranches') }}
        </p>
      </div>
    </div>

    <template #actions>
      <BaseButton
        variant="ghost"
        data-testid="close-button"
        @click="handleClose"
      >
        {{ t('addBranches.actions.close') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="selectedBranchIds.length === 0"
        data-testid="save-button"
        @click="handleSave"
      >
        {{ t('addBranches.actions.save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
