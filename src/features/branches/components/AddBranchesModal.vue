<script setup lang="ts">
import { ref, watch, computed } from "vue";

import { useI18n } from "vue-i18n";

import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import UiModal from "@/components/ui/UiModal.vue";
import { useDebounceFn } from "@/composables/useDebounce";
import { useToast } from "@/composables/useToast";
import { useAddBranchesEnabling } from "@/features/branches/composables/useAddBranchesEnabling";
import { useAddBranchesModal } from "@/features/branches/composables/useAddBranchesModal";
import { useBranchesStore } from "@/features/branches/stores/branches.store";

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    "update:modelValue": [
        value: boolean
    ];
}>();

const { t } = useI18n();
const toast = useToast();
const branchesStore = useBranchesStore();
const { setQuery, filtered, selectedIds, selectedIdsSet, isAllSelected, toggleOne, toggleAll, clear, } = useAddBranchesModal(computed(() => branchesStore.disabledBranches));
const { saving, handleEnable } = useAddBranchesEnabling(selectedIds, clear, toast, t);

const debouncedQuery = ref("");
const debouncedSetQuery = useDebounceFn((value: string) => setQuery(value), 200);

function handleFilterChange(value: string): void { debouncedQuery.value = value; debouncedSetQuery(value); }

function handleSave(): void { handleEnable(() => emit("update:modelValue", false)); }

function handleClose(): void { if (!saving.value) {
    clear();
    emit("update:modelValue", false);
} }

watch(() => props.modelValue, (isOpen) => { if (!isOpen)
    clear(); });
</script>

<template>
  <UiModal
    :is-open="modelValue"
    aria-labelledby="add-branches-title"
    size="lg"
    @close="handleClose">
    <template #title>
      <span>{{ $t('addBranches.title') }}</span>
    </template>
    <div data-testid="add-branches-modal">
      <EmptyState
        v-if="branchesStore.disabledBranches.length === 0"
        data-testid="add-branches-empty"
        :title="$t('addBranches.empty.title')"
        :description="$t('addBranches.empty.description')"
      />
      <div v-else class="space-y-4">
        <BaseInput
          :model-value="debouncedQuery"
          :placeholder="$t('addBranches.filter')"
          data-testid="add-branches-filter"
          @update:model-value="handleFilterChange"
        />
        <div class="flex items-center justify-between border-b border-gray-200 pb-3">
          <span class="text-sm font-medium text-gray-700">{{ $t('addBranches.branchesLabel') }}</span>
          <button
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
            data-testid="add-branches-select-all"
            @click="toggleAll"
          >
            {{ isAllSelected ? $t('app.deselectAll') : $t('app.selectAll') }}
          </button>
        </div>
        <div data-testid="add-branches-list" class="max-h-96 space-y-2 overflow-y-auto">
          <label
            v-for="branch in filtered"
            :key="branch.id"
            :data-testid="`add-branches-item-${branch.id}`"
            class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'bg-primary-50 border-primary-300': selectedIdsSet.has(branch.id) }"
          >
            <input
              :id="`branch-${branch.id}`"
              type="checkbox"
              :checked="selectedIdsSet.has(branch.id)"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              @change="toggleOne(branch.id)"
            >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ branch.name }}</p>
              <p v-if="branch.reference" class="text-sm text-gray-500 truncate">{{ branch.reference }}</p>
            </div>
          </label>
          <p v-if="filtered.length === 0" class="py-8 text-center text-sm text-gray-500">
            {{ $t('empty.title') }}
          </p>
        </div>
      </div>
    </div>

    <template #actions>
      <BaseButton variant="ghost" data-testid="add-branches-close" @click="handleClose">
        {{ $t('addBranches.actions.close') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="selectedIds.length === 0 || saving"
        :loading="saving"
        :aria-busy="saving"
        data-testid="add-branches-save"
        @click="handleSave"
      >
        <span v-if="saving" class="flex items-center gap-2">
          <svg
class="animate-spin h-4 w-4"
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24">
            <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ $t('addBranches.actions.save') }}
        </span>
        <span v-else>{{ $t('addBranches.enableSelected') }}</span>
      </BaseButton>
    </template>
  </UiModal>
</template>
