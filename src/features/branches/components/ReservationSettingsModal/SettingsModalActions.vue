<script setup lang="ts">
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/ui/BaseButton.vue";

defineProps<{
    canSave: boolean;
    isSaving: boolean;
    isDisabling: boolean;
}>();

const emit = defineEmits<{
    save: [];
    disable: [];
    close: [];
}>();

const { t } = useI18n();
</script>

<template>
  <BaseButton
    variant="danger"
    data-testid="disable-button"
    :disabled="isDisabling || isSaving"
    @click="emit('disable')"
  >
    <span v-if="isDisabling" class="inline-flex items-center gap-2">
      <svg
        class="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {{ t('settings.actions.disabling') }}
    </span>
    <span v-else>{{ t('settings.actions.disableReservations') }}</span>
  </BaseButton>
  <div class="flex gap-3">
    <BaseButton
      variant="ghost"
      data-testid="settings-cancel"
      :disabled="isSaving || isDisabling"
      @click="emit('close')"
    >
      {{ t('settings.actions.close') }}
    </BaseButton>
    <BaseButton
      variant="primary"
      :disabled="!canSave || isSaving || isDisabling"
      data-testid="save-button"
      @click="emit('save')"
    >
      <span v-if="isSaving" class="inline-flex items-center gap-2">
        <svg
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ t('settings.actions.saving') }}
      </span>
      <span v-else>{{ t('settings.actions.save') }}</span>
    </BaseButton>
  </div>
</template>
