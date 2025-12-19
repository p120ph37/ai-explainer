/**
 * Sitemap optimization library
 * 
 * Provides algorithms for optimizing circular layout order to minimize
 * link crossings in the radial sitemap visualization.
 * 
 * This module can be used in two ways:
 * 
 * 1. **Bundle-time (production)**: Import `runFullOptimization` with `{ type: 'macro' }`
 *    to compute the optimal order during transpilation. The result is inlined into the bundle.
 * 
 * 2. **Runtime (development)**: Import `runOptimizationStep` normally for animated
 *    incremental optimization during development or if the content will be modified at runtime.
 * 
 * Note: the optimization is not guaranteed to be optimal, but it should converge to a
 * close-to-optimal solution.  In testing with randomized starting states, I found that it
 * converges to the apparent optimal solution about 20% of the time, and other
 * very-close-to-optimal solutions the rest of the time.
 * 
 * @example
 * ```ts
 * // For bundle-time optimization (production):
 * import { runFullOptimization } from './sitemap-optimization.ts' with { type: 'macro' };
 * 
 * // For runtime animation (development):
 * import { runOptimizationStep, createOptimizationState } from './sitemap-optimization.ts';
 * ```
 */

import type { ContentFile } from './content.ts';

// ============================================
// TYPES
// ============================================

export interface PageData {
  id: string;
  title: string;
  links: string[];
  order?: number; // Content metadata order field
}

export interface OptimizationState {
  order: PageData[];
  segmentSize: number;
  srcIdx: number;
  destIdx: number;
  shouldReverse: boolean;
  isComplete: boolean;
  maxSegmentSize: number;
}

export interface OptimizationStepResult {
  improved: boolean;
  newOrder: PageData[] | null;
  complete: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function buildIndexMap(order: PageData[]): Map<string, number> {
  const map = new Map<string, number>();
  order.forEach((page, i) => map.set(page.id, i));
  return map;
}

function chordsCross(a: number, b: number, c: number, d: number, n: number): boolean {
  if (a > b) [a, b] = [b, a];
  if (c > d) [c, d] = [d, c];
  
  const cBetween = a < c && c < b;
  const dBetween = a < d && d < b;
  
  if (cBetween !== dBetween) return true;
  
  return (a < c && c < b && b < d) || (c < a && a < d && d < b);
}

export function countCrossings(order: PageData[], idToIndex: Map<string, number>): number {
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  
  order.forEach((page, i) => {
    page.links.forEach(targetId => {
      const j = idToIndex.get(targetId);
      if (j !== undefined && i !== j) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push(i < j ? [i, j] : [j, i]);
        }
      }
    });
  });
  
  let crossings = 0;
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [a1, b1] = edges[i]!;
      const [a2, b2] = edges[j]!;
      if (a1 === a2 || a1 === b2 || b1 === a2 || b1 === b2) continue;
      if (chordsCross(a1, b1, a2, b2, order.length)) crossings++;
    }
  }
  
  return crossings;
}

export function averageLinkDistance(order: PageData[], idToIndex: Map<string, number>): number {
  const n = order.length;
  let totalDistance = 0;
  let linkCount = 0;
  
  order.forEach((page, i) => {
    page.links.forEach(targetId => {
      const j = idToIndex.get(targetId);
      if (j !== undefined && i !== j) {
        const rawDist = Math.abs(i - j);
        const distance = Math.min(rawDist, n - rawDist);
        totalDistance += distance;
        linkCount++;
      }
    });
  });
  
  return linkCount > 0 ? totalDistance / linkCount : 0;
}

function relocateSegment(order: PageData[], srcIdx: number, segmentSize: number, destIdx: number): PageData[] {
  const n = order.length;
  srcIdx = ((srcIdx % n) + n) % n;
  destIdx = ((destIdx % n) + n) % n;
  
  const segment: PageData[] = [];
  for (let i = 0; i < segmentSize; i++) {
    segment.push(order[(srcIdx + i) % n]!);
  }
  
  const segmentIndices = new Set<number>();
  for (let i = 0; i < segmentSize; i++) {
    segmentIndices.add((srcIdx + i) % n);
  }
  
  const remainder: PageData[] = [];
  for (let i = 0; i < n; i++) {
    if (!segmentIndices.has(i)) remainder.push(order[i]!);
  }
  
  let insertPoint = 0;
  if (!segmentIndices.has(destIdx)) {
    for (let i = 0; i < n; i++) {
      if (segmentIndices.has(i)) continue;
      if (i === destIdx) break;
      insertPoint++;
    }
  } else {
    for (let offset = 1; offset < n; offset++) {
      const idx = (destIdx + offset) % n;
      if (!segmentIndices.has(idx)) {
        for (let i = 0; i < n; i++) {
          if (segmentIndices.has(i)) continue;
          if (i === idx) break;
          insertPoint++;
        }
        break;
      }
    }
  }
  
  return [...remainder.slice(0, insertPoint), ...segment, ...remainder.slice(insertPoint)];
}

