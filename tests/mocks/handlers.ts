/**
 * @file handlers.ts
 * @summary Mock Service Worker (MSW) request handlers
 * @description
 *   Defines mock API handlers for E2E and development testing.
 *   Provides realistic API responses without backend dependency.
 */

import { http, HttpResponse } from 'msw'
import { mockBranches } from './data/branches'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-staging.foodics.dev/v5'

/**
 * Branches API handlers
 */
export const branchesHandlers = [
  // GET /branches - Fetch all branches
  http.get(`${API_BASE_URL}/branches`, ({ request }) => {
    const url = new URL(request.url)
    const includeSections = url.searchParams.get('include') === 'sections'

    const branches = includeSections
      ? mockBranches.withSections
      : mockBranches.basic

    return HttpResponse.json({
      data: branches,
      links: {
        self: `${API_BASE_URL}/branches`,
      },
      meta: {
        total: branches.length,
      },
    })
  }),

  // PUT /branches/:id - Enable branch
  http.put(`${API_BASE_URL}/branches/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as any

    // Find branch in mock data
    const branch = mockBranches.basic.find((b) => b.id === id)
    if (!branch) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Branch not found',
      })
    }

    // Update accepts_reservations if provided
    if ('accepts_reservations' in body) {
      branch.accepts_reservations = body.accepts_reservations
    }

    // Update reservation settings if provided
    if (body.reservation_duration !== undefined) {
      branch.reservation_duration = body.reservation_duration
    }
    if (body.reservation_times !== undefined) {
      branch.reservation_times = body.reservation_times
    }

    return HttpResponse.json({
      data: branch,
    })
  }),

  // GET /branches/:id - Get single branch
  http.get(`${API_BASE_URL}/branches/:id`, ({ params }) => {
    const { id } = params
    const branch = mockBranches.withSections.find((b) => b.id === id)

    if (!branch) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Branch not found',
      })
    }

    return HttpResponse.json({
      data: branch,
    })
  }),
]

/**
 * Error simulation handlers (for testing error states)
 */
export const errorHandlers = [
  // Simulate 500 server error
  http.get(`${API_BASE_URL}/branches/error/500`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }),

  // Simulate 401 unauthorized
  http.get(`${API_BASE_URL}/branches/error/401`, () => {
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    })
  }),

  // Simulate network error
  http.get(`${API_BASE_URL}/branches/error/network`, () => {
    return HttpResponse.error()
  }),
]

/**
 * All handlers
 */
export const handlers = [...branchesHandlers, ...errorHandlers]
