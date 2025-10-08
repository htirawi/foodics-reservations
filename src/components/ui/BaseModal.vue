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
          :aria-labelledby="titleId"
          @click.stop
        >
          <div class="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 :id="titleId" class="text-xl font-semibold text-neutral-900">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              type="button"
              :aria-label="$t('app.close')"
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
            v-if="$slots['actions']"
            class="flex items-center justify-between border-t border-neutral-200 p-6"
          >
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">/**
 * @file BaseModal.vue
 * @summary Module: src/components/ui/BaseModal.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed, onMounted, onBeforeUnmount } from "vue";
import { ID_PREFIX_MODAL_TITLE, RADIX_BASE36, ID_RANDOM_SLICE_START } from "@/constants/html";

const props = withDefaults(defineProps<{
    modelValue: boolean;
    title?: string | undefined;
    size?: "sm" | "md" | "lg" | "xl";
    dataTestid?: string | undefined;
    preventClose?: boolean | undefined;
}>(), {
    title: "",
    size: "md",
    dataTestid: "",
    preventClose: false,
});
const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();
const modalClasses = computed(() => {
    const base = "relative bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto";
    const sizes = {
        sm: "w-full max-w-md",
        md: "w-full max-w-2xl",
        lg: "w-full max-w-4xl",
        xl: "w-full max-w-6xl",
    };
    return `${base} ${sizes[props.size]}`;
});
const titleId = computed(() => `${ID_PREFIX_MODAL_TITLE}${Math.random().toString(RADIX_BASE36).slice(ID_RANDOM_SLICE_START)}`);
function closeModal() {
    if (!props.preventClose) {
        emit("update:modelValue", false);
    }
}
function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && props.modelValue && !props.preventClose) {
        closeModal();
    }
}
onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});
onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
});
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
