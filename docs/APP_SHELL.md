# App Shell & Global UI Architecture

**Created:** October 5, 2025  
**Status:** Active

---

## Overview

This document explains our application shell architecture, focusing on accessibility, internationalization (i18n), RTL support, and reusable UI primitives.

---

## App Shell Structure

### Rationale

The app shell provides a consistent, accessible foundation for all pages:
- **Header**: Product branding and global navigation (locale switcher)
- **Main**: Content area with proper landmark for skip-to-content patterns
- **Toaster**: Non-blocking notifications with polite announcements

### Components

#### `src/App.vue`
Root component wrapping the entire application.

**Landmarks:**
- `<header role="banner">` — Contains AppHeader component
- `<main id="main" role="main" tabindex="-1">` — Content area (focusable for skip-to-content)
- Toaster positioned absolutely at bottom-right

**Why `tabindex="-1"` on main?**
Allows programmatic focus for skip-to-content patterns (future enhancement) without adding `<main>` to the tab order.

#### `src/layouts/AppHeader.vue`
Top navigation bar with product title and locale switcher.

**Features:**
- Product title from i18n (`$t('app.title')`)
- LocaleSwitcher component for language toggle
- Responsive layout: stack on mobile, horizontal on larger screens
- `data-testid="header-title"` for E2E testing

**A11y:**
- `<header role="banner">` landmark
- `<h1>` for product title (proper heading hierarchy)

#### `src/layouts/Toaster.vue`
Global toast notification container.

**Features:**
- Displays toasts from UI store (`useUIStore()`)
- Auto-removes after configurable duration
- Supports 4 types: success, error, warning, info
- Transition animations for enter/leave

**A11y:**
- `aria-live="polite"` — Announces new toasts without interrupting user
- `role="status"` — Indicates status message
- `aria-atomic="true"` — Reads entire toast on update
- Close button with `aria-label` and keyboard support

**Styling:**
- Fixed position at bottom-right (desktop) or bottom-center (mobile)
- Tailwind tokens for colors (success = green, error = red, etc.)
- Visible icons per toast type

---

## Locale Strategy & RTL

### Supported Locales
- **EN** (English) — Left-to-right (LTR)
- **AR** (Arabic) — Right-to-left (RTL)

### Locale Management

#### `src/composables/useLocale.ts`
Composable for reading and updating locale.

**Exports:**
- `currentLocale` (computed): Current locale ('en' | 'ar')
- `isRTL` (computed): Whether current locale is RTL
- `setLocale(locale)`: Set locale and update `dir`/`lang` attributes
- `toggleLocale()`: Switch between EN ↔ AR

**Implementation:**
- Updates `document.documentElement` attributes: `dir` (ltr/rtl) and `lang` (en/ar)
- Triggers i18n locale change
- Components react automatically via Vue reactivity

#### `src/components/ui/LocaleSwitcher.vue`
Button to toggle locale.

**Features:**
- Displays opposite locale name (when EN → show "العربية", when AR → show "English")
- Calls `toggleLocale()` on click
- Keyboard accessible (native `<button>`)
- Visible focus ring (Tailwind `focus:ring-*`)
- `data-testid="locale-switcher"`

### RTL Considerations

**Tailwind Logical Properties:**
Use `ms-*` (margin-start) and `me-*` (margin-end) instead of `ml-*`/`mr-*` where direction matters.

**Mirrored Icons:**
Icons that indicate directionality (arrows, chevrons) should flip in RTL. Use CSS `transform: scaleX(-1)` conditionally or RTL-aware icon sets.

**Flexbox & Grid:**
Flex direction and grid layouts automatically flip in RTL when using logical properties.

**Testing:**
Always test UI in both EN (LTR) and AR (RTL) to catch spacing/alignment issues.

---

## Toast Design

### Why `aria-live="polite"`?
- **Polite**: Screen readers announce after current content finishes (non-intrusive)
- **Alternative (assertive)**: Interrupts user immediately (use sparingly for critical errors)

We chose polite because toasts are informational, not blocking.

### Role & Status
- `role="status"` — Indicates a status message (read by assistive tech)
- `aria-atomic="true"` — Ensures entire toast is re-announced on update

### Auto-Removal
Toasts auto-dismiss after a duration (default 5000ms). Users can also manually close via button.

**Why duration?**
- Reduces clutter; prevents toast pile-up
- Forces concise, scannable messages

**Edge case:** Duration of `0` keeps toast persistent until manually closed (useful for critical errors).

---

## Reusable UI Components

### `src/components/ui/EmptyState.vue`
Placeholder for empty lists or no-data scenarios.

**Props:**
- `title` (optional): Custom title; defaults to `$t('empty.title')`
- `description` (optional): Custom description; defaults to `$t('empty.description')`

**Slots:**
- `action`: CTA button (e.g., "Add Item" button)

**Usage:**
```vue
<EmptyState>
  <template #action>
    <button>Add Branch</button>
  </template>
</EmptyState>
```