function reverseSegment(order: PageData[], startIdx: number, segmentSize: number): PageData[] {
  const n = order.length;
  const result = [...order];
  
  for (let i = 0; i < Math.floor(segmentSize / 2); i++) {
    const left = (startIdx + i) % n;
    const right = (startIdx + segmentSize - 1 - i + n) % n;
    [result[left], result[right]] = [result[right]!, result[left]!];
  }
  
  return result;
}

function pivotSegment(order: PageData[], srcIdx: number, segmentSize: number, destIdx: number): PageData[] {
  const n = order.length;
  
  const segment: PageData[] = [];
  for (let i = 0; i < segmentSize; i++) {
    segment.push(order[(srcIdx + i) % n]!);
  }
  segment.reverse();
  
  const segmentIndices = new Set<number>();
  for (let i = 0; i < segmentSize; i++) {
    segmentIndices.add((srcIdx + i) % n);
  }
  
  const remainder: PageData[] = [];
  for (let i = 0; i < n; i++) {
    if (!segmentIndices.has(i)) remainder.push(order[i]!);
  }
  
  let insertPoint = 0;
  if (!segmentIndices.has(destIdx)) {
    for (let i = 0; i < n; i++) {
      if (segmentIndices.has(i)) continue;
      if (i === destIdx) break;
      insertPoint++;
    }
  } else {
    for (let offset = 1; offset < n; offset++) {
      const idx = (destIdx + offset) % n;
      if (!segmentIndices.has(idx)) {
        for (let i = 0; i < n; i++) {
          if (segmentIndices.has(i)) continue;
          if (i === idx) break;
          insertPoint++;
        }
        break;
      }
    }
  }
  
  return [...remainder.slice(0, insertPoint), ...segment, ...remainder.slice(insertPoint)];
}

/**
 * Convert ContentFile[] to PageData[]
 */
export function contentFilesToPageData(contentFiles: ContentFile[]): PageData[] {
  const pages: PageData[] = [];
  for (const file of contentFiles) {
    const meta = file.meta;
    const id = file.id;
    
    // Skip drafts and variant pages (IDs with '/')
    if (meta.draft || id.includes('/')) continue;
    
    pages.push({
      id,
      title: meta.title || id,
      links: meta.links || [],
    });
  }
  return pages;
}

// ============================================
// RUNTIME OPTIMIZATION (for dev mode animation)
// ============================================

/**
 * Create initial optimization state for incremental optimization.
 */
export function createOptimizationState(order: PageData[]): OptimizationState {
  const n = order.length;
  return {
    order: [...order],
    segmentSize: Math.floor(n / 2),
    srcIdx: 0,
    destIdx: 0,
    shouldReverse: false,
    isComplete: false,
    maxSegmentSize: Math.floor(n / 2),
  };
}

/**
 * Advance optimization by one step, or until time budget is exhausted.
 * 
 * This is designed for use with requestAnimationFrame for animated optimization.
 * Each call will search for improvements until either:
 * - An improvement is found (returns with improved=true, complete=false)
 * - A full epoch completes without finding an improvement (returns with complete=true)
 * - The time budget is exhausted (returns with complete=true to avoid retrying)
 * 
 * @param state - Mutable optimization state
 * @param timeBudgetMs - Maximum time to spend searching (default 10ms)
 */
