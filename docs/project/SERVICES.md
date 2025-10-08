# 🌐 Services Reference

This document covers all services in `src/services/`. Services handle API communication and external integrations.

## 📋 **Services Overview**

| Service | Purpose | Key Methods | Usage |
|---------|---------|-------------|-------|
| `http.ts` | Centralized HTTP client | GET, POST, PUT, DELETE | All API calls |
| `branches.service.ts` | Branches API operations | CRUD operations for branches | Branch management |

---

## 🌐 **HTTP Client**

**File**: `src/services/http.ts`  
**Purpose**: Centralized Axios instance with authentication, error handling, and configuration

### **Configuration**
```typescript
const httpClient = axios.create({
  baseURL: "/api",                    // Proxy to Foodics API
  headers: {
    "Content-Type": "application/json",
  },
});
```

### **Request Interceptor**
```typescript
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = import.meta.env.VITE_FOODICS_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: AxiosError) => Promise.reject(error));
```

**Features**:
- **Automatic Authentication**: Adds Bearer token from environment variables
- **Error Handling**: Rejects on request errors

### **Response Interceptor**
```typescript
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const normalized: ApiError = {
      status: error.response?.status ?? 500,
      message: error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        "Network error occurred",
      details: error.response?.data,
    };
    return Promise.reject(normalized);
  }
);
```

**Features**:
- **Error Normalization**: All errors follow the same `ApiError` format
- **Fallback Messages**: Provides meaningful error messages
- **Status Codes**: Preserves HTTP status codes

### **Type Definitions**
```typescript
interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

interface FoodicsResponse<T> {
  data: T;
}
```

### **Usage Examples**

#### **Direct HTTP Client Usage**
```typescript
import { httpClient } from '@/services/http';

// GET request
const fetchData = async () => {
  try {
    const { data } = await httpClient.get<FoodicsResponse<Branch[]>>('/branches');
    return data.data;
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    throw error;
  }
};

// POST request
const createItem = async (payload: CreateBranchPayload) => {
  try {
    const { data } = await httpClient.post<FoodicsResponse<Branch>>('/branches', payload);
    return data.data;
  } catch (error) {
    console.error('Failed to create branch:', error);
    throw error;
  }
};

// PUT request
const updateItem = async (id: string, payload: UpdateBranchPayload) => {
  try {
    const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, payload);
    return data.data;
  } catch (error) {
    console.error('Failed to update branch:', error);
    throw error;
  }
};

// DELETE request
const deleteItem = async (id: string) => {
  try {
    await httpClient.delete(`/branches/${id}`);
  } catch (error) {
    console.error('Failed to delete branch:', error);
    throw error;
  }
};
```

#### **Error Handling**
```typescript
import { httpClient } from '@/services/http';

const handleApiCall = async () => {
  try {
    const result = await httpClient.get('/branches');
    return result.data;
  } catch (error: ApiError) {
    // Normalized error format
    console.error(`Error ${error.status}: ${error.message}`);
    
    if (error.status === 401) {
      // Handle authentication error
      redirectToLogin();
    } else if (error.status >= 500) {
      // Handle server error
      showErrorMessage('Server error. Please try again later.');
    } else {
      // Handle client error
      showErrorMessage(error.message);
    }
    
    throw error;
  }
};
```

### **Environment Variables**
```bash
# .env.local
VITE_FOODICS_TOKEN=your_bearer_token_here
VITE_API_BASE_URL=https://api.foodics.dev/v5
```

---

## 🏢 **Branches Service**

**File**: `src/services/branches.service.ts`  
**Purpose**: API operations specific to branches management

### **Service Definition**
```typescript
export const BranchesService = {
  async getBranches(includeSections = false): Promise<Branch[]>,
  async enableBranch(id: string): Promise<Branch>,
  async disableBranch(id: string): Promise<Branch>,
  async updateBranchSettings(id: string, payload: UpdateBranchSettingsPayload): Promise<Branch>,
} as const;
```

### **Method Details**

