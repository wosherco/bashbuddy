/**
 * Internal helper function to filter out null and/or undefined values
 * @internal
 */
function filterNullable<T>(
  array: readonly (T | null | undefined)[],
  options: { filterNull: boolean; filterUndefined: boolean },
): T[] {
  return array.filter((item): item is T => {
    if (options.filterUndefined && item === undefined) return false;
    if (options.filterNull && item === null) return false;
    return true;
  });
}

/**
 * Filters out `null` values from an array while maintaining proper TypeScript types.
 *
 * @template T The type of elements in the array
 * @param array The array to filter
 * @returns A new array with all non-null values, properly typed
 *
 * @example
 * ```typescript
 * const arr = [1, null, 2, undefined, 3];
 * filterNull(arr)
 * // => [1, 2, undefined, 3] typed as (number | undefined)[]
 * ```
 */
export function filterNull<T>(array: readonly (T | null)[]): T[] {
  return filterNullable(array, { filterNull: true, filterUndefined: false });
}

/**
 * Filters out `undefined` values from an array while maintaining proper TypeScript types.
 *
 * @template T The type of elements in the array
 * @param array The array to filter
 * @returns A new array with all non-undefined values, properly typed
 *
 * @example
 * ```typescript
 * const arr = [1, null, 2, undefined, 3];
 * filterUndefined(arr)
 * // => [1, null, 2, 3] typed as (number | null)[]
 * ```
 */
export function filterUndefined<T>(array: readonly (T | undefined)[]): T[] {
  return filterNullable(array, { filterNull: false, filterUndefined: true });
}

/**
 * Filters out both `null` and `undefined` values from an array while maintaining proper TypeScript types.
 *
 * @template T The type of elements in the array
 * @param array The array to filter
 * @returns A new array with all non-null and non-undefined values, properly typed
 *
 * @example
 * ```typescript
 * const arr = [1, null, 2, undefined, 3];
 * filterNil(arr)
 * // => [1, 2, 3] typed as number[]
 * ```
 */
export function filterNil<T>(array: readonly (T | null | undefined)[]): T[] {
  return filterNullable(array, { filterNull: true, filterUndefined: true });
}
