/**
 * Build mode utilities
 * 
 * When imported with `{ type: 'macro' }`, these functions are evaluated
 * at bundle time and their return values are inlined as constants.
 * This allows Bun's AST pruner to eliminate dead code branches.
 * 
 * @example
 * ```ts
 * import { isDevMode, isProdMode, isEditorialMode } from './build-mode.ts' with { type: 'macro' };
 * 
 * if (isProdMode()) {
 *   // This branch is eliminated in dev builds
 * }
 * 
 * if (isEditorialMode()) {
 *   // This branch is eliminated in non-editorial builds
 * }
 * ```
 */

/**
 * Returns true if building in development mode.
 * When used as a macro, the result is inlined as a constant.
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Returns true if building in production mode.
 * When used as a macro, the result is inlined as a constant.
 */
export function isProdMode(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Returns true if building in editorial mode.
 * Editorial mode enables features like inline notes, A/B testing, etc.
 * 
 * Set via environment variable: EDITORIAL_MODE=true
 * 
 * When used as a macro, the result is inlined as a constant.
 */
export function isEditorialMode(): boolean {
  return process.env.EDITORIAL_MODE === 'true';
}
