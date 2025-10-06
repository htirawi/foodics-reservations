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
src/components/   # Tiny, presentational UI units (UI glue only)
src/views/        # Pages/screens
src/composables/  # Reusable logic (selection/filtering/async wrappers)
src/stores/       # Pinia stores (domain state, orchestration, optimistic/rollback)
src/services/     # HTTP client + API modules (IO only; typed errors)
src/i18n/         # Locales & i18n setup (EN/AR + RTL)
src/styles/       # Tailwind tokens/layers
types/            # Shared types only (re-export from types/index.ts)
tests/unit/, tests/e2e/
```

## Key Design Decisions & Rationale

- Minimal dependencies (no UI/date kits); tokens-first design with Tailwind.
- Components remain tiny; logic moves to composables/services; stores orchestrate.
- i18n from day 1 (EN/AR) with RTL; accessibility target ≥95 (skip link in `App.vue`).
- Centralized Axios client with error normalization `{ status, message, details }`.
- Strict TS, no `any`/`unknown`; shared types live in `types/` only.

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