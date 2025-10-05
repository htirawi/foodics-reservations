<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :data-testid="dataTestid"
    class="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dataTestid?: string;
}>();
</script>
