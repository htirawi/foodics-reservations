<script setup lang="ts">
import { toRef } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { useBranchSelection } from '@/features/branches/composables/useBranchSelection';

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

// Extract complex logic to composable
const {
  selectedBranchIds,
  selectedIdsSet,
  disabledBranches,
  isAllSelected,
  saving,
  toggleBranch,
  toggleSelectAll,
  enableSelectedBranches,
} = useBranchSelection(toRef(props, 'isOpen'));

function handleSave(): void {
  enableSelectedBranches().then((result) => {
    // Only close modal if all branches were successfully enabled
    if (result.ok) {
      emit('close');
    }
  });
}

function handleClose(): void {
  if (!saving.value) {
    emit('close');
  }
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

    <div class="space-y-4" :aria-busy="saving">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-medium text-neutral-700">
            {{ t('addBranches.branchesLabel') }}
          </label>
          <button
            v-if="disabledBranches.length > 0"
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
            :disabled="saving"
            data-testid="select-all"
            @click="toggleSelectAll"
          >
            {{ isAllSelected ? t('app.deselectAll') : t('app.selectAll') }}
          </button>
        </div>

        <div v-if="disabledBranches.length > 0" class="space-y-2">
          <label
            v-for="branch in disabledBranches"
            :key="branch.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            :data-testid="`branch-${branch.id}`"
            :for="branch.id"
          >
            <input
              :id="branch.id"
              type="checkbox"
              :checked="selectedIdsSet.has(branch.id)"
              :disabled="saving"
              class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed"
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
        :disabled="saving"
        data-testid="close-button"
        @click="handleClose"
      >
        {{ t('addBranches.actions.close') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="selectedBranchIds.length === 0 || saving"
        :loading="saving"
        data-testid="save-button"
        @click="handleSave"
      >
        {{ t('addBranches.actions.save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
