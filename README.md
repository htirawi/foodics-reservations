# Foodics Reservations Management System

> **Enterprise-grade restaurant branch reservation system** built with Vue 3, TypeScript, and comprehensive test coverage exceeding 80%.

[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)]() [![Vue 3](https://img.shields.io/badge/vue-3.4.19-42b883)]() [![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue)]() [![Coverage](https://img.shields.io/badge/coverage-81.14%25-success)]() [![Tests](https://img.shields.io/badge/tests-713%20unit%20%2B%20114%20e2e-passing)]()

## Overview

Multi-branch reservation management system enabling restaurant administrators to configure reservation times, manage table availability, and control branch settings through an intuitive single-page application.

**Built with modern best practices:**
- 🎯 TypeScript strict mode (no escape hatches)
- ✅ 81.14% test coverage (713 unit + 114 E2E tests)
- 🌍 Full internationalization (English/Arabic with RTL)
- 🚀 Zero runtime dependencies beyond Vue ecosystem
- 📦 Lightweight bundle (~88 KB gzipped)
- ♿ WCAG 2.1 AA accessibility compliance

## Why This Meets Implementation Guidelines

This project demonstrates senior-level engineering practices aligned with production requirements:

| Guideline | Implementation | Evidence |
|-----------|---------------|----------|
| **Single-page architecture** | Vue 3 SPA with composable-first design | `src/features/branches/views/BranchesListView.vue` |
| **List enabled branches** | Table/card views with responsive design | `BranchesTable.vue`, `BranchesCards.vue` |
| **Add Branches modal** | Pagination-aware enable flow | `AddBranchesModal.vue` + `getAllBranches()` |
| **Disable all reservations** | Batch operations with confirmation | `DisableAllButton.vue` + `useDisableAll.ts` |
| **Settings popup** | Reactive validation with real-time errors | `BranchSettingsModal.vue` + composables |
| **Duration validation** | Min 5 minutes, policy-based validation | `src/utils/policies/` (150+ tests) |
| **Tables dropdown** | Section-table format with ASCII hyphen | `src/utils/tables.ts` |
| **Time slots (≤3/day)** | Add/edit/delete with slot limits | `DaySlotsEditor.vue` + `slotEditorActions.ts` |
| **Apply Saturday to all** | Confirmation + clipping logic | `useSlotsManagement.ts:210-296` |
| **AR/EN i18n** | Vue-i18n with RTL, locale persistence | `src/app/i18n/` + `useLocale.ts` |
| **80%+ coverage** | Vitest + Playwright offline testing | **81.14% (exceeds requirement)** |

## Best Vue 3 Practices Followed

This project adheres to Vue 3 and modern frontend best practices:

### ✅ Composition API + `<script setup>`
- All components use `<script setup>` syntax for conciseness
- Reactive state with `ref()`, `computed()`, `reactive()`
- Lifecycle hooks: `onMounted()`, `onBeforeUnmount()`, `watch()`

### ✅ Composables/Services Separation
- **Components**: Presentation logic only (<150 SLOC enforced)
- **Composables**: Business logic, validation, state management
- **Services**: HTTP boundary, never imported directly in components
- **Stores**: Global state via Pinia

### ✅ Minimal Dependencies
- **4 runtime dependencies**: Vue 3, Pinia, vue-i18n, Axios
- No heavy libraries (moment.js, lodash, UI frameworks)
- Bundle size: ~88 KB gzipped

### ✅ Strict TypeScript
- `strict: true` + 8 additional safety flags
- No `any`, `@ts-ignore`, or `@ts-expect-error` allowed
- Compile-time type safety for all code paths

### ✅ Import Aliases
- Path aliases prevent `../../../` hell
- 10 configured aliases: `@/`, `@features/`, `@components/`, etc.
- Enforced via `tsconfig.json` + Vite

### ✅ ESLint Rules
- **Zero tolerance**: No disable directives, no TODO/FIXME comments
- **Complexity caps**: Max 8 cyclomatic complexity, 2 nesting levels
- **File size limits**: 150 lines/file (400 for tests)
- **Import order**: Enforced with auto-sort

### ✅ Testing Strategy
- **Unit**: 713 tests, 81.14% coverage, <5s execution
- **E2E**: 114 tests, offline via Playwright route interception
- **Accessibility**: Automated smoke tests (WCAG 2.1 AA)

## Architecture & Project Structure

### Folder Tree

```
src/
├── app/                      # Bootstrap & initialization
│   ├── i18n/                 # Locales (en.json, ar.json)
│   ├── App.vue               # Root component
│   └── main.ts               # Entry point
├── components/
│   ├── ui/                   # Base primitives (Button, Modal, Input, Select)
│   └── layout/               # Shell (AppHeader, AppToaster)
├── features/
│   └── branches/             # Feature module (vertical slice)
│       ├── views/            # Route-level components
│       ├── components/       # Feature-specific UI
│       ├── composables/      # Business logic layer (14 composables)
│       ├── stores/           # Feature state (Pinia)
│       ├── utils/            # Domain utilities + validation policies
│       └── types/            # Feature-specific types
├── composables/              # Cross-feature composables (10 shared)
├── services/                 # HTTP client + API boundary
├── stores/                   # Global UI state
├── utils/
│   └── policies/             # Validation rules (150+ edge-case tests)
├── types/                    # TypeScript definitions
└── constants/                # Type-safe constants (API, i18n keys, testids)

tests/
├── unit/                     # 713 tests (mirrors src/ structure)
├── e2e/                      # 114 Playwright tests (offline mode)
│   ├── fixtures/             # Mock API responses
│   └── setup/                # Route interception logic
```

### Key Design Decisions

#### 1. Composable-First Architecture
Business logic extracted into Vue 3 composables. Components remain under 150 SLOC (ESLint-enforced), containing only presentation logic.

**Example: Branch Settings Decomposition**
```typescript
useSettingsForm()       // Form state & hydration
useSettingsValidation() // Real-time validation with i18n errors
useSlotsManagement()    // CRUD for time slots
useSettingsActions()    // Orchestration (save/cancel/reset)
```

Benefits: Testable isolation, reusability, clear separation of concerns.

#### 2. Service Layer Abstraction
HTTP boundary with interceptors for:
- Auth token injection (`Authorization: Bearer`)
- Error normalization to `IApiError`
- Retry logic and request/response logging

Stores and composables consume typed service methods—**never import axios directly**.

#### 3. Error Handling Pipeline
Three-layer transformation eliminates error logic from components:
1. **HTTP Interceptor** → Normalizes to `IApiError`
2. **Composables** → Maps error codes to i18n keys
3. **UI Store** → Renders toast notifications

#### 4. Constants as Types
All magic values centralized in `src/constants/`:
- API endpoints, params, includes
- Test IDs for E2E stability
- i18n keys (compile-time checks)
- Validation limits, regex patterns

TypeScript catches string typos at build time that would surface at runtime.

#### 5. Edge-Case Policy Enforcement
Time slot validation isolated as pure functions in `src/utils/policies/` with **20-40 tests per policy**:
- Overlap detection (touching vs. overlapping)
- Midnight boundary handling
- Duration bounds (5-1440 minutes)
- Slot limits (≤3 per day)
- Null safety

See `/docs/EDGE_CASE_POLICIES.md` for full specification.

#### 6. Import Aliases
Path aliases prevent `../../../` hell:
```typescript
import { useBranchesStore } from '@features/branches/stores/branches.store'
import BaseButton from '@components/ui/BaseButton.vue'
import { API_ENDPOINT_BRANCHES } from '@constants/api'
```

Configured in `tsconfig.json` + `vite.config.ts` for both TypeScript and runtime resolution.

## Maintainability Policy (≤ 150 Lines/File)

**Goal**: Keep files small, focused, and easy to review/maintain.

**Guidelines**:
- Split large components into smaller sub-components/composables
- Extract reusable logic to `/src/composables` or `/src/services`
- Avoid "god" files; prefer cohesion

**Enforced ESLint Rules**:

| Rule | Limit | Applied To | Purpose |
|------|-------|------------|---------|
| `max-lines` | 150 | Source files | Keep files focused and reviewable |
| `max-lines` | 400 | Test files | Allow comprehensive test coverage |
| `max-lines-per-function` | 50 | All functions | Enforce single responsibility |
| `complexity` | 8 | All functions | Limit cyclomatic complexity |
| `max-depth` | 2 | All code | Prevent nested logic |
| `max-params` | 4 | All functions | Encourage parameter objects |
| `max-nested-callbacks` | 2 | All code | Flatten callback chains |

**Sample ESLint Configuration** (from `.eslintrc.cjs`):

```javascript
{
  "rules": {
    "max-lines": ["error", { "max": 150, "skipBlankLines": true, "skipComments": true }],
    "max-lines-per-function": ["error", { "max": 50, "skipBlankLines": true, "skipComments": true }],
    "complexity": ["error", 8],
    "max-depth": ["error", 2],
    "max-params": ["error", 4],
    "max-nested-callbacks": ["error", 2],

    // Strict bans
    "eslint-comments/no-use": ["error", { "allow": [] }],
    "@typescript-eslint/ban-ts-comment": ["error", {
      "ts-ignore": true,
      "ts-expect-error": true,
      "minimumDescriptionLength": 999
    }],
    "no-warning-comments": ["error", { "terms": ["todo", "fixme"], "location": "anywhere" }],

    // Import organization
    "import/order": ["error", {
      "groups": [["builtin", "external"], "internal", ["parent", "sibling"]],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  }
}
```

## Feature Coverage Matrix

| # | Requirement | Implemented In | Validation | Notes |
|---|-------------|----------------|------------|-------|
| 1 | Single-page to manage reservations | `BranchesListView.vue` | ✅ E2E smoke | Vue 3 SPA, no routing needed |
| 2 | List enabled branches (columns: name, ref, duration, tables) | `BranchesTable.vue`, `reservableTablesCount()` | ✅ Unit + E2E | Responsive: table (desktop), cards (mobile) |
| 3 | Add Branches modal (enable disabled) | `AddBranchesModal.vue`, `getAllBranches()` | ✅ Unit + E2E | Handles pagination (50/page), search/filter |
| 4 | Disable Reservation (all) | `DisableAllButton.vue`, `useDisableAll.ts` | ✅ Unit + E2E | Batch PUT requests, excludes deleted branches |
| 5 | Settings popup on row click | `BranchSettingsModal.vue` | ✅ E2E | Lazy-loaded async component |
| 6 | Duration ≥ 5 minutes | `reservation.validation.ts:42` | ✅ 33 tests | Error: `settings.errors.durationMin` |
| 7 | Tables dropdown: {section} - {table} | `tables.ts:formatTableLabel()` | ✅ Unit | ASCII hyphen (U+002D), not dash |
| 8 | Slots: add/edit/delete, ≤3/day | `DaySlotsEditor.vue`, `slotEditorActions.ts` | ✅ 26 tests | Add button disabled at limit, validation on blur |
| 9 | Apply Saturday → all days (clip ≤3) | `useSlotsManagement.ts:269-296` | ✅ Unit + E2E | Confirmation dialog, info toast on clip |

## API Integration (Foodics)

### Base Configuration

```bash
# .env.local (gitignored)
VITE_API_BASE_URL=https://api.foodics.dev/v5  # Optional (defaults to /api)
VITE_FOODICS_TOKEN=<your_bearer_token>         # Required
```

**Dev Server Proxy** (bypasses CORS):
```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.foodics.dev/v5',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### Example Requests

**GET Branches with Sections & Tables**
```typescript
GET /api/branches?include[0]=sections&include[1]=sections.tables
Authorization: Bearer {VITE_FOODICS_TOKEN}

Response: {
  data: IBranch[],
  links: { first, last, prev, next },
  meta: { current_page, last_page, per_page, total }
}
```

**PUT Enable/Disable Branch**
```typescript
PUT /api/branches/{id}
{ "accepts_reservations": true }

Response: { data: IBranch }
```

**PUT Update Settings**
```typescript
PUT /api/branches/{id}
{
  "reservation_duration": 90,
  "reservation_times": {
    "saturday": [["09:00", "12:00"], ["15:00", "18:00"]],
    "sunday": [["09:00", "12:00"]],
    // ... other days
  }
}
```

### Pagination Strategy

Foodics API enforces **50 items/page** (non-configurable). For operations requiring complete data (Add Branches modal):

1. Fetch page 1 → extract `meta.last_page`
2. If `last_page > 1`: Fetch remaining pages **in parallel** (2x faster than sequential)
3. Merge all `data` arrays

Implementation: `BranchesService.getAllBranches()` at `src/services/branches.service.ts:93-120`

## Internationalization (AR/EN)

### Locale Support

- **Languages**: English (default), Arabic
- **Toggle**: Header locale switcher (persists to localStorage via `useLocale.ts`)
- **RTL**: Automatic layout mirroring via `dir="rtl"` on `<html>`
- **Config**: `src/app/i18n/index.ts` with full datetime/number formatting

### RTL Implementation

**Tailwind Logical Properties** (direction-agnostic):
```css
/* ❌ Old way (breaks in RTL) */
ml-4, mr-2, pl-6, pr-4

/* ✅ New way (flips automatically in RTL) */
ms-4, me-2, ps-6, pe-4
```

**Selective Icon Mirroring**:
- Arrows/chevrons: Flip via CSS `transform: scaleX(-1)`
- Close icons (×): Remain directional

### Date/Time Formatting

Locale-aware via `vue-i18n` `datetimeFormats`:
```typescript
en: { currency: 'USD', short: 'Jan 1, 2024' }
ar: { currency: 'SAR', short: '١ يناير ٢٠٢٤' }  // Arabic numerals
```

## Scripts

Available npm scripts from `package.json`:

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite --port 5173` | Start development server at http://localhost:5173 |
| `build` | `vue-tsc && vite build` | Type-check and build for production |
| `preview` | `vite preview` | Preview production build locally |
| `typecheck` | `vue-tsc --noEmit` | Run TypeScript type checking without emit |
| `lint` | `eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix` | Lint and auto-fix all files |
| `lint:imports` | `eslint . --rule 'import/no-relative-parent-imports: error' --fix` | Enforce import alias usage |
| `lint:fix` | `eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix` | Same as `lint` |
| `format` | `prettier --write "src/**/*.{js,ts,vue,css,scss,md}"` | Format code with Prettier |
| `test:unit` | `vitest run` | Run unit tests (CI mode) |
| `test:unit:watch` | `vitest` | Run unit tests in watch mode |
| `test:e2e` | `playwright test` | Run all E2E tests (offline mode) |
| `test:e2e:ui` | `playwright test --ui` | Run E2E tests with Playwright UI |
| `test:e2e:headed` | `playwright test --headed` | Run E2E tests with visible browser |
| `test:e2e:debug` | `PWDEBUG=1 playwright test --timeout=0 --retries=0 --workers=1` | Debug E2E tests step-by-step |
| `test:e2e:smoke` | `playwright test tests/e2e/smoke.spec.ts tests/e2e/app-shell.spec.ts` | Run critical path smoke tests (114 tests) |

## Testing Strategy

### Unit Tests: 713 Tests, 81.14% Coverage

**Technology**: Vitest + @vue/test-utils + axios-mock-adapter

**Coverage Report** (from latest run):

| Metric | Coverage | Notes |
|--------|----------|-------|
| **Statements** | 81.14% | Exceeds 80% requirement ✅ |
| **Branches** | 88.84% | Conditional logic coverage |
| **Functions** | 88.88% | Function invocation coverage |
| **Lines** | 81.14% | Line execution coverage |

**Key Test Suites**:
- **Composables**: Business logic isolation (validation, state, actions)
- **Components**: UI rendering, event emission, accessibility
- **Services**: HTTP mocking, pagination logic, error handling
- **Utils/Policies**: Edge cases (150+ validation tests)
- **Stores**: State mutations, side effects

**Execution**: `<5s` in CI mode, real-time feedback in watch mode.

**How to Enable Coverage** (already configured):
```json
// vitest.config.ts
{
  "test": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "exclude": ["**/*.spec.ts", "**/node_modules/**"]
    }
  }
}
```

### E2E Tests: 114 Tests, 100% Pass Rate

**Technology**: Playwright (Chromium, Firefox, WebKit + Arabic variants)

**E2E Test Status** (from smoke test suite):

| Suite | Total Tests | Passed | Failed | Skipped | Browser Coverage |
|-------|-------------|--------|--------|---------|------------------|
| **App Shell** | 57 | 57 | 0 | 0 | Chrome, FF, WebKit (EN+AR) |
| **Smoke Tests** | 57 | 57 | 0 | 0 | Chrome, FF, WebKit (EN+AR) |
| **Total** | **114** | **114** | **0** | **0** | **6 browsers** |

**Offline E2E Strategy** (no real API calls):
- Route interception via `page.route('/api/**', handler)`
- Fixture-based responses (JSON in `tests/e2e/fixtures/`)
- Test-only token (never real credentials)
- Deterministic execution (no network flakiness)

**Coverage**:
- ✅ Critical user flows (enable/disable, settings CRUD)
- ✅ EN/AR locale switching with RTL validation
- ✅ Accessibility (ARIA, keyboard nav, focus management)
- ✅ Cross-browser compatibility (Chromium/Firefox/WebKit)

**Rationale for Offline**:
Eliminates test flakiness from network conditions, removes need for test data coordination, ensures deterministic execution, enables CI without API dependencies.

### Commands

```bash
# Unit tests
npm run test:unit           # CI mode (single run)
npm run test:unit:watch     # Watch mode (dev)

# E2E tests
npm run test:e2e            # All browsers, headless
npm run test:e2e:ui         # Playwright UI (debug)
npm run test:e2e:smoke      # Critical path only (114 tests)
npm run test:e2e:headed     # Watch browser execution
npm run test:e2e:debug      # Step-by-step debugging
```

## Setup & Development

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Playwright browsers (E2E only, first time)
npx playwright install --with-deps
```

### Environment Configuration

```bash
# Create local env file (gitignored)
cp .env.e2e .env.local

# Configure your Foodics API token
# .env.local
VITE_FOODICS_TOKEN=your-actual-token-here
VITE_API_BASE_URL=https://api.foodics.dev/v5  # Optional (defaults to /api proxy)
```

**Environment Variables**:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_FOODICS_TOKEN` | ✅ Yes | – | Foodics API Bearer token |
| `VITE_API_BASE_URL` | No | `/api` | API base URL (proxied by Vite dev server) |

**How Proxy Works**: Dev server proxies `/api/*` → `https://api.foodics.dev/v5/*` to bypass CORS.

### Development Server

```bash
npm run dev
# → http://localhost:5173

# Vite auto-proxies /api → API_BASE_URL (CORS bypass)
```

### Quality Gates

Run before committing:

```bash
npm run typecheck  # TypeScript strict mode (0 errors)
npm run lint       # ESLint (no disable directives)
npm run test:unit  # Vitest (713 tests)
npm run test:e2e:smoke  # Playwright critical path (114 tests)
```

### Production Build

```bash
npm run build      # Outputs to dist/ (~88 KB gzipped)
npm run preview    # Preview build at http://localhost:4173
```

## Code Quality Standards

### ESLint Configuration (Strict)

**Zero-tolerance rules**:
- ❌ No `eslint-disable` comments (`eslint-comments/no-use`)
- ❌ No TypeScript suppressions (`@ts-ignore`, `@ts-expect-error`)
- ❌ No `TODO`/`FIXME` in source (tests OK)
- ❌ No `console.*` in `src/` (tests allowed)
- ⚠️ Max 150 lines per file (400 for tests)
- ⚠️ Max 50 lines per function
- ⚠️ Max cyclomatic complexity: 8
- ⚠️ Max nesting depth: 2

### TypeScript Strict Mode

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "noPropertyAccessFromIndexSignature": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Philosophy**: Catch errors at compile time. No runtime assertions or `any` escape hatches.

### Import Order Convention

**Enforced by ESLint** (`import/order`):

```typescript
// 1. Vue core (external, before position)
import { ref, computed } from 'vue'

// 2. External libraries (builtin/external group)
import axios from 'axios'

// 3. Internal aliases (alphabetical)
import BaseButton from '@components/ui/BaseButton.vue'
import { API_ENDPOINT_BRANCHES } from '@constants/api'
import { useBranchesStore } from '@features/branches/stores/branches.store'

// 4. Relative imports (parent/sibling)
import type { IApiError } from '@/types/api'
```

Auto-sorted with `newlines-between: always`.

## Accessibility

**Target**: WCAG 2.1 AA compliance (Lighthouse 95+)

**Implementation**:
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ ARIA roles and labels on all interactive elements
- ✅ Focus management (modal trap, Esc-to-close, restoration)
- ✅ Visible focus indicators (no `outline: none`)
- ✅ Keyboard navigation (all actions accessible without mouse)
- ✅ Skip-to-main link for keyboard users

**Validation**: Accessibility smoke tests in E2E suite (`tests/e2e/a11y.*.spec.ts`)

## Performance

**Production Bundle** (gzipped):
- CSS: ~6 KB
- JavaScript: ~82 KB
- **Total**: ~88 KB

**Optimizations**:
- Zero heavy dependencies (no moment.js, lodash, UI libs)
- Vite automatic code splitting
- Async component lazy loading (`defineAsyncComponent`)
- Minimal polyfills (ES2020 target)

## How to Run

### Development Workflow

```bash
# Start dev server
npm run dev

# Concurrent terminals (recommended)
npm run test:unit:watch  # Watch unit tests
npm run lint             # Auto-fix on save (if IDE configured)
```

### Pre-Commit Checklist

Before creating a PR, ensure:
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 warnings
- [ ] `npm run test:unit` — 713/713 passing
- [ ] `npm run test:e2e:smoke` — 114/114 passing
- [ ] Components under 150 lines
- [ ] No TypeScript suppressions
- [ ] User-facing changes tested in EN and AR
- [ ] Accessibility verified (keyboard + screen reader)

## Conventions

### Commit Format (Conventional Commits)

```
feat(branches): add bulk enable/disable
fix(i18n): correct Arabic weekday ordering
docs(readme): update architecture section
test(slots): add edge case for midnight boundary
refactor(validation): extract policy functions
```

### Branch Strategy

```
feat/feature-name
fix/bug-description
refactor/scope-description
docs/documentation-update
test/test-improvement
```

**Rule**: Never commit directly to `main`. All changes via PR.

## Project Management

**Trello Board**: [https://trello.com/b/SBqFAxrb](https://trello.com/b/SBqFAxrb)

Track progress, sprint planning, and task breakdown in the linked board.

---

**Hussein Tirawi** | 2025
*Senior Frontend Engineer*
