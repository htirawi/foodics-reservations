## UI System

**Purpose:** App shell, UI primitives, design tokens, and RTL patterns.

---

### App Shell

**Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `App.vue` | `src/app/App.vue` | Root component; sets up i18n, RTL, modals/toasts |
| `AppHeader` | `src/components/layout/AppHeader.vue` | Header with logo, title, locale switcher |
| `AppToaster` | `src/components/layout/AppToaster.vue` | Toast notifications container |

**Accessibility:**

- **Skip link**: First focusable element; jumps to `#main` content
- **Landmarks**: `<header>`, `<main id="main">`, proper ARIA labels
- **Focus management**: Modals trap focus; restore on close
- **Keyboard navigation**: All interactive elements keyboard-accessible

**RTL Support:**

- `<html dir="ltr">` or `<html dir="rtl">` set by `useRTL()` composable
- Persisted to `localStorage` and restored on load
- Tailwind logical properties: `margin-inline`, `padding-inline`, `inset-inline`

---

### UI Primitives (`src/components/ui/`)

**Base Components:**

| Component | Purpose | Props | Emits |
|-----------|---------|-------|-------|
| `UiButton` | Action button | `variant`, `size`, `disabled`, `loading` | `click` |
| `UiInput` | Text input | `modelValue`, `label`, `error`, `disabled` | `update:modelValue` |
| `UiSelect` | Dropdown select | `modelValue`, `options`, `label`, `error` | `update:modelValue` |
| `UiCheckbox` | Checkbox input | `modelValue`, `label`, `disabled` | `update:modelValue` |
| `UiModal` | Dialog overlay | `open`, `title`, `size` | `close` |
| `UiConfirm` | Confirmation dialog | `open`, `title`, `message`, `variant` | `confirm`, `cancel` |
| `UiBanner` | Status banner | `type`, `message`, `dismissible` | `dismiss` |
| `UiEmptyState` | Empty list state | `title`, `description`, `icon` | `action` |
| `UiTable` | Data table wrapper | `columns`, `rows` | - |
| `UiToggle` | Switch toggle | `modelValue`, `label`, `disabled` | `update:modelValue` |

**Dialog Components:**

All dialogs follow strict a11y patterns:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to description (if present)
- **Focus trap**: Focus cycles within dialog
- **Esc to close**: Keyboard dismissal
- **Focus restoration**: Returns focus to trigger element on close

**Example:**

```vue
<UiModal
  :open="isOpen"
  :title="t('branches.addTitle')"
  @close="handleClose"
>
  <template #default>
    <!-- Modal content -->
  </template>
  <template #footer>
    <UiButton @click="handleSave">{{ t('common.save') }}</UiButton>
  </template>
</UiModal>
```

---

### Design Tokens (Tailwind)

**Configuration:** `tailwind.config.ts`

**Spacing Scale:**

```
0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
(in rem units: 0rem, 0.25rem, 0.5rem, ...)
```

**Border Radius:**

- `rounded-lg` (0.5rem / 8px) – inputs, small cards
- `rounded-xl` (0.75rem / 12px) – buttons, modals
- `rounded-2xl` (1rem / 16px) – large cards, sections

**Typography:**

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem | Small labels, captions |
| `text-sm` | 0.875rem | Body text, inputs |
| `text-base` | 1rem | Default body |
| `text-lg` | 1.125rem | Section headings |
| `text-xl` | 1.25rem | Page headings |
| `text-2xl` | 1.5rem | Hero headings |

**Colors:**

- **Primary**: `blue-600` (buttons, links)
- **Success**: `green-600` (success states)
- **Warning**: `yellow-600` (warning states)
- **Danger**: `red-600` (errors, destructive actions)
- **Neutral**: `gray-*` scale for text/borders

**Focus Rings:**

All interactive elements:

```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
```

---

### RTL Patterns

**Logical Properties (Preferred):**

```vue
<!-- LTR: margin-left, RTL: margin-right -->
<div class="ms-4">...</div>

<!-- LTR: padding-left, RTL: padding-right -->
<div class="ps-6">...</div>

<!-- LTR: left-0, RTL: right-0 -->
<div class="inset-inline-start-0">...</div>
```

**Directional Icons:**

Icons that indicate direction (arrows, chevrons) must flip in RTL:

```vue
<svg
  class="transition-transform"
  :class="{ 'scale-x-[-1]': isRTL }"
>
  <!-- Arrow icon -->
</svg>
```

Or use CSS:

```css
[dir="rtl"] .arrow-icon {
  transform: scaleX(-1);
}
```

**Text Alignment:**

```vue
<!-- Use logical start/end -->
<p class="text-start">Left in LTR, right in RTL</p>
<p class="text-end">Right in LTR, left in RTL</p>
```

---

### Accessibility Checklist

**For Every Component:**

- [ ] Semantic HTML (button, label, input, dialog)
- [ ] ARIA roles/labels where needed
- [ ] Keyboard accessible (Tab, Enter, Space, Esc)
- [ ] Visible focus ring (not `outline-none` without replacement)
- [ ] Color contrast ≥4.5:1 for text
- [ ] Error messages have `aria-describedby` association
- [ ] Loading/disabled states announced to screen readers

**For Dialogs:**

- [ ] `role="dialog"` and `aria-modal="true"`
- [ ] `aria-labelledby` and `aria-describedby`
- [ ] Focus trap active
- [ ] Esc key closes dialog
- [ ] Focus restored on close

**For Forms:**

- [ ] Labels associated with inputs (`for`/`id`)
- [ ] Required fields marked (`required`, `aria-required`)
- [ ] Error messages linked (`aria-describedby`)
- [ ] Validation on blur/submit (not on every keystroke)

---

### Testing UI Components

**Unit tests** (Vitest + Vue Test Utils):

```typescript
import { mount } from '@vue/test-utils';
import UiButton from '@/components/ui/UiButton.vue';

it('should emit click event', async () => {
  const wrapper = mount(UiButton);
  await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeTruthy();
});
```

**E2E tests** (Playwright):

```typescript
await page.getByRole('button', { name: 'Add Branch' }).click();
await expect(page.getByRole('dialog')).toBeVisible();
```

See `tests/unit/components/` and `tests/e2e/` for examples.