#### **getBranches**
```typescript
async getBranches(includeSections = false): Promise<Branch[]> {
  const params = includeSections
    ? { "include[0]": "sections", "include[1]": "sections.tables" }
    : {};
  const { data } = await httpClient.get<FoodicsResponse<Branch[]>>("/branches", { params });
  return data.data;
}
```

**Parameters**:
- `includeSections` (optional): Whether to include sections and tables data

**Returns**: Array of Branch objects

**Usage**:
```typescript
// Get basic branch data
const branches = await BranchesService.getBranches();

// Get branches with sections and tables
const branchesWithSections = await BranchesService.getBranches(true);
```

#### **enableBranch**
```typescript
async enableBranch(id: string): Promise<Branch> {
  const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, { 
    accepts_reservations: true 
  });
  return data.data;
}
```

**Parameters**:
- `id`: Branch ID to enable

**Returns**: Updated Branch object

**Usage**:
```typescript
const updatedBranch = await BranchesService.enableBranch('branch-123');
```

#### **disableBranch**
```typescript
async disableBranch(id: string): Promise<Branch> {
  const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, { 
    accepts_reservations: false 
  });
  return data.data;
}
```

**Parameters**:
- `id`: Branch ID to disable

**Returns**: Updated Branch object

**Usage**:
```typescript
const updatedBranch = await BranchesService.disableBranch('branch-123');
```

#### **updateBranchSettings**
```typescript
async updateBranchSettings(id: string, payload: UpdateBranchSettingsPayload): Promise<Branch> {
  const { data } = await httpClient.put<FoodicsResponse<Branch>>(`/branches/${id}`, payload);
  return data.data;
}
```

**Parameters**:
- `id`: Branch ID to update
- `payload`: Settings data to update

**Returns**: Updated Branch object

**Usage**:
```typescript
const payload: UpdateBranchSettingsPayload = {
  reservation_times: {
    saturday: [["09:00", "17:00"]],
    sunday: [["10:00", "16:00"]],
    // ... other days
  },
  reservation_duration: 120
};

const updatedBranch = await BranchesService.updateBranchSettings('branch-123', payload);
```

### **Usage Examples**

#### **In Composable**
```typescript
// src/features/branches/composables/useBranchActions.ts
import { BranchesService } from '@/services/branches.service';

export const useBranchActions = () => {
  const { busy, run } = useAsyncAction();
  const { success, error } = useToast();

  const enableBranch = async (id: string) => {
    await run(async () => {
      const updatedBranch = await BranchesService.enableBranch(id);
      success('Branch enabled successfully');
      return updatedBranch;
    });
  };

  const disableBranch = async (id: string) => {
    await run(async () => {
      const updatedBranch = await BranchesService.disableBranch(id);
      success('Branch disabled successfully');
      return updatedBranch;
    });
  };

  return {
    enableBranch,
    disableBranch,
    busy
  };
};
```

#### **In Store**
```typescript
// src/features/branches/stores/branches.store.ts
import { defineStore } from 'pinia';
import { BranchesService } from '@/services/branches.service';

export const useBranchesStore = defineStore('branches', () => {
  const branches = ref<Branch[]>([]);
  const loading = ref(false);

  const fetchBranches = async (includeSections = false) => {
    loading.value = true;
    try {
      branches.value = await BranchesService.getBranches(includeSections);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBranch = async (id: string, payload: UpdateBranchSettingsPayload) => {
    try {
      const updatedBranch = await BranchesService.updateBranchSettings(id, payload);
      
      // Update local state
      const index = branches.value.findIndex(b => b.id === id);
      if (index !== -1) {
        branches.value[index] = updatedBranch;
      }
      
      return updatedBranch;
    } catch (err) {
      console.error('Failed to update branch:', err);
      throw err;
    }
  };

  return {
    branches,
    loading,
    fetchBranches,
    updateBranch
  };
});
```

