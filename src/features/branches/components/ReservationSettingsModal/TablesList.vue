<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Section } from '@/types/foodics';

defineProps<{
  sections: Section[] | undefined;
}>();

const { t } = useI18n();
</script>

<template>
  <div data-testid="settings-tables">
    <label class="mb-2 block text-sm font-medium text-neutral-700">
      {{ t('settings.tables.label') }}
    </label>
    <div v-if="sections && sections.length > 0" class="space-y-3">
      <div
        v-for="section in sections"
        :key="section.id"
        class="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
        :data-testid="`section-${section.id}`"
      >
        <div class="mb-2 text-sm font-medium text-neutral-900">
          {{ section.name ?? section.id }}
        </div>
        <div v-if="section.tables && section.tables.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="table in section.tables"
            :key="table.id"
            class="rounded-lg border-2 border-primary-500 bg-white px-3 py-1.5 text-sm"
            :data-testid="`table-${table.id}`"
          >
            {{ table.name ?? table.id }}
            <span v-if="table.seats" class="text-xs text-neutral-500">
              ({{ table.seats }} {{ t('settings.tables.seats') }})
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-neutral-500">
          {{ t('settings.tables.noTables') }}
        </p>
      </div>
    </div>
    <p v-else class="text-sm text-neutral-500">
      {{ t('settings.tables.noSections') }}
    </p>
  </div>
</template>

