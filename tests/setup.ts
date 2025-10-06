/**
 * @file setup.ts
 * @summary Module: tests/setup.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { afterEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
const pinia = createPinia();
setActivePinia(pinia);
afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});
