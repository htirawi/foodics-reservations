<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from "vue";

import { useI18n } from "vue-i18n";

interface UiModalProps {
    isOpen: boolean;
    ariaLabelledby?: string | undefined;
    size?: "sm" | "md" | "lg" | "xl";
    closeOnBackdrop?: boolean | undefined;
    closeOnEscape?: boolean | undefined;
}

const props = withDefaults(defineProps<UiModalProps>(), {
    ariaLabelledby: "",
    size: "md",
    closeOnBackdrop: true,
    closeOnEscape: true,
});

const emit = defineEmits<{
    close: [
    ];
}>();

const { t } = useI18n();
const modalRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const sizeClasses = computed(() => {
    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };
    return sizes[props.size];
});

function handleBackdropClick(): void {
    if (props.closeOnBackdrop) {
        emit("close");
    }
}

function handleEscape(event: KeyboardEvent): void {
    if (event.key === "Escape" && props.closeOnEscape) {
        emit("close");
    }
}

function trapFocus(): void {
    previousActiveElement.value = document.activeElement as HTMLElement;
    if (!modalRef.value)
        return;
    const focusableElements = modalRef.value.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusableElements.length > 0)
        focusableElements[0]?.focus();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    function handleTabKey(e: KeyboardEvent): void {
        if (e.key !== "Tab")
            return;
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
        }
        else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
        }
    }
    modalRef.value.addEventListener("keydown", handleTabKey);
    onUnmounted(() => modalRef.value?.removeEventListener("keydown", handleTabKey));
}

function restoreFocus(): void {
    previousActiveElement.value?.focus();
    previousActiveElement.value = null;
}

watch(() => props.isOpen, (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) {
        document.addEventListener("keydown", handleEscape);
    }
    else {
        document.removeEventListener("keydown", handleEscape);
    }
});

onUnmounted(() => {
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" @after-enter="trapFocus" @after-leave="restoreFocus">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="handleBackdropClick">
        <div class="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          ref="modalRef"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="ariaLabelledby"
          :class="['relative z-10 w-full bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]', sizeClasses]"
        >
          <div v-if="$slots['title']" class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div :id="ariaLabelledby" class="text-lg font-semibold text-gray-900">
              <slot name="title" />
            </div>
            <button
              type="button"
              :aria-label="t('app.close')"
              class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              @click="emit('close')"
            >
              <span class="sr-only">{{ t('app.close') }}</span>
              <svg
class="h-6 w-6"
fill="none"
viewBox="0 0 24 24"
stroke-width="1.5"
stroke="currentColor"
aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <slot />
          </div>
          <div v-if="$slots['actions']" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
