<script setup lang="ts">
import { onMounted, computed, defineAsyncComponent } from "vue";

import type { IApiError } from "@/types/api";

import BaseButton from "@/components/ui/BaseButton.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import PageLoading from "@/components/ui/PageLoading.vue";
import BranchesCards from "@/features/branches/components/BranchesCards.vue";
import BranchesTable from "@/features/branches/components/BranchesTable.vue";
import DisableAllButton from "@/features/branches/components/DisableAllButton.vue";

const AddBranchesModal = defineAsyncComponent(
  () => import("@/features/branches/components/AddBranchesModal.vue")
);
const BranchSettingsModal = defineAsyncComponent(
  () => import("@/features/branches/components/BranchSettingsModal.vue")
);

import { useApiErrorHandler } from "@/composables/useApiErrorHandler";

import { useModals } from "@/features/branches/composables/useModals";

import { useBranchesStore } from "@/features/branches/stores/branches.store";

const branchesStore = useBranchesStore();
const modals = useModals();
const { handleError } = useApiErrorHandler();

const loading = computed(() => branchesStore.loading);
const error = computed(() => branchesStore.error);
const enabledBranches = computed(() => branchesStore.enabledBranches);

onMounted(async () => {
    try {
        await branchesStore.fetchBranches(true);
    }
    catch (err) {
        handleError(err as IApiError, {
            clearStoreError: () => {
                branchesStore.error = null;
            },
        });
    }
});
</script>

<template>
  <div data-test-id="branches-page" class="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">

    <div class="mx-auto max-w-7xl mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ $t('reservations.title') }}
      </h1>
      <DisableAllButton
        :disabled="enabledBranches.length === 0"
      />
    </div>


    <div class="mx-auto max-w-7xl">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">

        <div class="flex justify-end px-6 py-4 border-b border-gray-200">
          <BaseButton
            data-testid="add-branches"
            variant="ghost"
            @click="modals.openAddModal"
          >
            {{ $t('reservations.addBranches') }}
          </BaseButton>
        </div>


        <div
          v-if="loading"
          data-testid="branches-loading"
          class="px-6 py-12"
        >
          <PageLoading />
        </div>


        <div
          v-else-if="error"
          data-testid="branches-error"
          class="px-6 py-8"
        >
          <div class="rounded-md bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
class="h-5 w-5 text-red-400"
viewBox="0 0 20 20"
fill="currentColor"
aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ms-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ $t('reservations.error.title') }}
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div
          v-else-if="enabledBranches.length === 0"
          data-testid="branches-empty"
          class="px-6 py-12"
        >
          <EmptyState
            :title="$t('reservations.empty.title')"
            :description="$t('reservations.empty.description')"
            :action-text="$t('reservations.empty.action')"
            @action="modals.openAddModal"
          />
        </div>


        <div v-else>

          <div class="hidden md:block">
            <BranchesTable
              :branches="enabledBranches"
              :reservable-count="(branch) => branchesStore.reservableTablesCount(branch)"
              @open-settings="modals.openSettingsModal"
            />
          </div>


          <div class="md:hidden">
            <BranchesCards
              :branches="enabledBranches"
              :reservable-count="(branch) => branchesStore.reservableTablesCount(branch)"
              @open-settings="modals.openSettingsModal"
            />
          </div>
        </div>
      </div>
    </div>


    <AddBranchesModal
      v-model="modals.showAddModal.value"
    />
    <BranchSettingsModal
      v-if="modals.selectedBranchId.value"
      :branch-id="modals.selectedBranchId.value"
      @close="modals.closeSettingsModal"
      @saved="modals.closeSettingsModal"
    />
  </div>
</template>
