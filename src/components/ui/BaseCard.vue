<template>
  <div
    :data-testid="dataTestid"
    class="bg-white rounded-card shadow-sm border border-neutral-200 overflow-hidden"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
    dataTestid?: string;
}>();
</script>
