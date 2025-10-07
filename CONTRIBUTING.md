# Contributing Guide

Thanks for contributing! This guide keeps the codebase consistent and maintainable.

## Development Workflow

### 1. Create a branch

Never push directly to `main`. Always create a feature branch:

```bash
git checkout -b feat/add-reservation-form
# Branch format: {type}/{short-description}
# Types: feat, fix, chore, docs, refactor, test, perf, ci
```

### 2. Make your changes

Write code following the standards below. Keep components small and logic in composables.

### 3. Test locally

Before committing, run:

```bash
npm run lint          # Fix linting issues
npm run typecheck     # Verify types
npm run test:unit     # Run unit tests
npm run test:e2e      # Run E2E tests
npm run build         # Verify production build
```

**Quick verification**: `npm run test:quick` (lint + typecheck + unit tests)

**Full verification**: `npm run test:full` (all tests + build)

Fix any failures before moving forward.

### 4. Commit

Use conventional commit format:

```bash
git commit -m "feat(reservations): add date picker"

# Format: type(scope): short description
# Body (optional): explain why if not obvious
```

### 5. Push and open PR

```bash
git push -u origin feat/add-reservation-form
```

Open a PR on GitHub. Fill out the template with relevant details.

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` or `unknown` - use unions/generics
- Shared types go in `/types`
- Use `??` instead of `||` for fallbacks
- Use optional chaining `?.` for nested access

```ts
// Bad
const value = obj.nested || 'default';
function process(data: any) {}

// Good
const value = obj.nested ?? 'default';
const safe = obj?.nested?.value ?? 'default';
function process(data: User): Result {}
```

### Vue Components

- Use `<script setup lang="ts">`
- Extract complex logic to composables
- Keep components small (≤150 lines)
- No prop mutations - use emits
- No service imports - use stores/composables
- No eslint-disable directives

```vue
<script setup lang="ts">
import type { Reservation } from '@/types';
import { useReservationForm } from '@/composables/useReservationForm';

interface Props {
  reservation?: Reservation;
}

interface Emits {
  (e: 'submit', data: Reservation): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formData, isValid } = useReservationForm(props.reservation);
</script>
```

### Component Complexity Limits

Keep components simple. ESLint enforces:

- Max 150 lines per file
- Cyclomatic complexity ≤ 8
- Nesting depth ≤ 2
- Max 4 function parameters
- Max 8 props (presentational) or 12 props (container)
- Max 3 watchers per component

If you hit these limits, split the component or extract logic to composables.

### Import Style

Use alias imports instead of relative paths:

```ts
// Bad
import { formatDate } from '../../utils/time';

// Good
import { formatDate } from '@/utils/time';
```

## Testing

### Unit Tests

Write unit tests for:

- Utils and helpers
- Composables
- Store logic
- Complex component logic

```ts
// tests/unit/composables/useReservationForm.spec.ts
import { describe, it, expect } from 'vitest';
import { useReservationForm } from '@/composables/useReservationForm';

describe('useReservationForm', () => {
  it('validates form data', () => {
    const { formData, isValid } = useReservationForm();
    formData.value.date = '2025-01-15';
    expect(isValid.value).toBe(true);
  });
});
```

Run with `npm run test:unit` (watch mode) or `npm run test:unit -- --run` (once).

### E2E Tests

Write E2E tests for:

- User flows (login, create reservation, etc.)
- Navigation
- Locale switching
- Form submissions

```ts
// tests/e2e/reservations.spec.ts
import { test, expect } from '@playwright/test';

test('creates a reservation', async ({ page }) => {
  await page.goto('/reservations/new');
  await page.fill('input[name="date"]', '2025-01-15');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Confirmed')).toBeVisible();
});
```

Run with `npm run test:e2e` or `npm run test:e2e:chrome` (faster).

## Accessibility

- Use semantic HTML (`<nav>`, `<main>`, `<button>`)
- Add ARIA labels for icons and icon-only buttons
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Test with a screen reader (VoiceOver or NVDA)
- Maintain focus states on interactive elements

```vue
<button aria-label="Close modal">
  <XIcon />
</button>
```

## Internationalization

All user-facing text must use i18n keys:

```vue
<!-- Bad -->
<button>Submit</button>

<!-- Good -->
<button>{{ $t('common.submit') }}</button>
```

Add translations to `src/app/i18n/locales/en.json` and `src/app/i18n/locales/ar.json`.

Use logical CSS properties for RTL support:

```css
/* Bad */
.box {
  margin-left: 1rem;
}

/* Good */
.box {
  margin-inline-start: 1rem;
}
```

## PR Guidelines

### Keep PRs small

Aim for < 400 lines changed. Smaller PRs get reviewed faster.

### Write a clear description

Explain:

- What changed
- Why it was needed
- How to test it

### Self-review first

Check your own diff before requesting review. Catch obvious issues early.

### Respond to feedback

Address review comments within 24 hours when possible.

## CI Checks

All PRs must pass:

1. **Lint** - ESLint with strict rules (no eslint-disable allowed)
2. **Type check** - TypeScript strict mode
3. **Unit tests** - Vitest with 308+ tests
4. **E2E tests** - Playwright with offline mode
5. **Build** - Production build verification

**Zero tolerance for**:
- `eslint-disable` directives
- `@ts-ignore` or `@ts-expect-error`
- `console.log` in production code
- `any` or `unknown` types

Fix failures before requesting review.

## Dependencies

Avoid adding new dependencies. If you must:

- Justify why (can't we build it ourselves?)
- Check bundle size impact
- Verify it's actively maintained
- Ensure TypeScript support

We don't use:

- UI component libraries (build custom components)
- Date libraries (use `Intl.DateTimeFormat`)
- Lodash (use native methods)

## Questions?

Check the README or ask in team chat.

Thanks for contributing!
