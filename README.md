# Foodics Reservations

Enterprise-grade restaurant reservation management system built with Vue 3, TypeScript strict mode, and comprehensive test coverage (982 tests: 868 unit + 114 E2E).

## Overview

Multi-branch reservation management with configurable time slots, duration controls, and table allocation. Features full internationalization (EN/AR), RTL support, and offline-capable E2E testing.

**Key characteristics:**
- Zero runtime dependencies beyond Vue 3 ecosystem (4 packages)
- TypeScript strict mode with no escape hatches
- 150+ edge-case policy tests for time slot validation
- Component complexity caps enforced via ESLint (≤150 SLOC, complexity ≤8)
- Offline E2E testing via Playwright route interception

## Technical Stack

**Runtime Dependencies (4):**
- Vue 3 (Composition API, `<script setup>`)
- Pinia (state management)
- vue-i18n (i18n with RTL support)
- Axios (HTTP client)

**Development:**
- TypeScript (strict mode, all safety flags enabled)
- Vite (build tool)
- Tailwind CSS (utility-first, logical properties for RTL)
- Vitest (unit testing, ~5s execution)
- Playwright (E2E testing, offline)

**Rationale for minimal dependencies:** Building UI primitives in-house maintains bundle size (~88 KB gzipped), ensures full control over accessibility implementation, and eliminates third-party library maintenance overhead.

## Architecture

### Project Structure

```
src/
  app/                    # Bootstrap and initialization
  components/
    ui/                   # Base primitives (Button, Modal, Input, Select)
    layout/               # Application shell (Header, Toaster)
  features/
    branches/             # Feature module (vertical slice architecture)
      views/              # Route-level components
      components/         # Feature-specific UI
      composables/        # Business logic extraction layer
      stores/             # Feature state (Pinia)
      services/           # API boundary
      utils/              # Domain utilities
  composables/            # Cross-feature composables
  services/               # HTTP client and shared services
  stores/                 # Global UI state
  utils/
    policies/             # Validation rule enforcement (150+ tests)
  types/                  # TypeScript definitions
  constants/              # Centralized constants (type-safe)
```

### Design Patterns

**Composable-First Architecture:**
Business logic extracted into composables following Vue 3's Composition API pattern. Components contain only presentation logic (<150 SLOC), with all business rules, state management, and side effects isolated in testable composables.

Example decomposition for branch settings:
- `useSettingsForm()` — form state and hydration
- `useSettingsValidation()` — real-time validation with i18n error mapping
- `useSlotsManagement()` — CRUD operations for time slots
- `useSettingsActions()` — orchestration layer (save/cancel/reset)

**Service Layer:**
HTTP boundary abstraction with interceptors for auth injection, error normalization, and retry logic. Stores and composables consume typed service methods, never touching axios directly.

**Error Handling Pipeline:**
Three-layer error transformation:
1. HTTP interceptor normalizes API errors to `IApiError`
2. Composables map error codes to i18n keys
3. UI store renders toast notifications

This eliminates error handling logic from components entirely.

**Constants as Types:**
All magic values (API endpoints, test IDs, validation limits, i18n keys) centralized in `src/constants/`. TypeScript enforces compile-time checks for string literal typos that would otherwise surface at runtime.

**Edge-Case Policy Enforcement:**
Time slot validation isolated in `src/utils/policies/` as pure, exhaustively tested functions (20-40 tests per policy). Handles:
- Overlap detection (touching vs. overlapping boundaries)
- Midnight boundary constraints
- Duration limit validation
- Null safety

See `docs/EDGE_CASE_POLICIES.md` for comprehensive policy documentation.

## Internationalization & RTL

**Locale Support:** English and Arabic with bidirectional text support.

**RTL Implementation:**
- Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of directional (`ml-*`, `mr-*`)
- Automatic layout mirroring via `dir="rtl"` on root element
- Selective icon mirroring via CSS transforms (arrows/chevrons flip, close icons remain directional)

**Persistence:** Locale selection persisted to `localStorage` and restored on mount via `useLocale` composable.

## Testing Strategy

**Unit Tests: 868 tests, <5s execution**
- `@vue/test-utils` for component isolation
- `axios-mock-adapter` for HTTP mocking
- Coverage targets: composables, stores, services, utilities, components with conditional logic
- Mirrors `src/` structure under `tests/unit/`

