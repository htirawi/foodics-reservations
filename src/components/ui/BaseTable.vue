<script setup lang="ts">
defineProps<{
    dataTestid?: string;
}>();
</script>

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
