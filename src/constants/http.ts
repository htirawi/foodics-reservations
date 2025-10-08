/**
 * @file http.ts
 * @summary HTTP headers, status codes, and authentication constants
 * @remarks
 *   - Centralized HTTP protocol constants for API communication
 *   - Use for axios interceptors, error handling, and request configuration
 * @example
 *   import { HTTP_STATUS_UNAUTHORIZED, HTTP_AUTH_BEARER_PREFIX } from '@/constants/http';
 *   if (error.status === HTTP_STATUS_UNAUTHORIZED) { ... }
 */

// HTTP Headers
export const HTTP_HEADER_CONTENT_TYPE = 'Content-Type' as const;
export const HTTP_HEADER_AUTHORIZATION = 'Authorization' as const;

// Content Types
export const HTTP_CONTENT_TYPE_JSON = 'application/json' as const;

// Authentication
export const HTTP_AUTH_BEARER_PREFIX = 'Bearer' as const;

// HTTP Status Codes
export const HTTP_STATUS_BAD_REQUEST = 400 as const;
export const HTTP_STATUS_UNAUTHORIZED = 401 as const;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500 as const;

// Status code ranges (for error categorization)
export const HTTP_STATUS_CLIENT_ERROR_MIN = 400 as const;
export const HTTP_STATUS_CLIENT_ERROR_MAX = 499 as const;
export const HTTP_STATUS_SERVER_ERROR_MIN = 500 as const;
export const HTTP_STATUS_SERVER_ERROR_MAX = 599 as const;
