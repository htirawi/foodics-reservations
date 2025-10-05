# Store Architecture & State Management

**Created:** October 5, 2025  
**Status:** Active

---

## Overview

This document explains our Pinia-based state management architecture, focusing on separation of concerns, optimistic updates, and testing strategy.

---

## Architecture Principles

### 1. Ownership Boundaries

We maintain strict separation between layers:

| **Layer**        | **Responsibility**                                 | **Example**                             |
|------------------|----------------------------------------------------|-----------------------------------------|
| **Stores**       | Business state, domain logic, orchestration        | `branches.store.ts`, `ui.store.ts`      |
| **Services**     | HTTP calls, API communication, no state            | `branches.service.ts`, `http.ts`        |
| **Composables**  | Reusable view logic, no direct API calls           | `useModal`, `useToast`, `useLocale`     |
| **Components**   | Presentation only; delegate all logic to stores    | `BranchList.vue`, `SettingsModal.vue`   |

**Key rules:**
- Stores **never** make direct `axios` calls; they delegate to services
- Services are **stateless**; they only handle HTTP and return typed data
- Composables provide **thin wrappers** around store APIs for convenience
- Components **never** hold business state; they consume stores via composition

---

## Store Types

### Domain Stores (e.g., `branches.store.ts`)

**Purpose:** Manage business entities, their relationships, and operations.

**Location:** `src/features/<domain>/stores/`

**State:**
- Core entity collections (`branches: Branch[]`)
- Loading/error states per operation
- Selection/filtering metadata

**Getters:**
- Derived views (`enabledBranches`, `branchById`)
- Computed aggregates (`reservableTablesCount`)

**Actions:**
- CRUD operations with optimistic updates
- Orchestration of multiple service calls
- Error handling and rollback

### UI Store (`ui.store.ts`)

**Purpose:** Application-wide UI state (modals, toasts, confirmation dialogs).

**Location:** `src/stores/ui.store.ts`

**State:**
- `openModals`: Set of currently visible modal names
- `toasts`: Array of active toast notifications
- `confirmDialog`: Confirmation dialog state and resolver

**Actions:**
- `openModal(name)`, `closeModal(name)`, `isModalOpen(name)`
- `notify(message, type, duration)`, `removeToast(id)`
- `confirm(options): Promise<boolean>`, `resolveConfirm(confirmed)`

**Why separate UI store?**
- Prevents UI concerns from polluting domain stores
- Allows components to coordinate without tight coupling
- Simplifies testing (mock UI interactions independently)

---

## Optimistic Updates + Rollback

**Goal:** Make the UI feel instant, even when the network is slow; revert gracefully on failure.

### Strategy

1. **Snapshot** current state before mutation
2. **Apply** optimistic change immediately
3. **Call** service (async)
4. On **success**: keep optimistic state (or replace with server response)
5. On **failure**: restore snapshot + set error message

### Example: `enableBranches(ids: string[])`

```typescript
async function enableBranches(ids: string[]): Promise<void> {
  const snapshot = branches.value.map((b) => ({ ...b }));

  // Optimistic update
  branches.value = branches.value.map((b) =>
    ids.includes(b.id) ? { ...b, accepts_reservations: true } : b
  );

  try {
    await Promise.all(ids.map((id) => BranchesService.enableBranch(id)));
  } catch (err) {
    // Rollback on failure
    branches.value = snapshot;
    error.value = (err as ApiError).message ?? 'Failed to enable branches';
    throw err;
  }
}
```

**Benefits:**
- UI updates instantly; no spinner for every action
- User can continue interacting while request is in flight
- Errors are handled gracefully without leaving inconsistent state

**When to use:**
- Operations with predictable outcomes (enable/disable, simple updates)
- Actions where immediate feedback improves UX

**When to avoid:**
- Operations with complex server-side logic (calculated fields, side effects)
- Actions where server validation is critical (use loading state instead)

---

## Testing Approach

### Unit Tests (Vitest)

**Goal:** Test store behavior in isolation; mock all services.

**Location:** `tests/unit/stores/`

**Strategy:**
1. **Mount Pinia** with `setActivePinia(createPinia())` per test
2. **Mock services** using `vi.mock('@/services/...')`
3. **Assert behavior**, not implementation:
   - Does `fetchBranches` populate state on success?
   - Does `enableBranches` optimistically update, then call service?
   - Does rollback restore snapshot on failure?
   - Do getters compute correct derived values?

**Coverage requirements:**
- All actions: happy path + error path
- All getters: edge cases (empty, null, filtering)
- Optimistic + rollback paths for mutating actions

### E2E Tests (Playwright)

**Goal:** Validate store integration with real API (or mocked API) and UI.

**Location:** `tests/e2e/`

**Strategy:**
1. Intercept API calls with Playwright (`page.route(...)`)
2. Trigger user actions in the UI
3. Assert UI reflects optimistic updates
4. Simulate API success/failure responses
5. Assert UI reflects final state (success or rollback)

**Coverage requirements:**
- Critical user flows (list branches, enable/disable, update settings)
- Optimistic UI behavior (does UI update before API responds?)
- Error states (does UI show error toast and revert on failure?)

---

## Expansion Guidelines

### Adding a New Store

1. **Decide scope**: domain store (`features/<domain>/stores/`) or UI concern (`stores/`)?
2. **Define state shape**: keep minimal; derive via getters
3. **Write actions**: small, focused; delegate IO to services
4. **Add tests**: unit tests for all actions/getters; mock services
5. **Document**: update this file with ownership boundaries and key patterns

### Adding Optimistic Updates

1. **Snapshot** state before mutation
2. **Apply** optimistic change
3. **Call** service
4. On error: **restore snapshot** + set `error.value`
5. **Test both paths**: success keeps optimistic state; failure rolls back

### Composables vs. Store Actions

**Use composables when:**
- Logic is reusable across multiple components
- No direct state mutation (reading only)
- Wrapping framework APIs (i18n, routing)

**Use store actions when:**
- Logic mutates domain state
- Orchestrates multiple service calls
- Requires optimistic updates or error handling

---

## References

- [Pinia Docs](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Optimistic UI Patterns](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [Testing Pinia Stores](https://pinia.vuejs.org/cookbook/testing.html)

---

## Talking Points (for interviews)

1. **Separation of concerns**: stores own state, services handle IO, composables wrap reusable logic
2. **Optimistic updates**: UI feels instant; rollback on failure ensures consistency
3. **Testing strategy**: unit tests mock services and verify behavior; e2e tests validate integration
4. **Scalability**: domain stores under `features/<domain>/`; UI store centralized; clear boundaries prevent coupling
5. **Type safety**: all state/actions/getters fully typed; no `any` or `unknown`; import types from `@/types`
6. **Framework idioms**: Pinia setup stores; Composition API; reactive primitives (`ref`, `computed`)
