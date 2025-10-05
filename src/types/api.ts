/**
 * API layer types
 * HTTP client, error shapes, and API response wrappers
 */

/**
 * Normalized error shape returned by all failed API calls
 * Ensures consistent error handling across the application
 */
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

/**
 * Response wrapper from Foodics API
 * All Foodics endpoints return data wrapped in { data: T }
 * 
 * Examples:
 * - GET /branches returns { data: Branch[] }
 * - PATCH /branches/:id returns { data: Branch }
 */
export interface FoodicsResponse<T> {
  data: T;
}
