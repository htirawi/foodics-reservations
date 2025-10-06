<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsForm } from '@/features/branches/composables/useSettingsForm';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import DaySlots from './DaySlots.vue';
import DurationField from './ReservationSettingsModal/DurationField.vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    branchId: string | null;
  }>(),
  {
    branchId: null,
  }
);

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const {
  isOpen,
  branch,
  duration,
  weekSlots,
  weekdays,
  availableTables,
  errors,
  addSlot,
  removeSlot,
  updateSlot,
  applyToAllDays,
  handleSave,
  handleDisable,
} = useSettingsForm(props, () => emit('close'));

const canSave = computed<boolean>(() => {
  return false;
});

function handleClose(): void {
  emit('close');
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
        <div v-if="availableTables.length > 0" class="flex flex-wrap gap-2">
          <div
            v-for="table in availableTables"
            :key="table.id"
            class="rounded-lg border-2 border-primary-500 bg-white px-4 py-2 text-sm"
            data-testid="table-pill"
          >
            {{ table.name ?? table.id }}
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