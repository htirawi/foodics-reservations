## Architecture Decision Records (ADRs)

This file indexes key architectural decisions made during development.

---

### ADR-0001: Vue 3 + TypeScript Strict + Minimal Dependencies

**Date:** 2025-10-08  
**Status:** Accepted  
**Context:**

Needed a maintainable, performant, and type-safe frontend architecture for managing restaurant reservations with internationalization (EN/AR) and RTL support.

**Decision:**

Use **Vue 3** with **Composition API** (`<script setup>`), **TypeScript strict mode**, and **minimal dependencies** (no UI kits or date libraries).

**Rationale:**

1. **Vue 3 Composition API**:
   - Better TypeScript inference than Options API
   - Clear separation of concerns via composables
   - Smaller bundle size (tree-shakeable)
   - Easier to test and maintain

2. **TypeScript Strict**:
   - Catch errors at compile time
   - No `any`/`unknown` forces explicit typing
   - Better IDE support and refactoring confidence
   - Self-documenting code via types

3. **Minimal Dependencies**:
   - **No UI kits** (e.g., Vuetify, Element Plus):
     - Reduces bundle size (50KB+ per kit)
     - Full control over design tokens and RTL
     - No unused components or styles
   - **No date libraries** (e.g., moment, date-fns):
     - Native `Intl.DateTimeFormat` sufficient
     - Reduces maintenance surface
   - **Tailwind CSS** for styling:
     - Tokens-first design
     - Mobile-first, responsive
     - RTL-friendly via logical properties

**Consequences:**

- **Positive**:
  - Faster builds and smaller bundles
  - Full control over UI and accessibility patterns
  - Easier onboarding (standard Vue/TS/Tailwind)
  - Type safety prevents runtime errors

- **Negative**:
  - Must implement UI primitives (buttons, modals, inputs)
  - No pre-built complex components (datepickers, etc.)

**Mitigation**:
- Create reusable Base components (`UiButton`, `UiModal`) following a11y standards
- Extract complex logic into composables/utils
- Document patterns in `/docs/ui.md`

---

### ADR-0002: Service Layer + Composables + Utils (vs. Heavy State Libraries)

**Date:** 2025-10-08  
**Status:** Accepted  
**Context:**

Needed clear separation between data fetching, business logic, and UI state. Options: all-in-store (Vuex/Pinia heavy), or layered architecture.

**Decision:**

Use a **layered architecture**:
- **Services** (`src/services/**`): HTTP/API layer (axios)
- **Stores** (Pinia): Domain state + orchestration + optimistic updates
- **Composables** (`src/composables/**`): Reusable stateful logic (no DOM)
- **Utils** (`src/utils/**`): Pure helper functions

**Rationale:**

1. **Services for HTTP**:
   - Centralized error normalization
   - Testable offline with `axios-mock-adapter`
   - Single source of truth for API contracts

2. **Stores for State**:
   - Pinia is lightweight and TypeScript-first
   - Handles optimistic updates + rollback
   - Coordinates service calls
   - Doesn't contain business rules (those go in composables/utils)

3. **Composables for Logic**:
   - Reusable across components
   - Easy to test (no DOM)
   - Examples: selection sets, error mapping, async actions

4. **Utils for Pure Functions**:
   - Time conversions, slot validation, table calculations
   - Stateless, side-effect-free
   - 100% unit testable

**Consequences:**

- **Positive**:
  - Clear boundaries and testability
  - Components stay tiny (UI glue only)
  - Logic is reusable and composable
  - Easy to mock and test each layer

- **Negative**:
  - More files/folders than monolithic store
  - Developers must understand the pattern

**Mitigation**:
- Document architecture in `/docs/` (api.md, stores.md, validation.md)
- Enforce component size limits (≤150 SLOC)
- Code reviews ensure logic doesn't leak into components

---

### ADR-0003: Offline E2E Testing with Route Intercepts

**Date:** 2025-10-08  
**Status:** Accepted  
**Context:**

E2E tests need to be deterministic, fast, and safe (no real API calls, no tokens in CI).

**Decision:**

Use **Playwright route intercepts** (`page.route()`) with fixture data; never hit real API.

