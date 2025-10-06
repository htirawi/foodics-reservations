<template>
  <div class="overflow-x-auto">
    <table :data-testid="dataTestid" class="w-full">
      <thead class="border-b border-neutral-200">
        <tr>
          <slot name="head" />
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">/**
 * @file BaseTable.vue
 * @summary Module: src/components/ui/BaseTable.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
defineProps<{
    dataTestid?: string;
}>();
</script>
