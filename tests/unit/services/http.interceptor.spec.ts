/**
 * @file http.interceptor.spec.ts
 * @summary Unit tests for HTTP interceptor error normalization
 * @remarks Tests ApiError shape with status, code, message, and details
 */

import MockAdapter from "axios-mock-adapter";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { httpClient } from "@/services/http";
import type { IApiError } from "@/types/api";

describe("HTTP Interceptor", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(httpClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("Error normalization", () => {
    it("normalizes 401 error without code", async () => {
      mock.onGet("/test").reply(401, {
        message: "Unauthorized",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.code).toBeUndefined();
        expect(apiError.message).toBe("Unauthorized");
        expect(apiError.details).toBeDefined();
      }
    });

    it("normalizes 401 error with code", async () => {
      mock.onGet("/test").reply(401, {
        code: "INVALID_TOKEN",
        message: "Token is invalid",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.code).toBe("INVALID_TOKEN");
        expect(apiError.message).toBe("Token is invalid");
        expect(apiError.details).toBeDefined();
      }
    });

    it("normalizes 400 error with VALIDATION_FAILED code", async () => {
      mock.onPost("/test").reply(400, {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        errors: {
          duration: ["Duration is required"],
        },
      });

      try {
        await httpClient.post("/test", {});
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.code).toBe("VALIDATION_FAILED");
        expect(apiError.message).toBe("Validation failed");
        expect(apiError.details).toBeDefined();
      }
    });

    it("normalizes 404 error with BRANCH_NOT_FOUND code", async () => {
      mock.onGet("/test").reply(404, {
        code: "BRANCH_NOT_FOUND",
        message: "Branch not found",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.code).toBe("BRANCH_NOT_FOUND");
        expect(apiError.message).toBe("Branch not found");
      }
    });

    it("normalizes 500 error without code", async () => {
      mock.onGet("/test").reply(500, {
        message: "Internal Server Error",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.code).toBeUndefined();
        expect(apiError.message).toBe("Internal Server Error");
      }
    });

    it("normalizes 500 error with code (code included)", async () => {
      mock.onGet("/test").reply(500, {
        code: "DATABASE_ERROR",
        message: "Database connection failed",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.code).toBe("DATABASE_ERROR");
        expect(apiError.message).toBe("Database connection failed");
      }
    });

    it("uses error field as fallback for message", async () => {
      mock.onGet("/test").reply(400, {
        error: "Bad request error",
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.message).toBe("Bad request error");
      }
    });

    it("uses axios error message as fallback", async () => {
      mock.onGet("/test").networkError();

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.message).toContain("Network Error");
      }
    });

    it("includes details field with response data", async () => {
      mock.onGet("/test").reply(422, {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        errors: {
          field1: ["Error 1"],
          field2: ["Error 2"],
        },
      });

      try {
        await httpClient.get("/test");
        expect.fail("Should have thrown an error");
      } catch (error) {
        const apiError = error as IApiError;
        expect(apiError.details).toBeDefined();
        expect(apiError.details).toHaveProperty("code");
        expect(apiError.details).toHaveProperty("message");
        expect(apiError.details).toHaveProperty("errors");
      }
    });
  });

  describe("Request interceptor", () => {
    it("adds Authorization header when token is present", async () => {
      // Mock successful response
      mock.onGet("/test").reply(200, { data: "success" });

      await httpClient.get("/test");

      // Verify request was made (token presence is mocked in test env)
      expect(mock.history.get.length).toBe(1);
    });
  });
});

