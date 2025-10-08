## API Service Layer

**Purpose:** Centralized HTTP client and service modules for all API interactions.

### HTTP Client (`src/services/http.ts`)

**Responsibilities:**
- Configure axios instance with base URL and auth headers
- Normalize all API errors to consistent shape: `{ status, message, details }`
- Intercept responses and transform error structures

**Error Normalization:**

```typescript
interface INormalizedError {
  status: number;
  message: string;
  details?: unknown;
}
```

All API errors are caught and transformed:
- HTTP status codes → `status` field
- Error messages → human-readable `message`
- Additional context → `details` (optional)

**Usage:**

```typescript
import { httpClient } from '@/services/http';

const response = await httpClient.get('/api/branches');
// Throws INormalizedError on failure
```

### Branches Service (`src/services/branches.service.ts`)

**Endpoints:**

| Method | Path | Purpose | Returns |
|--------|------|---------|---------|
| `GET` | `/api/v5/branches` | Fetch all branches | `IBranch[]` |
| `POST` | `/api/v5/branches` | Create branch | `IBranch` |
| `PUT` | `/api/v5/branches/:id` | Update branch | `IBranch` |

**Query Parameters:**

- `include`: Comma-separated includes (e.g., `business,working_hours`)
- `per_page`: Pagination limit (default: 50)

**Example:**

```typescript
import { fetchBranches, updateBranch } from '@/services/branches.service';

// Fetch with includes
const branches = await fetchBranches({ include: 'business,working_hours' });

// Update branch
const updated = await updateBranch('branch-id', {
  name: { en: 'Main Branch', ar: 'الفرع الرئيسي' },
  max_reservations_per_slot: 10,
});
```

### Error Handling

Services throw normalized errors that composables/stores catch and map to user-friendly messages:

```typescript
try {
  await updateBranch(id, payload);
} catch (error) {
  // error is INormalizedError
  // Composable maps to i18n key via useErrorMapper
}
```

### Security

- **No secrets in code**: Token from environment variable `VITE_FOODICS_TOKEN`
- **Bearer auth**: Added via axios interceptor
- **No credentials in logs**: Axios debug disabled in production

### Testing

Services are tested offline with `axios-mock-adapter`:

```typescript
import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@/services/http';

const mock = new MockAdapter(httpClient);
mock.onGet('/api/v5/branches').reply(200, { data: [...] });
```

See `tests/unit/services/` for examples.