#### **In Component**
```vue
<template>
  <div>
    <BaseButton 
      :loading="busy" 
      @click="handleEnableBranch"
    >
      Enable Branch
    </BaseButton>
  </div>
</template>

<script setup>
import { BranchesService } from '@/services/branches.service';
import { useAsyncAction } from '@/composables/useAsyncAction';
import { useToast } from '@/composables/useToast';

const props = defineProps<{
  branchId: string;
}>();

const { busy, run } = useAsyncAction();
const { success, error } = useToast();

const handleEnableBranch = async () => {
  await run(async () => {
    await BranchesService.enableBranch(props.branchId);
    success('Branch enabled successfully');
  });
};
</script>
```

---

## 🔄 **Service Patterns**

### **1. Consistent Error Handling**
All services follow the same error handling pattern:

```typescript
const serviceMethod = async (params: ParamsType): Promise<ReturnType> => {
  try {
    const { data } = await httpClient.get<FoodicsResponse<ReturnType>>('/endpoint', { params });
    return data.data;
  } catch (error) {
    // Error is automatically normalized by interceptor
    console.error('Service method failed:', error);
    throw error; // Re-throw for caller to handle
  }
};
```

### **2. Type Safety**
All service methods are fully typed:

```typescript
// Input types
interface CreateBranchPayload {
  name: string;
  settings: BranchSettings;
}

// Return types
const result: Branch = await BranchesService.createBranch(payload);
```

### **3. API Response Wrapping**
Foodics API responses are wrapped in a `data` property:

```typescript
// API Response Format
interface FoodicsResponse<T> {
  data: T;
}

// Service extracts the data
const { data } = await httpClient.get<FoodicsResponse<Branch[]>>('/branches');
return data.data; // Extract the actual data
```

### **4. Query Parameters**
Complex query parameters for includes:

```typescript
const params = includeSections
  ? { "include[0]": "sections", "include[1]": "sections.tables" }
  : {};

const { data } = await httpClient.get<FoodicsResponse<Branch[]>>("/branches", { params });
```

---

## 🚀 **Best Practices**

### ✅ **DO**
- Use the centralized HTTP client for all API calls
- Handle errors consistently across all services
- Type all service methods and responses
- Extract data from Foodics response wrapper
- Use meaningful error messages
- Test service methods thoroughly

### ❌ **DON'T**
- Create multiple HTTP client instances
- Ignore error handling in services
- Use `any` types in service methods
- Forget to handle authentication errors
- Skip testing API integrations
- Hardcode API endpoints in components

---

## 🧪 **Testing Services**

### **Unit Tests**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { httpClient } from '@/services/http';
import { BranchesService } from '@/services/branches.service';

// Mock the HTTP client
vi.mock('@/services/http', () => ({
  httpClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('BranchesService', () => {
  it('should fetch branches', async () => {
    const mockBranches = [{ id: '1', name: 'Branch 1' }];
    const mockResponse = { data: { data: mockBranches } };
    
    vi.mocked(httpClient.get).mockResolvedValue(mockResponse);
    
    const result = await BranchesService.getBranches();
    
    expect(httpClient.get).toHaveBeenCalledWith('/branches', { params: {} });
    expect(result).toEqual(mockBranches);
  });

  it('should enable branch', async () => {
    const mockBranch = { id: '1', name: 'Branch 1', accepts_reservations: true };
    const mockResponse = { data: { data: mockBranch } };
    
    vi.mocked(httpClient.put).mockResolvedValue(mockResponse);
    
    const result = await BranchesService.enableBranch('1');
    
    expect(httpClient.put).toHaveBeenCalledWith('/branches/1', { 
      accepts_reservations: true 
    });
    expect(result).toEqual(mockBranch);
  });
});
```

### **E2E Tests**
```typescript
import { test, expect } from '@playwright/test';

test('should fetch branches from API', async ({ page }) => {
  // Intercept API calls
  await page.route('**/api/branches', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: '1', name: 'Branch 1', accepts_reservations: true }
        ]
      })
    });
  });

  await page.goto('/branches');
  
  // Verify branches are displayed
  await expect(page.locator('[data-testid="branch-1"]')).toBeVisible();
});
```

---

This completes the services reference. The HTTP client and branches service provide the foundation for all API communication in the application.
