/**
 * Vitest Global Setup
 * Ensures no real HTTP calls in unit tests
 */

import { afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// Create a fresh Pinia instance for each test
const pinia = createPinia();
setActivePinia(pinia);

afterEach(() => {
  // Reset all mocks after each test
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
