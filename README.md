## Overview

Foodics Reservations is a Vue 3 + TypeScript app for managing restaurant reservations. It follows strict engineering standards: tiny components, logic in composables/stores/services, minimal dependencies, i18n (EN/AR) with RTL, and accessible UI.

## Tech Stack

- Vue 3 with `<script setup>` (Composition API)
- TypeScript (strict)
- Pinia (state)
- vue-i18n (EN/AR + RTL)
- Tailwind (design tokens)
- Axios (centralized client + interceptors)
- Vitest (unit) + Playwright (e2e)

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

## Key Design Decisions & Rationale

- **App Layer Structure**: Centralized application wiring in `src/app/` for better organization
- **Feature-Scoped Architecture**: Each feature (e.g., branches) contains its own components, stores, composables, and services
- **Type Safety**: All shared types consolidated in `/types` folder; strict TypeScript with no `any`/`unknown`
- **Component Size Limits**: Components kept under 150 lines; complex logic extracted to composables
- **Minimal Dependencies**: No UI/date kits; tokens-first design with Tailwind
- **i18n & RTL**: EN/AR support from day 1 with proper RTL handling; accessibility target ≥95
- **Centralized HTTP**: Axios client with error normalization `{ status, message, details }`
- **Constants Centralization**: All magic strings/numbers extracted to `src/constants/` for maintainability

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

- Unit (Vitest): behavior-first for composables/stores/services; offline with `axios-mock-adapter`.
- E2E (Playwright): offline via route intercepts (`tests/e2e/setup/intercepts.ts`); runs for EN & AR; quick a11y smoke; assert `document.documentElement.dir`.

## Environment

- No secrets in code. Use `.env.local` (gitignored).
- Required vars:
  - `VITE_API_BASE_URL` — API base URL (dev proxy `/api` is used locally)
  - `VITE_FOODICS_TOKEN` — bearer token for API calls

## Contributing & PR Hygiene

- Always work on feature branches; never push the default branch.
- Required checks before PR: `lint`, `typecheck`, `test:unit`, `test:e2e`.
- Conventional commits. Example:
  - `docs(readme): add guidelines-compliant README and testing notes`

## Notes on Dependencies

- Runtime: `axios`, `pinia`, `vue-i18n`, `vue`, `vue-router`, `tailwindcss` (plugins forms/typography).
- Dev/Test: ESLint + Prettier, TypeScript, Vitest + `@vue/test-utils`, Playwright.
- New dependencies require a short rationale and bundle impact in PR.