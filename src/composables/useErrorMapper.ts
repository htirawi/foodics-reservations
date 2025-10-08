/**
 * @file useErrorMapper.ts
 * @summary Maps API errors to i18n keys with error classification
 * @remarks
 *   - Pure mapping logic; no UI/service imports
 *   - Returns i18n keys only; caller resolves via $t()
 *   - TypeScript strict; no any/unknown; use ?./??.
 */

import type { IApiError } from "@/types/api";
import type { IMappedError } from "@/types/error";

/**
 * Maps an API error to a structured error with i18n key.
 * 
 * Rules:
 * - 401 Unauthorized → { kind: "auth", i18nKey: "errors.auth.token" }
 * - 4xx (other) → { kind: "client", i18nKey: "errors.client.<code>" or "errors.client.generic" }
 * - 5xx → { kind: "server", i18nKey: "errors.server.tryAgain" }
 */
export function useErrorMapper() {
  function mapError(error: IApiError): IMappedError {
    const { status, code } = error;

    // 401 Unauthorized - token/auth issues
    if (status === 401) {
      return {
        kind: "auth",
        i18nKey: "errors.auth.token",
      };
    }

    // 4xx Client errors
    if (status >= 400 && status < 500) {
      // If a specific code is provided, try to map it
      if (code) {
        return {
          kind: "client",
          i18nKey: `errors.client.${code}`,
        };
      }

      // Default client error
      return {
        kind: "client",
        i18nKey: "errors.client.generic",
      };
    }

    // 5xx Server errors - retry scenario
    return {
      kind: "server",
      i18nKey: "errors.server.tryAgain",
    };
  }

  return {
    mapError,
  };
}