**E2E Tests: 114 tests, offline execution**
- Playwright route interception for all `/api/**` requests
- Fixture-based responses (no real API calls, no auth tokens)
- Coverage: critical flows across EN/AR locales with RTL validation
- Accessibility smoke tests (ARIA roles, keyboard navigation, focus management)
- Stable selectors via `data-testid` attributes

**Offline E2E Rationale:**
Eliminates test flakiness from network conditions, removes need for test data coordination, ensures deterministic execution, and enables CI runs without API dependencies.

**Commands:**
```bash
npm run test:unit           # Vitest watch mode
npm run test:unit -- --run  # CI mode
npm run test:e2e            # Playwright headless
npm run test:e2e:ui         # Playwright UI (debugging)
npm run test:e2e:smoke      # Critical path only
```

## Setup & Development

```bash
# Dependencies
npm install

# Environment configuration
cp env.example .env.local
# Configure: VITE_FOODICS_TOKEN=<token>

# Development server (http://localhost:5173)
npm run dev

# Quality gates
npm run typecheck  # TypeScript strict mode
npm run lint       # ESLint (no disable directives allowed)
npm run test:unit  # Unit test suite
npm run test:e2e   # E2E suite (requires: npx playwright install --with-deps)

# Production build
npm run build      # Outputs to dist/ (~88 KB gzipped)
npm run preview    # Preview build locally
```

## Code Quality Standards

**ESLint Configuration (strict):**
- No `eslint-disable` comments (rule: `eslint-comments/no-use`)
- No TypeScript error suppression (`@ts-ignore`, `@ts-expect-error`)
- No `TODO`/`FIXME` comments in source
- No `console.*` in `src/` (allowed in tests only)
- Max 150 lines per file
- Max cyclomatic complexity: 8
- Max nesting depth: 2

**TypeScript Strict Mode:**
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

Philosophy: Catch errors at compile time. No runtime type assertions or `any` escape hatches.

## Accessibility

**Lighthouse Score Target:** 95+

**Implementation:**
- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA roles and labels on all interactive elements
- Focus management (modal focus trap, Esc-to-close, focus restoration)
- Visible focus indicators (no `outline: none`)
- Keyboard navigation (all actions accessible without mouse)
- Skip-to-main link for keyboard users

Accessibility smoke tests included in E2E suite.

## Performance

**Production Bundle (gzipped):**
- CSS: ~6 KB
- JavaScript: ~82 KB

**Optimizations:**
- No heavy dependencies (no moment.js, lodash, UI frameworks)
- Vite automatic code splitting
- Route-level lazy loading
- Minimal polyfills (modern browser targets)

## Environment Variables

```bash
# .env.local (gitignored)
VITE_API_BASE_URL=https://api.foodics.com/v5  # Optional (defaults to /api)
VITE_FOODICS_TOKEN=<your_token>                # Required for API auth
```

Dev server proxies `/api` to `VITE_API_BASE_URL` to bypass CORS restrictions.

## Contributing

**Branch Strategy:**
```
feat/feature-name
fix/bug-description
refactor/scope-description
```
Never commit directly to `main`.

**Commit Format (Conventional Commits):**
```
feat(branches): add bulk enable/disable
fix(i18n): correct Arabic weekday ordering
docs(readme): update architecture section
```

**Pre-PR Checklist:**
- [ ] `npm run typecheck` — no errors
- [ ] `npm run lint` — no warnings
- [ ] `npm run test:unit` — all passing
- [ ] `npm run test:e2e` — all passing
- [ ] Components under 150 lines
- [ ] No TypeScript error suppressions
- [ ] User-facing changes tested in EN and AR
- [ ] Accessibility verified (keyboard navigation, screen reader)
- [ ] Bundle size impact assessed

## Scaling Considerations

For larger applications, consider:

**Routing:** Add vue-router with lazy-loaded route components. Current implementation uses single-route pattern suitable for scope.

**State Machines:** For complex state transitions (loading/error/retry flows), XState provides better state modeling than boolean flags. Current boolean approach sufficient for CRUD operations.

**Runtime Validation:** Add Zod for API response validation. TypeScript provides compile-time safety only; runtime schema validation catches API contract violations.

**Unified Mocking:** Replace axios-mock-adapter + Playwright intercepts with MSW for consistent mocking across unit and E2E tests.

Current architecture appropriate for single-page CRUD application without premature abstraction.

---

**Hussein Tirawi** | 2024  
Built as technical assessment demonstrating production-grade Vue 3 architecture, comprehensive testing, and senior-level frontend engineering practices.