**A11y:**
- `data-testid="empty-state"` for E2E
- Focusable CTA in `action` slot

### `src/components/ui/PageLoading.vue`
Full-page loading indicator with spinner.

**Features:**
- Spinner animation (Tailwind `animate-spin`)
- Loading message from i18n (`$t('loading.message')`)
- Screen reader announcement

**A11y:**
- `role="status"` — Indicates loading status
- `aria-busy="true"` — Signals loading state
- `aria-label` with loading message
- Visually hidden `<span class="sr-only">` for screen readers

**Usage:**
```vue
<PageLoading v-if="loading" />
<BranchList v-else :branches="branches" />
```

---

## Minimal Dependencies & Styling

### No Third-Party Dialogs
We use our UI store (`useUIStore`) for modals/toasts/confirm dialogs. No libraries like SweetAlert or react-toastify.

**Why?**
- Smaller bundle size
- Full control over styling and behavior
- Better a11y (we enforce standards)

### Tailwind Tokens
All styling uses Tailwind utility classes with design tokens:
- **Colors**: `primary-*`, `neutral-*`, `red-*`, `green-*`, etc.
- **Spacing**: `px-4`, `py-2`, `gap-4` (consistent scale)
- **Typography**: `text-sm`, `font-medium`, `text-2xl`

**Mobile-First:**
Classes default to mobile; use `sm:`, `md:`, `lg:` breakpoints for larger screens.

**Avoid Arbitrary Values:**
Use tokens (`px-4`) instead of arbitrary values (`px-[17px]`) unless absolutely necessary.

---

## E2E Selectors (`data-testid`)

### Why `data-testid`?
- Decouples tests from implementation (class names, text content can change)
- Clear intent: "This element is test-critical"
- Playwright/Testing Library convention

### Current Selectors
| Selector | Element | Purpose |
|----------|---------|---------|
| `header-title` | Header `<h1>` | Verify product branding |
| `locale-switcher` | Locale button | Test locale toggling |
| `toaster` | Toast container | Assert toast visibility |
| `toast-success` / `toast-error` / `toast-warning` / `toast-info` | Individual toasts | Verify toast type |
| `empty-state` | EmptyState component | Assert empty scenarios |
| `page-loading` | PageLoading component | Assert loading state |

### Adding New Selectors
1. Add `data-testid="descriptive-name"` to the element
2. Document in this table
3. Use in E2E tests: `page.getByTestId('descriptive-name')`

---

## Testing Strategy

### Unit Tests (Vitest)
- **LocaleSwitcher**: Locale toggle, dir update, label correctness
- **Toaster**: Toast rendering, aria attributes, auto-removal, manual close

### E2E Tests (Playwright)
- **App Shell**: Header/main landmarks, locale switcher presence
- **Locale Switching**: EN ↔ AR toggle, dir/lang attribute updates, text changes
- **Toaster**: Toast display, close button, aria-live announcements
- **Accessibility**: Focus indicators, semantic landmarks, keyboard navigation

### Coverage Requirements
- All interactive elements: keyboard accessible, visible focus
- All user-facing text: via i18n (no hardcoded strings)
- All landmarks: present and correctly attributed

---

## Expansion Guidelines

### Adding a New Global Component
1. Place in `src/layouts/` (if structural) or `src/components/ui/` (if reusable)
2. Add i18n keys to `en.json` and `ar.json`
3. Include `data-testid` for E2E
4. Ensure a11y: ARIA attributes, keyboard support, focus management
5. Add unit tests for behavior
6. Add E2E tests for integration

### Adding a New Locale
1. Add locale code to `SupportedLocale` type in `useLocale.ts`
2. Create `src/i18n/locales/{code}.json`
3. Update `i18n.ts` messages object
4. Test RTL/LTR handling if direction differs from existing locales

### Extending Toaster
- **New toast type:** Add to `Toast['type']` union; update Toaster styling
- **Position:** Modify Toaster Tailwind classes (currently bottom-right)
- **Stacking:** Adjust TransitionGroup; currently stacks vertically

---

## References

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue i18n v9](https://vue-i18n.intlify.dev/)
- [Tailwind CSS Logical Properties](https://tailwindcss.com/docs/padding#logical-properties)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Talking Points (for interviews)

1. **App shell structure**: Landmarks (banner, main) for a11y; skip-to-content pattern ready
2. **i18n from day 1**: All text via `$t()`; EN + AR; dir/lang attributes auto-updated
3. **RTL support**: Tailwind logical properties; locale switcher updates document dir
4. **Toast design**: aria-live="polite" for non-intrusive announcements; auto-removal; manual close
5. **Minimal deps**: No third-party toast/modal libraries; full control over a11y and styling
6. **E2E hooks**: data-testid attributes decouple tests from implementation
7. **Reusable components**: EmptyState, PageLoading with a11y built-in (role, aria-busy, sr-only text)
