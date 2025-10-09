/**
 * @file setup.ts
 * @summary Module: tests/setup.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { createPinia, setActivePinia } from "pinia";
import { afterEach, vi } from "vitest";

const pinia = createPinia();
setActivePinia(pinia);

process.on('unhandledRejection', (reason) => {
    const reasonStr = String(reason);
    if (reasonStr.includes('window is not defined')) {
        return;
    }
});

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
    const firstArg = String(args[0] || '');
    if (firstArg.includes('AggregateError') ||
        firstArg.includes('Error: Could not parse CSS stylesheet') ||
        firstArg.includes('window is not defined') ||
        firstArg.includes('Unhandled')) {
        return;
    }
    originalConsoleError(...args);
};

console.warn = (...args: unknown[]) => {
    const firstArg = String(args[0] || '');
    if (firstArg.includes('[Vue warn]')) {
        return;
    }
    originalConsoleWarn(...args);
};

afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
});
