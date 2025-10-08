/**
 * @file error.ts
 * @summary Error mapping types for centralized error handling
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */

/**
 * Error classification by kind
 */
export type ErrorKind = "auth" | "client" | "server";

/**
 * Mapped error with i18n key and optional parameters
 */
export interface IMappedError {
  kind: ErrorKind;
  i18nKey: string;
  params?: Record<string, string | number>;
}

// Backward-compatibility alias
export type MappedError = IMappedError;

