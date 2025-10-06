<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Branch, UpdateBranchSettingsPayload } from '@/types/foodics';
import UiModal from '@/components/ui/UiModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import DurationField from './DurationField.vue';
import TablesList from './TablesList.vue';
import DaySlotsEditor from './DaySlotsEditor.vue';

const props = defineProps<{
  branch: Branch | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  save: [payload: UpdateBranchSettingsPayload];
  close: [];
}>();

const { t } = useI18n();

const duration = ref<number | null>(null);
const reservationTimes = ref(props.branch?.reservation_times ?? {
  saturday: [],
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
});

const isDurationValid = ref<boolean>(false);
const areSlotsValid = ref<boolean>(false);

const isFormValid = computed<boolean>(() => {
  return props.branch !== null && isDurationValid.value && areSlotsValid.value;
});

watch(() => props.branch, (newBranch) => {
  if (newBranch) {
    duration.value = newBranch.reservation_duration;
    reservationTimes.value = { ...newBranch.reservation_times };
  }
}, { immediate: true });

function handleSave(): void {
  if (!isFormValid.value || duration.value === null) return;

  const payload: UpdateBranchSettingsPayload = {
    reservation_duration: duration.value,
    reservation_times: reservationTimes.value,
  };

  emit('save', payload);
}

function handleClose(): void {
  emit('close');
}
</script>

<template>
  <UiModal
    :is-open="isOpen"
    size="xl"
    aria-labelledby="settings-modal-title"
    data-testid="settings-modal"
    @close="handleClose"
  >
    <template #title>
      <div id="settings-modal-title">
        {{ branch ? t('settings.title', { branchName: branch.name }) : t('settings.title', { branchName: '' }) }}
      </div>
    </template>

    <div v-if="branch" class="space-y-6">
      <div class="rounded-lg bg-primary-50 p-4 text-sm text-primary-700" data-testid="working-hours-info">
        {{ t('settings.workingHours', { from: branch.opening_from, to: branch.opening_to }) }}
      </div>

      <DurationField
        v-model="duration"
        @valid:duration="(valid) => isDurationValid = valid"
      />

      <TablesList :sections="branch.sections" />

      <DaySlotsEditor
        v-model="reservationTimes"
        @update:valid="(valid) => areSlotsValid = valid"
      />
    </div>

    <div v-else class="py-8 text-center text-neutral-500">
      {{ t('settings.noBranch') }}
    </div>

    <template #actions>
      <BaseButton
        variant="ghost"
        data-testid="settings-cancel"
        @click="handleClose"
      >
        {{ t('settings.actions.close') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!isFormValid"
        data-testid="settings-save"
        @click="handleSave"
      >
        {{ t('settings.actions.save') }}
      </BaseButton>
    </template>
  </UiModal>
</template>

