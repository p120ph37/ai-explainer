/**
 * Content discovery and access
 * 
 * Single source of truth for content metadata.
 * Works in both server and client contexts:
 * 
 * - Server: Scans src/content/*.mdx using Bun.Glob
 * - Client: Reads from window.__CONTENT_META__ (injected by server)
 * 
 * File naming: src/content/{id}.mdx → route /{id}
 */

// Note: Glob is accessed via globalThis.Bun to avoid bundler issues
// when building for browser target

// ============================================
// TYPES
// ============================================

export interface ContentMeta {
  id: string;
  title: string;
  summary: string;
  category?: string;
  order?: number;
  prerequisites?: string[];
  children?: string[];
  related?: string[];
  keywords?: string[];
  /** If true, this page is a draft and should not be included in production builds */
  draft?: boolean;
}

export interface ContentFile {
  id: string;
  path: string;
  meta: ContentMeta;
}

export interface ContentModule {
  default: any;
  meta: ContentMeta;
}

// ============================================
// ENVIRONMENT DETECTION
// ============================================

const isServer = typeof window === 'undefined';

declare global {
  interface Window {
    __CONTENT_META__?: Record<string, ContentMeta>;
    __CONTENT_IDS__?: string[];
  }
}

// ============================================
// SERVER-SIDE: File Discovery
// ============================================

// Cache for discovered content
let contentCache: ContentFile[] | null = null;

/**
 * Parse YAML frontmatter from MDX content
 */
function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match || !match[1]) return {};
  
  const yaml = match[1];
  const result: Record<string, any> = {};
  
  const lines = yaml.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;
  
  for (const line of lines) {
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      if (currentArray && currentKey) {
        currentArray.push(value);
      }
      continue;
    }
    
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch && kvMatch[1] && kvMatch[2] !== undefined) {
      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
      }
      
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      
      if (value === '' || value === '[]') {
        currentArray = [];
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, '');
        currentKey = null;
        currentArray = null;
      }
    }
  }
  
  if (currentKey && currentArray) {
    result[currentKey] = currentArray;
  }
  
  return result;
}

function extractMeta(id: string, frontmatter: Record<string, any>): ContentMeta {
  return {
    id,
    title: frontmatter.title || id,
    summary: frontmatter.summary || '',
    category: frontmatter.category,
    order: frontmatter.order ? parseInt(frontmatter.order, 10) : undefined,
    prerequisites: frontmatter.prerequisites,
    children: frontmatter.children,
    related: frontmatter.related,
    keywords: frontmatter.keywords,
    draft: frontmatter.draft === true || frontmatter.draft === 'true',
  };
}

/**
 * Discover all content files (server-side only)
 */
