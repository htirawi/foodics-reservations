<script setup lang="ts">/**
 * @file TablesList.vue
 * @summary Read-only tables section for Reservation Settings modal
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ISection, ITable } from "@/types/foodics";
import { reservableTablesCount, formatTableLabel } from "@/utils/tables";

const props = withDefaults(
  defineProps<{
    sections: ISection[];
    reservableOnly?: boolean;
  }>(),
  {
    reservableOnly: false,
  }
);

const { t } = useI18n();

const reservableCount = computed<number>(() => {
  return reservableTablesCount(props.sections as unknown as ISection[]);
});

function filterReservableTables(tables: ITable[] | undefined): ITable[] {
  if (!tables) {
    return [];
  }
  return tables.filter((table: ITable) => table.accepts_reservations === true);
}

const filteredSections = computed<ISection[]>(() => {
  if (!props.reservableOnly) {
    return props.sections ?? [];
  }

  return (props.sections ?? [])
    .map((section) => ({
      ...section,
      tables: filterReservableTables(section.tables),
    }))
    .filter((section) => section.tables && section.tables.length > 0);
});
</script>

<template>
  <div data-testid="settings-tables">
    <h3 class="mb-2 text-sm font-medium text-neutral-700">
      {{ t('settings.tables.title') }}
    </h3>
    
    <p class="mb-3 text-sm text-neutral-500">
      {{ t('settings.tables.helper') }}
    </p>
    
    <div data-testid="settings-tables-summary" class="mb-4 text-sm font-medium text-primary-700">
      {{ t('settings.tables.summary', { count: reservableCount }) }}
    </div>

    <ul
      v-if="filteredSections.length > 0"
      role="list"
      data-testid="settings-tables-list"
      class="space-y-2"
    >
      <li
        v-for="section in filteredSections"
        :key="section.id"
        :data-testid="`settings-tables-section-${section.id}`"
      >
        <div
          v-if="section.tables && section.tables.length > 0"
          class="space-y-1"
        >
          <div
            v-for="table in section.tables"
            :key="table.id"
            :data-testid="`settings-tables-table-${table.id}`"
            class="text-sm text-neutral-700"
          >
            {{ formatTableLabel(section.name, table.name, t) }}
          </div>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="text-sm text-neutral-500"
    >
      {{ t('settings.tables.noSections') }}
    </p>
  </div>
</template>


