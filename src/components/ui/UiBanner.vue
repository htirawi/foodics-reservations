<template>
  <div
    v-if="isVisible"
    :class="[
      'flex items-start gap-3 rounded-xl p-4 border',
      variantClasses,
    ]"
    :data-testid="testId"
    role="alert"
    aria-live="polite"
  >
    <div class="flex-shrink-0">
      <component :is="iconComponent" class="h-5 w-5" aria-hidden="true" />
    </div>

    <div class="flex-1 min-w-0">
      <slot />
    </div>

    <button
      v-if="dismissible"
      type="button"
      :aria-label="t('app.close')"
      class="flex-shrink-0 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-75 transition-opacity"
      :class="closeButtonClasses"
      data-testid="banner-close"
      @click="handleClose"
    >
      <span class="sr-only">{{ t('app.close') }}</span>
      <svg
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * @file UiBanner.vue
 * @summary Inline banner for auth, global, and client error messages
 * @remarks
 *   - Semantic markup with role="alert" and aria-live
 *   - RTL-safe with logical properties (gap, padding-inline)
 *   - Tailwind tokens for colors, spacing, radii
 *   - Keyboard accessible with visible focus rings
 */

import { ref, computed, h } from "vue";
import { useI18n } from "vue-i18n";

interface UiBannerProps {
  variant?: "info" | "warning" | "error" | "success";
  dismissible?: boolean;
  testId?: string;
}

const props = withDefaults(defineProps<UiBannerProps>(), {
  variant: "info",
  dismissible: false,
  testId: "banner",
});

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const isVisible = ref(true);

const variantClasses = computed(() => {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    error: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  };
  return variants[props.variant];
});

const closeButtonClasses = computed(() => {
  const variants = {
    info: "text-blue-500 focus:ring-blue-600",
    warning: "text-yellow-500 focus:ring-yellow-600",
    error: "text-red-500 focus:ring-red-600",
    success: "text-green-500 focus:ring-green-600",
  };
  return variants[props.variant];
});

const iconPaths: Record<typeof props.variant, string> = {
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  error: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const iconComponent = computed(() => {
  return () => h("svg", {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    "aria-hidden": "true",
  }, [
    h("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: iconPaths[props.variant],
    }),
  ]);
});

function handleClose(): void {
  isVisible.value = false;
  emit("close");
}
</script>

