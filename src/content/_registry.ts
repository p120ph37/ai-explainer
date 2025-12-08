/**
 * Content registry
 * 
 * Manages dynamic loading and metadata for content nodes.
 * Uses dynamic imports for code splitting.
 * 
 * MDX files are loaded directly (no compilation step needed)
 * thanks to the Bun MDX plugin loaded via --preload.
 */

import type { ContentMeta, ContentModule } from './_types.ts';

/**
 * Static metadata registry (loaded eagerly for navigation)
 */
const metaRegistry = new Map<string, ContentMeta>();

/**
 * Cache for loaded content modules
 */
const moduleCache = new Map<string, ContentModule>();

/**
 * Dynamic import map for content nodes
 * 
 * Content can be authored in:
 * - .mdx files (Markdown + JSX, loaded directly via plugin)
 * - .tsx files (for highly interactive content)
 */
const contentImports: Record<string, () => Promise<ContentModule>> = {
  // MDX content - loaded directly, no compilation needed
  'intro': () => import('./intro/what-is-llm.mdx') as Promise<ContentModule>,
  'tokens': () => import('./foundations/tokens.mdx') as Promise<ContentModule>,
  'why-large': () => import('./foundations/why-large.mdx') as Promise<ContentModule>,
  
  // TSX content example (for interactive visualizations):
  // 'tokenizer-demo': () => import('./interactive/tokenizer-demo.tsx'),
};

/**
 * Register content metadata
 */
export function registerMeta(meta: ContentMeta): void {
  metaRegistry.set(meta.id, meta);
}

/**
 * Get metadata for a node (synchronous, from registry)
 */
export function getNodeMeta(nodeId: string): ContentMeta | undefined {
  return metaRegistry.get(nodeId);
}

/**
 * Get all registered node IDs
 */
export function getAllNodeIds(): string[] {
  return [...metaRegistry.keys()];
}

/**
 * Load a content node (async, with caching)
 */
export async function getNode(nodeId: string): Promise<ContentModule | null> {
  // Check cache first
  if (moduleCache.has(nodeId)) {
    return moduleCache.get(nodeId)!;
  }
  
  // Look up the import function
  const importFn = contentImports[nodeId];
  
  if (!importFn) {
    console.warn(`No content registered for node: ${nodeId}`);
    return null;
  }
  
  try {
    const module = await importFn();
    
    // Cache the module
    moduleCache.set(nodeId, module);
    
    // Ensure metadata is registered
    if (module.meta && !metaRegistry.has(nodeId)) {
      registerMeta(module.meta);
    }
    
    return module;
  } catch (error) {
    console.error(`Failed to load content node: ${nodeId}`, error);
    return null;
  }
}

/**
 * Prefetch a content node
 */
export async function prefetchNode(nodeId: string): Promise<void> {
  if (moduleCache.has(nodeId)) return;
  await getNode(nodeId);
}

/**
 * Get child and related nodes for a given node
 */
export function getRelatedNodes(nodeId: string): string[] {
  const meta = metaRegistry.get(nodeId);
  if (!meta) return [];
  return [...(meta.children || []), ...(meta.related || [])];
}

/**
 * Content registry export
 */
export const contentRegistry = {
  getMeta: getNodeMeta,
  getNode,
  prefetch: prefetchNode,
  getAllIds: getAllNodeIds,
  getRelated: getRelatedNodes,
};
