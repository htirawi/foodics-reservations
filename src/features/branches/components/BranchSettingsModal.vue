<script setup lang="ts">
import { computed, watch, nextTick } from "vue";

import { useI18n } from "vue-i18n";

import BaseModal from "@/components/ui/BaseModal.vue";
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts";
import { TESTID_SETTINGS_MODAL } from "@/constants/testids";
import { useSettingsForm } from "@/features/branches/composables/useSettingsForm";

import DaySlots  from "@features/branches/components/DaySlots.vue";
import DurationField  from "@features/branches/components/ReservationSettingsModal/DurationField.vue";
import SettingsModalActions  from "@features/branches/components/ReservationSettingsModal/SettingsModalActions.vue";

const props = withDefaults(defineProps<{
    branchId: string | null;
}>(), {
    branchId: null,
});

const emit = defineEmits<{
    close: [];
}>();

const { t } = useI18n();
const { isOpen, branch, duration, weekSlots, weekdays, availableTables, errors, getTableDisplayName, addSlot, removeSlot, updateSlot, applyToAllDays, handleSave, handleDisable, handleClose, isSaving, isDisabling } = useSettingsForm(props, () => emit("close"));

const canSave = computed<boolean>(() => {
    if (!duration.value || duration.value < 1) return false;
    if (errors.value.duration) return false;
    if (errors.value.slots && Object.keys(errors.value.slots).length > 0) return false;
    return true;
});

const isKeyboardEnabled = computed(() => isOpen.value && !isSaving.value && !isDisabling.value);
useKeyboardShortcuts({
    isEnabled: isKeyboardEnabled,
    onEscape: handleClose,
    onSave: handleSave,
    canSave,
});

watch(isOpen, async (open) => {
    if (open) {
        await nextTick();
        const durationInput = document.querySelector('[data-testid="duration-input"]') as HTMLInputElement;
        if (durationInput) {
            durationInput.focus();
        }
    }
});
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    size="xl"
    :testid="TESTID_SETTINGS_MODAL"
    role="dialog"
    aria-labelledby="settings-modal-title"
    aria-describedby="settings-modal-description"
    @update:model-value="handleClose"
  >
    <template #title>
      <span id="settings-modal-title">
        {{ branch ? t('settings.title', { branchName: branch.name }) : '' }}
      </span>
    </template>

    <!-- Loading skeleton -->
    <div v-if="isOpen && !branch" class="space-y-6 animate-pulse">
      <div class="h-12 bg-neutral-200 rounded"></div>
      <div class="h-20 bg-neutral-200 rounded"></div>
      <div class="h-32 bg-neutral-200 rounded"></div>
      <div class="h-96 bg-neutral-200 rounded"></div>
    </div>

    <div v-else-if="branch" class="space-y-6">
      <div
        id="settings-modal-description"
        class="bg-blue-50 border-t-2 border-b-2 border-blue-500 px-4 py-3 text-blue-700"
        data-testid="working-hours-info"
        role="status"
        aria-live="polite"
      >
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
      <SettingsModalActions
        :can-save="canSave"
        :is-saving="isSaving"
        :is-disabling="isDisabling"
        @save="handleSave"
        @disable="handleDisable"
        @close="handleClose"
      />
    </template>
  </BaseModal>
</template>