<template>
  <div class="divide-y divide-gray-100">
    <div
      v-for="branch in branches"
      :key="branch.id"
      :data-testid="`branch-card-${branch.id}`"
      class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      role="button"
      tabindex="0"
      @click="handleCardClick(branch.id)"
      @keydown.enter="handleCardClick(branch.id)"
      @keydown.space.prevent="handleCardClick(branch.id)"
    >
      <div class="space-y-2">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-sm font-medium text-gray-900">
              {{ branch.name }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ $t('reservations.table.reference') }}: {{ branch.reference }}
            </p>
          </div>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">
            {{ $t('reservations.table.tablesCount') }}:
          </span>
          <span class="font-medium text-gray-900">
            {{ reservableCount(branch) }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">
            {{ $t('reservations.table.duration') }}:
          </span>
          <span class="font-medium text-gray-900">
            {{ formatDuration(branch.reservation_duration) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">/**
 * @file BranchesCards.vue
 * @summary Module: src/features/branches/components/BranchesCards.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { useI18n } from "vue-i18n";
import type { Branch } from "@/types/foodics";
interface Props {
    branches: Branch[];
    reservableCount: (branch: Branch) => number;
}
interface Emits {
    (e: "open-settings", branchId: string): void;
}
defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();
function handleCardClick(branchId: string): void {
    emit("open-settings", branchId);
}
function formatDuration(minutes: number): string {
    return t("reservations.duration.minutes", { count: minutes });
}
</script>

