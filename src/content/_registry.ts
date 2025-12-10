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
  'scale': () => import('./foundations/scale.mdx') as Promise<ContentModule>,
  'context-window': () => import('./foundations/context-window.mdx') as Promise<ContentModule>,
  'neural-network': () => import('./foundations/neural-network.mdx') as Promise<ContentModule>,
  'parameters': () => import('./foundations/parameters.mdx') as Promise<ContentModule>,
  'embeddings': () => import('./foundations/embeddings.mdx') as Promise<ContentModule>,
  'attention': () => import('./foundations/attention.mdx') as Promise<ContentModule>,
  'transformer': () => import('./foundations/transformer.mdx') as Promise<ContentModule>,
  'labels': () => import('./foundations/labels.mdx') as Promise<ContentModule>,
  'training': () => import('./foundations/training.mdx') as Promise<ContentModule>,
  'reward': () => import('./foundations/reward.mdx') as Promise<ContentModule>,
  'tuning': () => import('./foundations/tuning.mdx') as Promise<ContentModule>,
  'inference': () => import('./foundations/inference.mdx') as Promise<ContentModule>,
  'temperature': () => import('./foundations/temperature.mdx') as Promise<ContentModule>,
  'emergence': () => import('./foundations/emergence.mdx') as Promise<ContentModule>,
  'hallucinations': () => import('./foundations/hallucinations.mdx') as Promise<ContentModule>,
  'understanding': () => import('./foundations/understanding.mdx') as Promise<ContentModule>,
  'prompt-engineering': () => import('./foundations/prompt-engineering.mdx') as Promise<ContentModule>,
  'tools': () => import('./foundations/tools.mdx') as Promise<ContentModule>,
  'vector-databases': () => import('./foundations/vector-databases.mdx') as Promise<ContentModule>,
  'hardware': () => import('./foundations/hardware.mdx') as Promise<ContentModule>,
  'cutoff': () => import('./foundations/cutoff.mdx') as Promise<ContentModule>,
  'memory': () => import('./foundations/memory.mdx') as Promise<ContentModule>,
  'multimodal': () => import('./foundations/multimodal.mdx') as Promise<ContentModule>,
  'reasoning': () => import('./foundations/reasoning.mdx') as Promise<ContentModule>,
  'optimization': () => import('./foundations/optimization.mdx') as Promise<ContentModule>,
  
  // Ecosystem content
  'models': () => import('./ecosystem/models.mdx') as Promise<ContentModule>,
  'players': () => import('./ecosystem/players.mdx') as Promise<ContentModule>,
  'open': () => import('./ecosystem/open.mdx') as Promise<ContentModule>,
  'applications': () => import('./ecosystem/applications.mdx') as Promise<ContentModule>,
  'local': () => import('./ecosystem/local.mdx') as Promise<ContentModule>,
  'agents': () => import('./ecosystem/agents.mdx') as Promise<ContentModule>,
  
  // Safety content
  'bias': () => import('./safety/bias.mdx') as Promise<ContentModule>,
  'alignment': () => import('./safety/alignment.mdx') as Promise<ContentModule>,
  'security': () => import('./safety/security.mdx') as Promise<ContentModule>,
  'guardrails': () => import('./safety/guardrails.mdx') as Promise<ContentModule>,
  
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
