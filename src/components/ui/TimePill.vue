<script setup lang="ts">
withDefaults(
  defineProps<{
    from?: string;
    to?: string;
    timeRange?: string;
    removable?: boolean;
    editable?: boolean;
    dataTestid?: string | undefined;
  }>(),
  {
    from: '',
    to: '',
    timeRange: '',
    removable: false,
    editable: false,
  }
);

const emit = defineEmits<{
  'update:from': [value: string];
  'update:to': [value: string];
  remove: [];
}>();

function handleFromChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update:from', target.value);
}

function handleToChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update:to', target.value);
}

function handleRemove(): void {
  emit('remove');
}
</script>

<template>
  <div
    v-if="editable"
    class="inline-flex items-center gap-2 rounded-lg border-2 border-primary-600 bg-white px-4 py-2.5"
    :data-testid="dataTestid"
  >
    <input
      type="time"
      :value="from"
      class="w-24 rounded border-none bg-transparent text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @input="handleFromChange"
    />
    <span class="text-sm text-neutral-500">-</span>
    <input
      type="time"
      :value="to"
      class="w-24 rounded border-none bg-transparent text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @input="handleToChange"
    />
    <button
      v-if="removable"
      type="button"
      :aria-label="$t('app.remove', 'Remove')"
      class="ms-2 rounded text-neutral-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @click="handleRemove"
    >
      <svg
class="h-4 w-4"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor">
        <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  <div
    v-else
    :data-testid="dataTestid"
    class="inline-flex items-center gap-2 rounded-lg border-2 border-primary-600 bg-white px-4 py-2.5 text-neutral-900"
  >
    <span class="text-sm font-medium">{{ timeRange || `${from} - ${to}` }}</span>
    <button
      v-if="removable"
      type="button"
      :aria-label="$t('app.remove', 'Remove')"
      class="rounded text-neutral-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @click="handleRemove"
    >
      <svg
class="h-4 w-4"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor">
        <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>