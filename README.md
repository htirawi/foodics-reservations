## Overview

Foodics Reservations is a Vue 3 + TypeScript application for managing restaurant branch reservations. It follows strict engineering standards: tiny components, logic separated into composables/stores/services, minimal dependencies, internationalization (EN/AR) with RTL support, and accessible UI patterns.

## Tech Stack

- **Vue 3** with `<script setup>` (Composition API)
- **TypeScript** (strict mode: no `any`/`unknown`)
- **Pinia** (state management)
- **vue-i18n** (EN/AR + RTL support)
- **Tailwind CSS** (design tokens, mobile-first)
- **Axios** (centralized HTTP client with interceptors)
- **Vitest** (unit tests) + **Playwright** (E2E tests)

## Project Structure

```
src/
  app/                    # Application wiring
    App.vue
    main.ts
    i18n/
      index.ts
      locales/
        en.json
        ar.json
    styles/
      main.css
  components/             # Global, re-usable UI only
    ui/                   # Primitives (Button, Modal, Input...)
    layout/               # AppHeader, Toaster, shells
  constants/              # Centralized constants (see Constants below)
  features/
    branches/
      views/              # Route-level screens
      components/         # Feature UI pieces (tiny)
      stores/             # Pinia feature stores
      composables/        # Feature-logic hooks (no DOM)
      services/           # Feature API modules
  services/               # Cross-feature services
  stores/                 # Cross-feature global stores
  composables/            # Cross-feature hooks
types/                    # Shared types only
tests/
  unit/                   # Mirrors src structure
  e2e/                    # Playwright specs
```

## Constants & Configuration

All application constants are centralized in `src/constants/` to avoid magic strings/numbers and ensure consistency:

```typescript
// Import from barrel export
import { API_ENDPOINT_BRANCHES, MAX_SLOTS_PER_DAY, TOAST_TYPE_SUCCESS } from '@/constants';

// Or from specific modules
import { WEEKDAYS } from '@/constants/reservations';
import { TESTID_ADD_BRANCHES_BTN } from '@/constants/testids';
```

**Convention:**
- Primitives: `UPPER_SNAKE_CASE` (e.g., `MAX_SLOTS_PER_DAY = 3`)
- Objects/Arrays: PascalCase with `as const` (e.g., `WEEKDAYS = [...] as const`)
- All imports use `@/constants/*` path alias
- No duplicates: each constant defined once, imported everywhere

**Files:**
- `api.ts` — API endpoints, query params, includes
- `http.ts` — HTTP status codes, headers, auth prefix
- `ui.ts` — Toast types, confirm variants, durations
- `testids.ts` — All `data-testid` values for E2E/unit tests
- `reservations.ts` — Domain constants (weekdays, slot limits, durations)
- `locale.ts` — Locale codes, direction values, currencies
- `time.ts` — Time conversion factors, limits
- `regex.ts` — Validation regex patterns
- `i18n-keys.ts` — i18n namespace keys
- `storage.ts` — localStorage/sessionStorage keys
- `errors.ts` — Fallback error messages
- `html.ts` — HTML attribute names, ID prefixes
- `stores.ts` — Pinia store names

## Rationale & Architecture Decisions

### Why Vue 3 + TypeScript Strict?

- **Vue 3 Composition API** (`<script setup>`): Better TypeScript inference, smaller bundle, clearer logic reuse
- **TypeScript strict mode**: Catches errors at compile time; no `any`/`unknown` allowed
- **Minimal dependencies**: No UI kits or date libraries; reduces bundle size and maintenance surface

### Component Architecture

- **Tiny components (≤150 SLOC)**: UI glue only; props/emits/slots
- **Logic extraction**: Business logic lives in:
  - **Composables** (`src/composables/`, `src/features/*/composables/`): Reusable stateful logic (no DOM)
  - **Services** (`src/services/`, `src/features/*/services/`): HTTP/API layer (axios)
  - **Stores** (Pinia): Domain state + orchestration
  - **Utils** (`src/utils/`): Pure helper functions
- **Types in `/types` only**: All shared types/interfaces centralized; imported with `import type { ... }`

### Service Layer + Error Handling

- **Centralized HTTP client** (`src/services/http.ts`): Axios with interceptors
- **Normalized errors**: All API errors transformed to `{ status, message, details }` shape
- **Offline E2E testing**: Playwright uses route intercepts; never hits real API

### i18n & RTL from Day 1

- **vue-i18n** with EN/AR locales
- **RTL-safe styles**: Tailwind logical properties (`margin-inline`, `padding-inline`, `inset-inline`)
- **Persistent locale**: Saved to localStorage; restored on reload
- **Icon mirroring**: Directional icons flip under `[dir="rtl"]`

### Accessibility & Performance

- **A11y target ≥95** (Lighthouse): Semantic HTML, ARIA labels, focus management, keyboard navigation
- **Tailwind tokens**: Design system with spacing/color/typography scales
- **Code splitting**: Route-level lazy loading
- **No console.* in production**: Linted out of `src/**`

### Constants Centralization

- All magic strings/numbers in `src/constants/*` (API endpoints, testids, weekdays, etc.)
- Imported via `@/constants` path alias
- Prevents duplication and typos

## Setup & Usage

