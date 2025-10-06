<template>
  <div
    :data-testid="dataTestid"
    class="bg-white rounded-card shadow-sm border border-neutral-200 overflow-hidden"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">/**
 * @file BaseCard.vue
 * @summary Module: src/components/ui/BaseCard.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
defineProps<{
    dataTestid?: string;
}>();
</script>
