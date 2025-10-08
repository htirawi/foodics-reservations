/**
 * @file a11y.ts
 * @summary Accessibility testing helpers for E2E tests
 * @description
 *   Provides utilities for automated accessibility testing using axe-core
 *   via axe-playwright integration.
 */

import type { Page } from '@playwright/test'
import { injectAxe, configureAxe, getViolations } from 'axe-playwright'
import type { Result } from 'axe-core'

/**
 * Accessibility test options
 */
export interface A11yOptions {
  /**
   * Include specific accessibility rules
   * @see https://github.com/dequelabs/axe-core/blob/master/doc/rule-descriptions.md
   */
  includedRules?: string[]

  /**
   * Exclude specific accessibility rules
   */
  excludedRules?: string[]

  /**
   * Exclude specific DOM elements from testing
   * @example ['.third-party-widget', '#ad-banner']
   */
  excludeSelectors?: string[]

  /**
   * WCAG level to test against
   * @default 'wcag21aa'
   */
  wcagLevel?: 'wcag2a' | 'wcag2aa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa'

  /**
   * Impact levels to report
   * @default ['critical', 'serious']
   */
  impactLevels?: Array<'minor' | 'moderate' | 'serious' | 'critical'>
}

/**
 * Default a11y options
 */
const DEFAULT_OPTIONS: Required<A11yOptions> = {
  includedRules: [],
  excludedRules: [],
  excludeSelectors: [],
  wcagLevel: 'wcag21aa',
  impactLevels: ['critical', 'serious'],
}

/**
 * Check accessibility violations on a page
 *
 * @example
 * ```typescript
 * test('homepage should be accessible', async ({ page }) => {
 *   await page.goto('/')
 *   await checkA11y(page)
 * })
 *
 * // With custom options
 * await checkA11y(page, {
 *   excludeSelectors: ['.third-party-ad'],
 *   impactLevels: ['critical', 'serious', 'moderate']
 * })
 * ```
 */
export async function checkA11y(
  page: Page,
  options: A11yOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Inject axe-core into page
  await injectAxe(page)

  // Configure axe if needed
  if (opts.excludedRules.length > 0) {
    await configureAxe(page, {
      rules: opts.excludedRules.map((rule) => ({ id: rule, enabled: false })),
    })
  }

  // Build run options
  const runOptions: any = {
    runOnly: {
      type: 'tag',
      values: [opts.wcagLevel, 'best-practice'],
    },
  }

  // Add excluded selectors
  if (opts.excludeSelectors.length > 0) {
    runOptions.exclude = opts.excludeSelectors
  }

  // Add included rules if specified
  if (opts.includedRules.length > 0) {
    runOptions.runOnly = {
      type: 'rule',
      values: opts.includedRules,
    }
  }

  // Get violations
  const violations = await getViolations(page, undefined, runOptions)

  // Filter violations by impact level
  const filteredViolations = violations.filter((violation: Result) => {
    if (!violation.impact) return false
    return opts.impactLevels.includes(violation.impact as 'minor' | 'moderate' | 'serious' | 'critical')
  })

  // If violations found, throw detailed error
  if (filteredViolations.length > 0) {
    const violationMessages = filteredViolations.map((violation: Result) => {
      const nodes = violation.nodes
        .map(
          (node: any) =>
            `  - ${node.html}\n    ${node.failureSummary?.split('\n').join('\n    ') ?? ''}`
        )
        .join('\n')

      return `
[${violation.impact?.toUpperCase()}] ${violation.id}: ${violation.description}
  Help: ${violation.helpUrl}
  Affected elements:
${nodes}
      `.trim()
    })

    throw new Error(
      `Found ${filteredViolations.length} accessibility violation(s):\n\n${violationMessages.join('\n\n')}`
    )
  }
}

/**
 * Check accessibility of a specific component/element
 *
 * @example
 * ```typescript
 * await checkA11yForSelector(page, '[data-testid="modal"]')
 * ```
 */
export async function checkA11yForSelector(
  page: Page,
  selector: string,
  options: A11yOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Inject axe-core
  await injectAxe(page)

  // Configure if needed
  if (opts.excludedRules.length > 0) {
    await configureAxe(page, {
      rules: opts.excludedRules.map((rule) => ({ id: rule, enabled: false })),
    })
  }

  // Build run options with selector inclusion
  const runOptions: any = {
    runOnly: {
      type: 'tag',
      values: [opts.wcagLevel, 'best-practice'],
    },
  }

  // Get violations for specific selector
  const violations = await getViolations(page, selector, runOptions)

  // Filter by impact
  const filteredViolations = violations.filter((violation: Result) => {
    if (!violation.impact) return false
    return opts.impactLevels.includes(violation.impact as 'minor' | 'moderate' | 'serious' | 'critical')
  })

  if (filteredViolations.length > 0) {
    throw new Error(
      `Found ${filteredViolations.length} a11y violation(s) in ${selector}`
    )
  }
}

/**
 * Common a11y exclusions for known issues
 * Use sparingly and document why exclusions are needed
 */
export const COMMON_EXCLUSIONS = {
  /**
   * Exclude third-party widgets that we can't control
   */
  thirdParty: ['.third-party-widget', '#ad-container'],

  /**
   * Exclude known false positives
   * Document each exclusion with a comment
   */
  knownIssues: [
    // Example: '.legacy-component' // Pending refactor in TICKET-123
  ],
}

/**
 * Commonly disabled rules with justifications
 * Only use these when absolutely necessary
 */
export const DISABLED_RULES = {
  /**
   * Color contrast - sometimes overridden by designers
   * Prefer fixing the actual contrast issues instead
   */
  colorContrast: 'color-contrast',

  /**
   * Landmark regions - sometimes unavoidable in complex layouts
   * Prefer adding proper landmarks instead
   */
  region: 'region',
}