**Rationale:**

1. **Deterministic**: Fixtures guarantee consistent responses
2. **Fast**: No network latency or rate limits
3. **Safe**: No secrets in CI; no accidental mutations
4. **Offline**: Works without internet or VPN

**Implementation**:
- `tests/e2e/setup/intercepts.ts` configures all `/api/**` routes
- `tests/e2e/fixtures/*.json` contains sample data
- All E2E specs import and apply intercepts

**Example:**

```typescript
import { setupAPIIntercepts } from './setup/intercepts';

test.beforeEach(async ({ page }) => {
  await setupAPIIntercepts(page);
});

test('should load branches', async ({ page }) => {
  await page.goto('/');
  // No real API call; fixture data used
});
```

**Consequences:**

- **Positive**:
  - CI/CD always works (no external dependencies)
  - Tests run in seconds
  - No risk of hitting production API

- **Negative**:
  - Must maintain fixtures (keep in sync with API schema)
  - Doesn't catch real API contract changes

**Mitigation**:
- Unit test services with mocks (validates request shape)
- Document API contracts in `/docs/api.md`
- Manual smoke tests against staging before release

---

### ADR-0004: Constants Centralization

**Date:** 2025-10-08  
**Status:** Accepted  
**Context:**

Magic strings/numbers scattered throughout codebase cause duplication and typos.

**Decision:**

Centralize all constants in `src/constants/*` and import via `@/constants` alias.

**Files:**
- `api.ts` — API endpoints, query params
- `testids.ts` — All `data-testid` values
- `reservations.ts` — Domain constants (weekdays, slot limits)
- `time.ts` — Time conversion factors
- `ui.ts` — Toast types, durations
- etc.

**Rationale:**

1. Single source of truth
2. Prevents typos and duplication
3. Easy refactoring (change in one place)
4. Self-documenting via names

**Example:**

```typescript
import { API_ENDPOINT_BRANCHES, MAX_SLOTS_PER_DAY } from '@/constants';

// Instead of:
// const url = '/api/v5/branches';  // Easy to mistype
// const max = 3;                   // Magic number
```

**Consequences:**

- **Positive**: Consistency, maintainability, refactoring safety
- **Negative**: More imports (minimal impact)

---

### ADR-0005: i18n & RTL from Day 1

**Date:** 2025-10-08  
**Status:** Accepted  
**Context:**

Application must support English (EN) and Arabic (AR) with proper RTL layout.

**Decision:**

Use **vue-i18n** with EN/AR locales, persist choice to `localStorage`, and use Tailwind **logical properties** for RTL.

**Implementation:**

1. **vue-i18n setup** (`src/app/i18n/`):
   - EN/AR JSON locale files
   - Fallback to EN for missing keys

2. **RTL composable** (`src/composables/useRTL.ts`):
   - Sets `<html dir="ltr">` or `<html dir="rtl">`
   - Persists to `localStorage`

3. **Tailwind logical properties**:
   - Use `margin-inline-start` instead of `margin-left`
   - Use `inset-inline-start` instead of `left`
   - Flip directional icons under `[dir="rtl"]`

4. **E2E tests**:
   - Run for both EN and AR
   - Assert `document.documentElement.dir`

**Rationale:**

- **Requirement**: Multi-language support is mandatory
- **Best practice**: Easier to build in from start than retrofit
- **Accessibility**: Proper RTL ensures usability for Arabic readers

**Consequences:**

- **Positive**: Full i18n/RTL support out of the box
- **Negative**: Must maintain two locale files

**Mitigation**:
- Centralized i18n keys in `src/constants/i18n-keys.ts`
- E2E tests catch missing translations

---

### Future ADRs

As the project evolves, document major decisions here:

- ADR-0006: Authentication strategy (if added)
- ADR-0007: Caching strategy (if added)
- ADR-0008: Real-time updates (if added)
- ADR-0009: Mobile app strategy (if expanded)

**Format:**

```markdown
### ADR-NNNN: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded
**Context:** What is the issue we're facing?
**Decision:** What did we decide?
**Rationale:** Why did we decide this?
**Consequences:** What are the trade-offs?
```

