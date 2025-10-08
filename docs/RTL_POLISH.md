# RTL & Arabic UI Polish Guide

This document outlines the RTL (Right-to-Left) and Arabic UI polish implementation for the Foodics Reservations application.

## Overview

The application supports both English (LTR) and Arabic (RTL) languages with proper direction flipping, logical CSS properties, and RTL-aware components.

## Direction & Language Flipping

### Implementation

The direction and language flipping is handled by the `useLocale` composable:

```typescript
const setLocale = (newLocale: SupportedLocale) => {
    locale.value = newLocale;
    const dir = newLocale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", newLocale);
    // ... persistence logic
};
```

### Behavior

- **Arabic ("ar")**: Sets `html[dir="rtl"][lang="ar"]`
- **English ("en")**: Sets `html[dir="ltr"][lang="en"]`
- **Persistence**: Locale preference is saved to localStorage
- **Restoration**: Locale is restored on app boot

### Usage

```vue
<script setup lang="ts">
import { useLocale } from "@/composables/useLocale";

const { currentLocale, isRTL, setLocale, toggleLocale } = useLocale();
</script>
```

## CSS Logical Properties

### Principles

Use logical CSS properties instead of physical ones to ensure proper RTL behavior:

| Physical | Logical | Tailwind Class |
|----------|---------|----------------|
| `left` | `inline-start` | `inset-inline-start-*` |
| `right` | `inline-end` | `inset-inline-end-*` |
| `margin-left` | `margin-inline-start` | `ms-*` |
| `margin-right` | `margin-inline-end` | `me-*` |
| `padding-left` | `padding-inline-start` | `ps-*` |
| `padding-right` | `padding-inline-end` | `pe-*` |
| `border-left` | `border-inline-start` | `border-s-*` |
| `border-right` | `border-inline-end` | `border-e-*` |
| `text-align: left` | `text-align: start` | `text-start` |
| `text-align: right` | `text-align: end` | `text-end` |

### Examples

```vue
<!-- ❌ Physical properties -->
<div class="ml-4 pr-6 text-left border-l-2">

<!-- ✅ Logical properties -->
<div class="ms-4 pe-6 text-start border-s-2">
```

## Icon Direction Strategy

### Current Icons

The application currently uses symmetric icons that don't require flipping:
- Close buttons (X)
- Toast icons (success, error, warning, info)
- Empty state icons

### Future Icon Handling

For directional icons (chevrons, arrows), use the `useRTL` composable:

```vue
<script setup lang="ts">
import { useRTL } from "@/composables/useRTL";

const { getIconTransform } = useRTL();
</script>

<template>
  <!-- Chevron that flips in RTL -->
  <svg :class="getIconTransform(true)" class="h-4 w-4">
    <path d="M9 5l7 7-7 7" />
  </svg>
</template>
```

### Tailwind RTL Classes

Tailwind provides RTL-aware classes:

```vue
<!-- Icon that rotates 180° in RTL -->
<svg class="rtl:rotate-180 h-4 w-4">
  <path d="M9 5l7 7-7 7" />
</svg>
```

## Component-Specific RTL Behavior

### Modals

- **Close Button**: Positioned at `inline-end` (right in LTR, left in RTL)
- **Actions**: Use `justify-end` for consistent positioning
- **Focus Trap**: Works correctly in both directions

```vue
<div class="flex items-center justify-between px-6 py-4">
  <div class="text-lg font-semibold">
    <slot name="title" />
  </div>
  <button class="p-2 text-gray-400 hover:text-gray-600">
    <!-- Close icon -->
  </button>
</div>
```

### Toasts

- **Positioning**: Uses `sm:justify-end` for logical positioning
- **Content**: Icons and text align naturally with logical margins

```vue
<div class="fixed inset-x-0 bottom-0 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6">
  <div class="flex w-full max-w-sm flex-col gap-2">
    <!-- Toast content -->
  </div>
</div>
```

### Tables

- **Headers**: Use `text-start` for natural reading order
- **Content**: Aligns according to text direction

```vue
<th class="px-4 py-3 text-start text-sm font-medium text-gray-700">
  {{ $t('reservations.table.branch') }}
</th>
```

## Keyboard Navigation & Focus

