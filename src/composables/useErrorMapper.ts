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
import {
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_CLIENT_ERROR_MIN,
    HTTP_STATUS_SERVER_ERROR_MIN,
    I18N_KEY_ERROR_AUTH_TOKEN,
    I18N_KEY_ERROR_CLIENT_GENERIC,
    I18N_KEY_ERROR_SERVER_TRY_AGAIN,
    I18N_KEY_PREFIX_ERROR_CLIENT,
} from "@/constants";

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
    if (status === HTTP_STATUS_UNAUTHORIZED) {
      return {
        kind: "auth",
        i18nKey: I18N_KEY_ERROR_AUTH_TOKEN,
      };
    }

    // 4xx Client errors
    if (status >= HTTP_STATUS_CLIENT_ERROR_MIN && status < HTTP_STATUS_SERVER_ERROR_MIN) {
      // If a specific code is provided, try to map it
      if (code) {
        return {
          kind: "client",
          i18nKey: `${I18N_KEY_PREFIX_ERROR_CLIENT}${code}`,
        };
      }

      // Default client error
      return {
        kind: "client",
        i18nKey: I18N_KEY_ERROR_CLIENT_GENERIC,
      };
    }

    // 5xx Server errors - retry scenario
    return {
      kind: "server",
      i18nKey: I18N_KEY_ERROR_SERVER_TRY_AGAIN,
    };
  }

  return {
    mapError,
  };
}

