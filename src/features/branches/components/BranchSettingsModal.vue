<script setup lang="ts">
import { computed } from "vue";

import { useI18n } from "vue-i18n";

import BaseButton from "@/components/ui/BaseButton.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import { TESTID_SETTINGS_MODAL } from "@/constants/testids";
import { useSettingsForm } from "@/features/branches/composables/useSettingsForm";
import type { ITable } from "@/types/foodics";

import DaySlots  from "@features/branches/components/DaySlots.vue";
import DurationField  from "@features/branches/components/ReservationSettingsModal/DurationField.vue";

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
    if (!duration.value || duration.value < 1) return false;
    return true;
});

function getTableDisplayName(table: ITable): string {
    const section = branch.value?.sections?.find(s =>
        s.tables?.some(t => t.id === table.id)
    );
    const sectionName = section?.name ?? 'Unknown';
    const tableName = table.name ?? table.id;
    return `${sectionName} - ${tableName}`;
}

function handleClose(): void {
    emit("close");
}
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    size="xl"
    :testid="TESTID_SETTINGS_MODAL"
    @update:model-value="handleClose"
  >
    <template #title>
      {{ branch ? t('settings.title', { branchName: branch.name }) : '' }}
    </template>

    <div v-if="branch" class="space-y-6">
      <div class="bg-blue-50 border-t-2 border-b-2 border-blue-500 px-4 py-3 text-blue-700" data-testid="working-hours-info">
        {{ t('settings.workingHours', { from: branch.opening_from, to: branch.opening_to }) }}
      </div>

      <DurationField
        v-model="duration"
      />

      <div data-testid="settings-tables">
        <label class="mb-2 block text-sm font-medium text-neutral-700">
          {{ t('settings.tables.label') }}
        </label>

        <div v-if="availableTables.length > 0" class="rounded-lg bg-neutral-50 p-4">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="table in availableTables"
              :key="table.id"
              :data-testid="`settings-tables-table-${table.id}`"
              class="rounded-full border-2 border-blue-500 bg-white px-4 py-2 text-sm text-neutral-900"
            >
              {{ getTableDisplayName(table) }}
            </div>
          </div>
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