export function runOptimizationStep(
  state: OptimizationState,
  timeBudgetMs: number = 1000
): OptimizationStepResult {
  if (state.isComplete || state.order.length === 0) {
    return { improved: false, newOrder: null, complete: true };
  }
  
  const startTime = performance.now();
  const n = state.order.length;
  
  const currentIndexMap = buildIndexMap(state.order);
  const currentCrossings = countCrossings(state.order, currentIndexMap);
  const currentAvgDist = averageLinkDistance(state.order, currentIndexMap);
  
  while (performance.now() - startTime < timeBudgetMs) {
    // Check if we've exhausted the search
    if (state.segmentSize < 1) {
      state.isComplete = true;
      return { improved: false, newOrder: null, complete: true };
    }
    
    // Try current position
    const isInPlace = state.destIdx >= state.srcIdx && state.destIdx < state.srcIdx + state.segmentSize;
    const isNoop = isInPlace && !state.shouldReverse;
    
    if (!isNoop) {
      let candidate: PageData[];
      if (isInPlace && state.shouldReverse) {
        candidate = reverseSegment(state.order, state.srcIdx, state.segmentSize);
      } else if (!state.shouldReverse) {
        candidate = relocateSegment(state.order, state.srcIdx, state.segmentSize, state.destIdx);
      } else {
        candidate = pivotSegment(state.order, state.srcIdx, state.segmentSize, state.destIdx);
      }
      
      const candidateIndexMap = buildIndexMap(candidate);
      const candidateCrossings = countCrossings(candidate, candidateIndexMap);
      const candidateAvgDist = averageLinkDistance(candidate, candidateIndexMap);
      
      const fewerCrossings = candidateCrossings < currentCrossings;
      const sameCrossingsButShorter = candidateCrossings === currentCrossings && candidateAvgDist < currentAvgDist;
      
      if (fewerCrossings || sameCrossingsButShorter) {
        // Found improvement! Reset search from beginning
        state.order = candidate;
        state.segmentSize = state.maxSegmentSize;
        state.srcIdx = 0;
        state.destIdx = 0;
        state.shouldReverse = false;
        return { improved: true, newOrder: candidate, complete: false };
      }
    }
    
    // Advance to next position
    if (!state.shouldReverse) {
      state.shouldReverse = true;
    } else {
      state.shouldReverse = false;
      state.destIdx++;
      if (state.destIdx >= n) {
        state.destIdx = 0;
        state.srcIdx++;
        if (state.srcIdx >= n) {
          state.srcIdx = 0;
          state.segmentSize--;
        }
      }
    }
  }
  
  // Time budget exhausted without finding improvement - mark complete to avoid retrying
  // (if we couldn't find an improvement within the time budget, retrying would just time out again)
  state.isComplete = true;
  return { improved: false, newOrder: null, complete: true };
}

// ============================================
// BUNDLE-TIME OPTIMIZATION (for macro usage)
// ============================================

/**
 * ContentFile with optional displayOrder metadata added by optimization.
 */
export interface OptimizedContentFile extends ContentFile {
  meta: ContentFile['meta'] & {
    /** Position in the optimized radial sitemap circular layout (0-indexed) */
    displayOrder?: number;
  };
}

/**
 * Run full optimization until no improvements can be found.
 * 
 * When imported with `{ type: 'macro' }`, this function executes at bundle time
 * and its result is inlined directly into the JavaScript bundle.
 * 
 * Returns the input ContentFile[] array with an added `displayOrder` property
 * on each element's metadata, indicating the optimized position in the circular layout.
 * 
 * @param contentFilesOrPromise - Array of ContentFile from discoverContent(), or a Promise thereof
 * @returns The input array with displayOrder added to each element's meta
 * 
 * @example
 * ```ts
 * import { discoverContent } from './content.ts' with { type: 'macro' };
 * import { runFullOptimization } from './sitemap-optimization.ts' with { type: 'macro' };
 * 
 * const allContent = runFullOptimization(discoverContent());
 * // Each element now has meta.displayOrder
 * ```
 */
export async function runFullOptimization(
  contentFilesOrPromise: ContentFile[] | Promise<ContentFile[]>
): Promise<OptimizedContentFile[]> {
  // Handle both sync and async content (macro context provides Promise)
  const contentFiles = await contentFilesOrPromise;
  const startTime = performance.now();
  
  // Convert to PageData for optimization (only non-draft, non-variant pages)
  const pages = contentFilesToPageData(contentFiles);
  
  if (pages.length === 0) {
    // Return input as-is if no pages to optimize
    return contentFiles as OptimizedContentFile[];
  }
  
  // Create optimization state from the intrinsic content order
  const state = createOptimizationState(pages);
  
  // Run optimization steps with unlimited time budget until complete
  while (!state.isComplete) {
    runOptimizationStep(state, Infinity);
  }
  
  // Build a map from page ID to optimized order position
  const orderMap = new Map<string, number>();
  state.order.forEach((page, idx) => orderMap.set(page.id, idx));
  
  const finalIndexMap = buildIndexMap(state.order);
  console.log(
    'Optimization complete. Crossings:',
    countCrossings(state.order, finalIndexMap),
    'Average distance:',
    averageLinkDistance(state.order, finalIndexMap),
    'Time:',
    performance.now() - startTime
  );
  
  // Return input files with displayOrder added to metadata
  return contentFiles.map(file => ({
    ...file,
    meta: { ...file.meta, ...(orderMap.has(file.id) ? { displayOrder: orderMap.get(file.id) } : {}) },
  }));
}