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

