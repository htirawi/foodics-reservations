<template>
  <button
    :type="type"
    :disabled="disabled"
    :data-testid="dataTestid"
    :class="buttonClasses"
    :aria-busy="loading"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">/**
 * @file BaseButton.vue
 * @summary Module: src/components/ui/BaseButton.vue
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { computed } from "vue";
const props = withDefaults(defineProps<{
    variant?: "primary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    dataTestid?: string;
}>(), {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
    loading: false,
    dataTestid: "",
});
defineEmits<{
    (e: "click", event: MouseEvent): void;
}>();
const buttonClasses = computed(() => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        ghost: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-button",
        md: "px-6 py-3 text-base rounded-button",
        lg: "px-8 py-4 text-lg rounded-button",
    };
    return [base, variants[props.variant], sizes[props.size]].join(" ");
});
</script>
