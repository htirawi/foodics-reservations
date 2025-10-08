## State Management (Pinia Stores)

**Purpose:** Domain state, orchestration, optimistic updates, and rollback strategies.

### Store Architecture

Stores handle:
- **State management**: Domain entities (branches, UI state)
- **Orchestration**: Coordinate service calls and composables
- **Optimistic updates**: Update UI immediately, rollback on error
- **Error handling**: Catch service errors and trigger toast notifications

Stores **do not**:
- Contain UI logic (that's in components)
- Make direct DOM manipulations
- Handle routing (that's in components/router)

---

### Branches Store (`src/features/branches/stores/branches.store.ts`)

**State:**

```typescript
interface IBranchesState {
  branches: IBranch[];
  loading: boolean;
  error: INormalizedError | null;
}
```

**Actions:**

| Action | Purpose | Optimistic? |
|--------|---------|-------------|
| `fetchBranches` | Load all branches | No |
| `updateBranch` | Update single branch | Yes |
| `bulkEnableBranches` | Enable multiple branches | Yes |
| `bulkDisableBranches` | Disable multiple branches | Yes |
| `applySettingsToAll` | Apply settings to all branches | Yes |

**Optimistic Update Pattern:**

```typescript
async updateBranch(id: string, payload: Partial<IBranch>) {
  // 1. Save snapshot
  const snapshot = [...this.branches];
  
  // 2. Optimistic update
  const index = this.branches.findIndex(b => b.id === id);
  if (index !== -1) {
    this.branches[index] = { ...this.branches[index], ...payload };
  }
  
  try {
    // 3. Call service
    const updated = await updateBranch(id, payload);
    
    // 4. Sync with server response
    this.branches[index] = updated;
    
    return updated;
  } catch (error) {
    // 5. Rollback on error
    this.branches = snapshot;
    throw error;
  }
}
```

**Usage in Components:**

```vue
<script setup lang="ts">
import { useBranchesStore } from '@/features/branches/stores/branches.store';

const branchesStore = useBranchesStore();

const handleUpdate = async (id: string, payload: Partial<IBranch>) => {
  try {
    await branchesStore.updateBranch(id, payload);
    // Success feedback handled by composable
  } catch (error) {
    // Error feedback handled by composable
  }
};
</script>
```

---

### UI Store (`src/stores/ui.store.ts`)

**State:**

```typescript
interface IUIState {
  modals: Map<string, IModalState>;
  toasts: IToast[];
  confirms: Map<string, IConfirmState>;
}
```

**Actions:**

| Action | Purpose |
|--------|---------|
| `openModal(id, props?)` | Open modal by ID |
| `closeModal(id)` | Close modal by ID |
| `addToast(toast)` | Show toast notification |
| `removeToast(id)` | Dismiss toast |
| `openConfirm(id, props)` | Show confirmation dialog |
| `resolveConfirm(id, result)` | Resolve confirmation |

**Modal Management:**

```typescript
// Open modal
uiStore.openModal('add-branches', { 
  onSuccess: () => branchesStore.fetchBranches() 
});

// Close modal
uiStore.closeModal('add-branches');
```

**Toast Notifications:**

```typescript
uiStore.addToast({
  id: crypto.randomUUID(),
  type: 'success',
  message: t('branches.updateSuccess'),
  duration: 3000,
});
```

---

### Store Testing

Stores are tested with Pinia's `createPinia()` and mock services:

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useBranchesStore } from '@/features/branches/stores/branches.store';

describe('BranchesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should rollback on update error', async () => {
    const store = useBranchesStore();
    // Mock service to throw error
    // Assert state rollback
  });
});
```

See `tests/unit/stores/` for examples.

---

### Best Practices

1. **Optimistic updates**: For better UX, update state immediately and rollback on error
2. **Error propagation**: Let errors bubble to composables for user feedback
3. **Snapshots**: Always save state before optimistic changes
4. **Immutability**: Use `...spread` or `structuredClone` for snapshots
5. **Single responsibility**: One store per domain/feature
6. **Composables for logic**: Extract complex selection/filtering to composables