### Tab Order

The tab order works naturally in both directions:
1. Skip link
2. Header title
3. Locale switcher
4. Main content
5. Modal controls (when open)

### Focus Management

- **Skip Link**: Uses `focus:inset-inline-start-4` for logical positioning
- **Focus Rings**: Visible in both directions
- **Modal Focus**: Traps focus correctly in RTL

## Translation Completeness

### Current Status

All user-facing strings are properly localized:
- ✅ English (`en.json`) - Complete
- ✅ Arabic (`ar.json`) - Complete
- ✅ No hardcoded strings in components

### Key Areas

- App shell (header, navigation)
- Tables and data display
- Modals and dialogs
- Toast notifications
- Form labels and validation messages

## Testing Strategy

### E2E Tests

Comprehensive RTL behavior testing in `tests/e2e/i18n.rtl-polish.spec.ts`:

1. **Direction Flipping**: Verifies `html[dir|lang]` attributes
2. **Layout Properties**: Checks logical CSS usage
3. **Modal Behavior**: Tests close button positioning
4. **Keyboard Navigation**: Verifies Tab order
5. **Accessibility**: Ensures ARIA attributes work correctly
6. **Cross-browser**: Tests WebKit compatibility

### Test Commands

```bash
# Run RTL-specific tests
npm run test:e2e -- tests/e2e/i18n.rtl-polish.spec.ts

# Run with specific browser
npm run test:e2e -- tests/e2e/i18n.rtl-polish.spec.ts --project=chromium
npm run test:e2e -- tests/e2e/i18n.rtl-polish.spec.ts --project=webkit
```

## Utilities

### useRTL Composable

Provides RTL-aware utilities:

```typescript
const {
    isRTL,                    // Computed boolean
    getRTLClasses,            // Get conditional classes
    getIconTransform,         // Get icon transform classes
    getLogicalPosition,       // Get logical positioning
    getLogicalTextAlign,      // Get logical text alignment
} = useRTL();
```

### Usage Examples

```vue
<script setup lang="ts">
import { useRTL } from "@/composables/useRTL";

const { isRTL, getLogicalPosition } = useRTL();
</script>

<template>
  <div :class="getLogicalPosition('end')">
    <!-- Content aligned to logical end -->
  </div>
</template>
```

## Best Practices

### DO

- ✅ Use logical CSS properties (`margin-inline-start`, `text-start`)
- ✅ Test both LTR and RTL layouts
- ✅ Use Tailwind's logical utilities (`ms-*`, `pe-*`, `text-start`)
- ✅ Maintain consistent focus order
- ✅ Test keyboard navigation in both directions

### DON'T

- ❌ Use physical properties (`left`, `right`, `margin-left`)
- ❌ Hardcode directional positioning
- ❌ Assume left-to-right reading order
- ❌ Skip RTL testing
- ❌ Use `text-left` or `text-right` without consideration

## Troubleshooting

### Common Issues

1. **Icons not flipping**: Use `rtl:rotate-180` or `useRTL().getIconTransform()`
2. **Layout breaking**: Check for hardcoded `left`/`right` properties
3. **Focus order wrong**: Verify Tab order in both directions
4. **Modal positioning**: Ensure close button uses logical positioning

### Debug Tools

```javascript
// Check current direction
console.log(document.documentElement.dir); // "rtl" or "ltr"

// Check current language
console.log(document.documentElement.lang); // "ar" or "en"

// Force RTL for testing
document.documentElement.dir = "rtl";
```

## Future Enhancements

### Potential Additions

1. **RTL Plugin**: Only if needed for complex layouts
2. **More Icon Variants**: Add directional icons with proper flipping
3. **Advanced Layouts**: Complex grid layouts with RTL support
4. **Animation Direction**: RTL-aware animations and transitions

### When to Add RTL Plugin

Only add a Tailwind RTL plugin if:
- Complex layouts require it
- Custom utilities are needed
- Bundle impact is minimal
- Document the rationale

## References

- [MDN: Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Tailwind CSS: RTL Support](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [Vue i18n: RTL Support](https://vue-i18n.intlify.dev/guide/advanced/locale.html#rtl-support)
- [WCAG: RTL Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence.html)
