<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
        <div
          :data-testid="dataTestid"
          :class="modalClasses"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 class="text-xl font-semibold text-neutral-900">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              type="button"
              :aria-label="$t('app.close', 'Close')"
              class="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
              @click="closeModal"
            >
              <svg
class="h-6 w-6"
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
          <div class="p-6">
            <slot />
          </div>
          <div
            v-if="$slots.actions"
            class="flex items-center justify-between border-t border-neutral-200 p-6"
          >
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    dataTestid?: string;
  }>(),
  {
    size: 'md',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const modalClasses = computed(() => {
  const base = 'relative bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto';
  const sizes = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
    xl: 'w-full max-w-6xl',
  };
  return `${base} ${sizes[props.size]}`;
});

function closeModal() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
