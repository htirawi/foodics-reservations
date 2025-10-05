<template>
  <div
    role="status"
    aria-busy="true"
    :aria-label="$t('loading.message')"
    data-testid="page-loading"
    class="flex min-h-64 flex-col items-center justify-center p-8"
  >
    <div class="relative h-12 w-12">
      <div class="absolute inset-0 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600"></div>
    </div>
    <p class="mt-4 text-sm font-medium text-neutral-600">
      {{ $t('loading.message') }}
    </p>
    <span class="sr-only">{{ $t('loading.message') }}</span>
  </div>
</template>

<script setup lang="ts">
// Empty - purely presentational component
</script>
