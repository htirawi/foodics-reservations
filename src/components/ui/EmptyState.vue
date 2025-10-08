<template>
  <div
    :data-testid="TESTID_EMPTY_STATE"
    class="flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white p-8 text-center"
  >
    <svg
      class="mx-auto h-12 w-12 text-neutral-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 class="mt-4 text-lg font-semibold text-neutral-900">
      {{ title ?? $t('empty.title') }}
    </h3>
    <p class="mt-2 text-sm text-neutral-600">
      {{ description ?? $t('empty.description') }}
    </p>
    <div
      v-if="$slots['action'] || actionText"
      class="mt-6"
    >
      <slot name="action">
        <BaseButton
          v-if="actionText"
          variant="primary"
          @click="$emit('action')"
        >
          {{ actionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton.vue";
import { TESTID_EMPTY_STATE } from "@/constants/testids";

withDefaults(defineProps<{
    title?: string | undefined;
    description?: string | undefined;
    actionText?: string | undefined;
}>(), {
    title: "",
    description: "",
    actionText: "",
});
defineEmits<{
    action: [
    ];
}>();
</script>