```bash
npm install

# Local env (no secrets committed)
cp env.example .env.local
# Fill required vars (see Environment below)

# Dev / build / preview
npm run dev
npm run build
npm run preview

# Code quality
npm run lint
npm run typecheck

# Tests
npm run test:unit
npx playwright install --with-deps
npm run test:e2e
```

## Testing Strategy

### Unit Tests (Vitest)

- **Scope**: Composables, stores, services, utils, critical components
- **Approach**: Behavior-first; test public APIs, not implementation details
- **Offline**: Uses `axios-mock-adapter` to mock HTTP; no real network calls
- **Location**: `tests/unit/**` mirrors `src/**` structure
- **Run**: `npm run test:unit` (watch mode) or `npm run test:unit -- --run` (CI mode)

### E2E Tests (Playwright)

- **Scope**: Core user flows (branches list, add/enable/disable, settings editor, i18n toggle, RTL)
- **Offline**: Route intercepts (`page.route()`) with fixtures; never hits real API or uses real tokens
- **Locales**: Runs for both **EN** and **AR**; asserts `document.documentElement.dir` and layout
- **A11y smoke**: Checks roles, labels, keyboard navigation, focus management
- **Selectors**: Uses `data-testid` for stability
- **Location**: `tests/e2e/**`
- **Run**: `npm run test:e2e` (headless) or `npm run test:e2e:ui` (Playwright UI)

### How to Run Offline E2E

E2E tests use route intercepts configured in `tests/e2e/setup/intercepts.ts`. To run:

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps

# Run E2E tests (headless, offline)
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui
```

**No real API calls are made**. All `/api/**` routes are intercepted and fulfilled with fixture data.

### Switching Locales in Tests

```typescript
// EN test
await page.goto('/');
await expect(page.locator('[data-testid="app-header"]')).toContainText('Branches');

// AR test
await page.goto('/?lang=ar');
await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
await expect(page.locator('[data-testid="app-header"]')).toContainText('الفروع');
```

## Quality Bars

### Required Checks (CI)

All PRs must pass:

1. **Type check**: `npm run typecheck` → No TypeScript errors
2. **Lint**: `npm run lint` → ESLint passes (no `eslint-disable` allowed)
3. **Unit tests**: `npm run test:unit -- --run` → All unit tests pass
4. **E2E tests**: `npm run test:e2e` → All Playwright tests pass (EN + AR)

### Code Quality Standards

- **TypeScript strict**: No `any`/`unknown`; `?.` and `??` preferred
- **Component size**: ≤150 lines; complexity ≤8; max depth ≤2
- **No forbidden patterns**: No `eslint-disable`, `@ts-ignore`, `TODO:` comments, `console.*` in `src/**`
- **Path aliases**: Use `@/*` imports (no deep relative paths like `../../`)
- **Constants**: All magic strings/numbers in `src/constants/*`

### Accessibility

- **Target**: Lighthouse A11y score ≥95
- **Semantics**: Proper ARIA roles, labels, descriptions
- **Keyboard**: All interactive elements keyboard-accessible with visible focus rings
- **Dialogs**: Focus trap, Esc to close, focus restoration

### Performance

- **Bundle budget**: Fail PRs adding >50KB gzip per route (unless justified)
- **Code splitting**: Route-level lazy loading
- **Image optimization**: Modern formats, width/height attributes, lazy loading

## Environment

- No secrets in code. Use `.env.local` (gitignored).
- Required vars:
  - `VITE_API_BASE_URL` — API base URL (dev proxy `/api` is used locally)
  - `VITE_FOODICS_TOKEN` — bearer token for API calls

## Contributing & PR Hygiene

### Branch Strategy

- **Always** work on feature branches; **never push to `main`** (default branch)
- Branch naming: `{type}/{scope}-{slug}` (e.g., `feat/branches-settings`, `fix/rtl-alignment`)
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`

### Required Checks Before PR

Run these locally before opening a PR:

```bash
npm run typecheck  # Must pass with no errors
npm run lint       # Must pass (no eslint-disable allowed)
npm run test:unit  # All unit tests must pass
npm run test:e2e   # All E2E tests must pass (EN + AR)
```

### Conventional Commits

Use clear, specific commit messages:

```
feat(branches): add bulk enable/disable action
fix(i18n): correct RTL arrow direction in settings
chore(ci): add GitHub Actions workflow
docs(readme): document offline E2E testing strategy
```

**Format**: `{type}(scope): {concise summary}` (≤72 chars)

### PR Template

Use the provided PR template (`.github/pull_request_template.md`):

- **Summary**: Bullet list of changes
- **Context/Why**: Problem being solved
- **Implementation**: Architecture notes (services/composables/stores)
- **Testing**: Commands + coverage (unit/E2E)
- **A11y/i18n/RTL**: Verification notes
- **Performance**: Bundle impact
- **Checklist**: All gates passed, docs updated

### Small PRs

Keep PRs focused and reviewable:

- One concern per PR
- Split large refactors into incremental changes
- Update tests alongside code changes

## Notes on Dependencies

- Runtime: `axios`, `pinia`, `vue-i18n`, `vue`, `vue-router`, `tailwindcss` (plugins forms/typography).
- Dev/Test: ESLint + Prettier, TypeScript, Vitest + `@vue/test-utils`, Playwright.
- New dependencies require a short rationale and bundle impact in PR.