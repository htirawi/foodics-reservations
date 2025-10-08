/**
 * @file stores.ts
 * @summary Pinia store names
 * @remarks
 *   - Store name constants for defineStore()
 *   - Prevents naming conflicts
 * @example
 *   import { STORE_NAME_UI } from '@/constants/stores';
 *   export const useUIStore = defineStore(STORE_NAME_UI, () => { ... });
 */

export const STORE_NAME_UI = 'ui';
export const STORE_NAME_BRANCHES = 'branches';
