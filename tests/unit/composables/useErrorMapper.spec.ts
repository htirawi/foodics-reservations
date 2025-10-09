/**
 * @file useErrorMapper.spec.ts
 * @summary Unit tests for error mapping composable
 * @remarks Tests all error classification scenarios (401, 4xx, 5xx, with/without codes)
 */

import { describe, it, expect } from "vitest";

import { useErrorMapper } from "@/composables/useErrorMapper";
import type { IApiError } from "@/types/api";

describe("useErrorMapper", () => {
  const { mapError } = useErrorMapper();

  describe("401 Unauthorized errors", () => {
    it("maps 401 to auth error with token i18n key", () => {
      const error: IApiError = {
        status: 401,
        message: "Unauthorized",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "auth",
        i18nKey: "errors.auth.token",
      });
    });

    it("maps 401 with code to auth error (ignores code for 401)", () => {
      const error: IApiError = {
        status: 401,
        code: "INVALID_TOKEN",
        message: "Unauthorized",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "auth",
        i18nKey: "errors.auth.token",
      });
    });
  });

  describe("4xx Client errors (non-401)", () => {
    it("maps 400 without code to generic client error", () => {
      const error: IApiError = {
        status: 400,
        message: "Bad Request",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "client",
        i18nKey: "errors.client.generic",
      });
    });

    it("maps 404 without code to generic client error", () => {
      const error: IApiError = {
        status: 404,
        message: "Not Found",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "client",
        i18nKey: "errors.client.generic",
      });
    });

    it("maps 400 with BRANCH_NOT_FOUND code to specific i18n key", () => {
      const error: IApiError = {
        status: 400,
        code: "BRANCH_NOT_FOUND",
        message: "Branch not found",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "client",
        i18nKey: "errors.client.BRANCH_NOT_FOUND",
      });
    });

    it("maps 422 with VALIDATION_FAILED code to specific i18n key", () => {
      const error: IApiError = {
        status: 422,
        code: "VALIDATION_FAILED",
        message: "Validation failed",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "client",
        i18nKey: "errors.client.VALIDATION_FAILED",
      });
    });

    it("maps 403 without code to generic client error", () => {
      const error: IApiError = {
        status: 403,
        message: "Forbidden",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "client",
        i18nKey: "errors.client.generic",
      });
    });
  });

  describe("5xx Server errors", () => {
    it("maps 500 to server error with tryAgain key", () => {
      const error: IApiError = {
        status: 500,
        message: "Internal Server Error",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });

    it("maps 502 to server error with tryAgain key", () => {
      const error: IApiError = {
        status: 502,
        message: "Bad Gateway",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });

    it("maps 503 to server error with tryAgain key", () => {
      const error: IApiError = {
        status: 503,
        message: "Service Unavailable",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });

    it("ignores code field for 5xx errors", () => {
      const error: IApiError = {
        status: 500,
        code: "SOME_CODE",
        message: "Internal Server Error",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });
  });

  describe("Edge cases", () => {
    it("maps unknown status codes < 400 to server error (fallback)", () => {
      const error: IApiError = {
        status: 0,
        message: "Network error",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });

    it("maps 600+ status codes to server error (fallback)", () => {
      const error: IApiError = {
        status: 999,
        message: "Unknown error",
      };

      const result = mapError(error);

      expect(result).toEqual({
        kind: "server",
        i18nKey: "errors.server.tryAgain",
      });
    });
  });
});

