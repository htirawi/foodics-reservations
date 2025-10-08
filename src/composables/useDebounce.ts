/**
 * Creates a debounced version of a function that delays invoking
 * until after `delay` milliseconds have elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param delay - The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the function
 *
 * @example
 * ```typescript
 * const debouncedSearch = useDebounceFn(
 *   (query: string) => console.log('Search:', query),
 *   500
 * )
 *
 * debouncedSearch('a')    // Won't execute
 * debouncedSearch('ab')   // Won't execute
 * debouncedSearch('abc')  // Executes after 500ms
 * ```
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = undefined
    }, delay)
  }
}
