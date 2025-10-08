<script setup lang="ts">/**
 * @file BranchSettingsModal.vue
 * @summary Module: src/features/branches/components/BranchSettingsModal.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
// Vue core
import { computed } from "vue";
import { useI18n } from "vue-i18n";

// Type imports
import type { ITable } from "@/types/foodics";

// Components
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import DaySlots from "./DaySlots.vue";
import DurationField from "./ReservationSettingsModal/DurationField.vue";

// Composables
import { useSettingsForm } from "@/features/branches/composables/useSettingsForm";
const props = withDefaults(defineProps<{
    branchId: string | null;
}>(), {
    branchId: null,
});
const emit = defineEmits<{
    close: [
    ];
}>();
const { t } = useI18n();
const { isOpen, branch, duration, weekSlots, weekdays, availableTables, errors, addSlot, removeSlot, updateSlot, applyToAllDays, handleSave, handleDisable, } = useSettingsForm(props, () => emit("close"));
const canSave = computed<boolean>(() => {
    // Check if duration is valid
    if (!duration.value || duration.value < 1) return false;
    
    // Allow save if duration is valid
    return true;
});

function getTableDisplayName(table: ITable): string {
    // Find the section for this table
    const section = branch.value?.sections?.find(s => 
        s.tables?.some(t => t.id === table.id)
    );
    const sectionName = section?.name ?? 'Unknown';
    const tableName = table.name ?? table.id;
    return `${sectionName} – ${tableName}`;
}

function handleClose(): void {
    emit("close");
}
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    size="xl"
    data-testid="settings-modal"
    @update:model-value="handleClose"
  >
    <template #title>
      {{ branch ? t('settings.title', { branchName: branch.name }) : '' }}
    </template>

    <div v-if="branch" class="space-y-6">
      <div class="rounded-lg bg-primary-50 p-4 text-primary-700" data-testid="working-hours-info">
        {{ t('settings.workingHours', { from: branch.opening_from, to: branch.opening_to }) }}
      </div>

      <DurationField
        v-model="duration"
      />

      <div data-testid="settings-tables">
        <label class="mb-2 block text-sm font-medium text-neutral-700">
          {{ t('settings.tables.label') }}
        </label>
        
        <div v-if="availableTables.length > 0" class="space-y-3">
          <div data-testid="settings-tables-summary" class="text-sm text-neutral-600">
            {{ t('settings.tables.summary', { count: availableTables.length }) }}
          </div>
          
          <ul data-testid="settings-tables-list" role="list" class="space-y-2">
            <li
              v-for="table in availableTables"
              :key="table.id"
              :data-testid="`settings-tables-table-${table.id}`"
              class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm"
            >
              {{ getTableDisplayName(table) }}
            </li>
          </ul>
        </div>
        
        <p v-else class="text-sm text-neutral-500">
          {{ t('settings.tables.noTables') }}
        </p>
      </div>

      <div class="space-y-4" data-testid="settings-day-slots">
        <DaySlots
          v-for="day in weekdays"
          :key="day"
          :day="day"
          :slots="weekSlots[day]"
          :error="errors.slots?.[day]"
          @update:slot="(idx, field, val) => updateSlot(day, idx, field, val)"
          @add="() => addSlot(day)"
          @remove="(idx) => removeSlot(day, idx)"
          @apply-to-all="() => applyToAllDays(day)"
        />
      </div>
    </div>

    <template #actions>
      <BaseButton variant="danger" data-testid="disable-button" @click="handleDisable">
        {{ t('settings.actions.disableReservations') }}
      </BaseButton>
      <div class="flex gap-3">
        <BaseButton variant="ghost" data-testid="settings-cancel" @click="handleClose">
          {{ t('settings.actions.close') }}
        </BaseButton>
        <BaseButton
variant="primary"
:disabled="!canSave"
data-testid="save-button"
@click="handleSave">
          {{ t('settings.actions.save') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>