export async function discoverContent(contentDir = "src/content"): Promise<ContentFile[]> {
  if (!isServer) {
    throw new Error("discoverContent() is server-side only");
  }
  
  if (contentCache) return contentCache;
  
  // Use **/*.mdx to find both base pages and nested variants
  const glob = new Bun.Glob("**/*.mdx");
  const files: ContentFile[] = [];
  
  for await (const filename of glob.scan(contentDir)) {
    // Extract ID from path: intro.mdx → 'intro', intro/research.mdx → 'intro/research'
    const id = filename.replace('.mdx', '');
    const path = `${contentDir}/${filename}`;
    const text = await Bun.file(path).text();
    const frontmatter = parseFrontmatter(text);
    const meta = extractMeta(id, frontmatter);
    
    files.push({ id, path, meta });
  }
  
  files.sort((a, b) => {
    const orderA = a.meta.order ?? 999;
    const orderB = b.meta.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
  
  contentCache = files;
  return files;
}

/**
 * Check if content exists (server-side only)
 */
export async function contentExists(id: string, contentDir = "src/content"): Promise<boolean> {
  if (!isServer) {
    return getAllNodeIds().includes(id);
  }
  // Handle both base pages (intro.mdx) and nested variants (intro/research.mdx)
  const path = `${contentDir}/${id}.mdx`;
  return await Bun.file(path).exists();
}

/**
 * Get content file path (server-side only)
 */
export async function getContentPath(id: string, contentDir = "src/content"): Promise<string | null> {
  if (!isServer) return null;
  const files = await discoverContent(contentDir);
  return files.find(f => f.id === id)?.path || null;
}

/**
 * Clear content cache (for hot reload)
 */
export function clearContentCache(): void {
  contentCache = null;
}

// ============================================
// CLIENT-SIDE: Read from injected globals
// ============================================

// Local registry for test-time additions
const localMeta: Record<string, ContentMeta> = {};
const localIds = new Set<string>();

function getInjectedMeta(): Record<string, ContentMeta> {
  if (!isServer && window.__CONTENT_META__) {
    return window.__CONTENT_META__;
  }
  return {};
}

function getInjectedIds(): string[] {
  if (!isServer && window.__CONTENT_IDS__) {
    return window.__CONTENT_IDS__;
  }
  return [];
}

// ============================================
// UNIFIED API (works in both contexts)
// ============================================

/** Get metadata for a node */
export function getNodeMeta(nodeId: string): ContentMeta | undefined {
  if (localMeta[nodeId]) return localMeta[nodeId];
  return getInjectedMeta()[nodeId];
}

/** Get all node IDs */
export function getAllNodeIds(): string[] {
  const ids = new Set([...getInjectedIds(), ...localIds]);
  return Array.from(ids);
}

/** Get child and related nodes */
export function getRelatedNodes(nodeId: string): string[] {
  const meta = getNodeMeta(nodeId);
  if (!meta) return [];
  return [...(meta.children || []), ...(meta.related || [])];
}

/** Register metadata (for tests) */
export function registerMeta(meta: ContentMeta): void {
  localMeta[meta.id] = meta;
  localIds.add(meta.id);
}

// ============================================
// SPECIAL PAGES
// ============================================

export const specialPages: Record<string, ContentMeta> = {
  'index': {
    id: 'index',
    title: 'Content Index',
    summary: 'A complete listing of all topics in this AI explainer.',
  },
};

// ============================================
// VARIANT SUPPORT
// ============================================

// Variants are now regular content files in src/content/{page}/ subdirectories
// Their IDs contain a slash, e.g., "intro/research"

/**
 * VariantMeta extends ContentMeta with variant-specific fields
 * Used for backwards compatibility with editorial system
 */
export interface VariantMeta extends ContentMeta {
  basePageId: string;
  variantId: string;
  label: string;
  isVariant: true;
}

/**
 * Check if a node ID is a variant (contains a slash)
 */
export function isVariantId(nodeId: string): boolean {
  return nodeId.includes('/');
}

/**
 * Parse a variant ID into base page and variant name
 */
export function parseVariantId(nodeId: string): { basePageId: string; variantId: string } | null {
  if (!isVariantId(nodeId)) return null;
  const parts = nodeId.split('/');
  return { basePageId: parts[0] || '', variantId: parts[1] || '' };
}

/**
 * Get metadata for a variant
 * Since variants are now regular content, this uses the content metadata
 */
export function getVariantMeta(nodeId: string): VariantMeta | undefined {
  const meta = getNodeMeta(nodeId);
  if (!meta) return undefined;
  
  const parsed = parseVariantId(nodeId);
  if (!parsed) return undefined;
  
  // Convert ContentMeta to VariantMeta
  return {
    ...meta,
    basePageId: parsed.basePageId,
    variantId: parsed.variantId,
    label: meta.title,
    isVariant: true,
  };
}

/**
 * Get all variant IDs (IDs that contain a slash)
 */
export function getAllVariantIds(): string[] {
  return getAllNodeIds().filter(isVariantId);
}

/**
 * Get metadata for either a base page or a variant
 */
export function getNodeOrVariantMeta(nodeId: string): ContentMeta | VariantMeta | undefined {
  return isVariantId(nodeId) ? getVariantMeta(nodeId) : getNodeMeta(nodeId);
}

// ============================================
// DYNAMIC CONTENT LOADING (client-side)
// ============================================

/**
 * Content module type
 */
export interface ContentModule {
  default: any;
  meta: ContentMeta;
}

/**
 * Cache for loaded content modules
 */
const moduleCache = new Map<string, ContentModule | null>();

/**
 * Load a content module dynamically (client-side)
 * 
 * For SSR pages, this fetches the page HTML and extracts metadata.
 * The actual component rendering uses the SSR HTML directly.
 */
/**
 * Component that preserves SSR content from the DOM
 */
function SSRPreservedContent() {
  // Find and clone SSR content on first render
  if (typeof window !== 'undefined') {
    const ssrBody = document.querySelector('.content-node__body');
    if (ssrBody) {
      // Return a div that will be replaced by the SSR content
      // Using dangerouslySetInnerHTML to preserve SSR
      return { 
        type: 'div', 
        props: { 
          className: 'content-node__body',
          dangerouslySetInnerHTML: { __html: ssrBody.innerHTML }
        }
      };
    }
  }
  return null;
}

export async function getNodeOrVariant(nodeId: string): Promise<ContentModule | null> {
  // Check cache first
  if (moduleCache.has(nodeId)) {
    return moduleCache.get(nodeId) || null;
  }
  
  // For initial page load, content is already SSR-rendered
  // Check if we're on the correct page already
  if (typeof window !== 'undefined') {
    const app = document.getElementById('app');
    const currentNodeId = app?.dataset.initialNode;
    
    if (currentNodeId === nodeId) {
      // We're already on this page - use the SSR content
      const meta = getNodeOrVariantMeta(nodeId);
      if (meta) {
        // Create a module that preserves SSR content
        const module: ContentModule = {
          default: SSRPreservedContent,
          meta: 'isVariant' in meta ? {
            id: meta.id,
            title: meta.title,
            summary: meta.summary,
          } : meta,
        };
        moduleCache.set(nodeId, module);
        return module;
      }
    }
  }
  
  // For navigation, we need to fetch new HTML
  // Return null to trigger error state - router should handle page reload
  const meta = getNodeOrVariantMeta(nodeId);
  if (meta) {
    // For navigation, we should fetch the new page HTML
    // For now, return a component that triggers a page reload
    const module: ContentModule = {
      default: () => {
        // Trigger full page navigation for now
        if (typeof window !== 'undefined') {
          window.location.href = `/${nodeId}`;
        }
        return null;
      },
      meta: 'isVariant' in meta ? {
        id: meta.id,
        title: meta.title,
        summary: meta.summary,
      } : meta,
    };
    moduleCache.set(nodeId, module);
    return module;
  }
  
  // Not found
  moduleCache.set(nodeId, null);
  return null;
}

// ============================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================

export const contentRegistry = {
  getMeta: getNodeMeta,
  getNode: getNodeOrVariant,
  prefetch: async () => {},
  getAllIds: getAllNodeIds,
  getRelated: getRelatedNodes,
};
