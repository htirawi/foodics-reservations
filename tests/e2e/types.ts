/**
 * @file types.ts
 * @summary Shared TypeScript types for E2E tests
 * @description
 *   Central location for test-specific type definitions
 *   to avoid duplication across test files.
 */

/**
 * Window object augmented with UI store for testing
 * Used to access the exposed UI store instance in development mode
 */
export interface IWindowWithStore extends Window {
  __uiStore?: {
    notify: (msg: string, type: string, duration: number) => void;
  };
}
