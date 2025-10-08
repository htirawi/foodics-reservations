<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { IBranch } from "@/types/foodics";

interface Props {
    branches: IBranch[];
    reservableCount: (branch: IBranch) => number;
}

interface Emits {
    (e: "open-settings", branchId: string): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();
const { t } = useI18n();

function handleRowClick(branchId: string): void {
    emit("open-settings", branchId);
}

function formatDuration(minutes: number): string {
    return t("reservations.duration.minutes", { count: minutes });
}
</script>

<template>
  <div class="overflow-x-auto">
    <table
      data-testid="branches-table"
      class="w-full border-collapse"
    >
      <thead>
        <tr class="border-b border-gray-200">
          <th scope="col" class="px-4 py-3 text-start text-sm font-medium text-gray-700">
            {{ $t('reservations.table.branch') }}
          </th>
          <th scope="col" class="px-4 py-3 text-start text-sm font-medium text-gray-700">
            {{ $t('reservations.table.reference') }}
          </th>
          <th scope="col" class="px-4 py-3 text-start text-sm font-medium text-gray-700">
            {{ $t('reservations.table.tablesCount') }}
          </th>
          <th scope="col" class="px-4 py-3 text-start text-sm font-medium text-gray-700">
            {{ $t('reservations.table.duration') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="branch in branches"
          :key="branch.id"
          :data-testid="`branch-row-${branch.id}`"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-1"
          role="button"
          tabindex="0"
          @click="handleRowClick(branch.id)"
          @keydown.enter="handleRowClick(branch.id)"
          @keydown.space.prevent="handleRowClick(branch.id)"
        >
          <td class="px-4 py-4 text-sm text-gray-900">
            {{ branch.name }}
          </td>
          <td class="px-4 py-4 text-sm text-gray-600">
            {{ branch.reference }}
          </td>
          <td class="px-4 py-4 text-sm text-gray-600">
            {{ reservableCount(branch) }}
          </td>
          <td class="px-4 py-4 text-sm text-gray-600">
            {{ formatDuration(branch.reservation_duration) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
