/**
 * Shared server core functionality
 * 
 * This module contains the common server infrastructure used by both
 * the standard dev server and the editorial server.
 */

import { writeFileSync, unlinkSync } from 'fs';
import { renderAppToString, getNodeMeta, clearCache } from '@/lib/ssr.tsx';
import { generateHtml, generateIndexHtml, contentHash } from '@/lib/html-template.ts';
import { discoverContent, contentExists, clearContentCache } from '@/lib/content.ts';
import mdxPlugin from '@/plugins/mdx-plugin.ts';
import griffelPlugin from '@/plugins/griffel-plugin.ts';
import contentPlugin from '@/plugins/content-plugin.ts';

// ============================================
// TYPES
// ============================================

export interface ServerConfig {
  /** Whether this is editorial mode */
  editorialMode?: boolean;
  /** Additional build defines */
  defines?: Record<string, string>;
  /** Port to run on */
  port?: number;
}

export interface BundleInfo {
  code: string;
  hash: string;
  outputs: Map<string, string>;
}

export interface RequestContext {
  url: URL;
  pathname: string;
  method: string;
  nodeId: string;
  jsPath: string;
  allContentMeta: Record<string, any>;
  allContentIds: string[];
}

export type RouteHandler = (
  req: Request, 
  ctx: RequestContext
) => Promise<Response | null> | Response | null;

// ============================================
// PID FILE MANAGEMENT
// ============================================

const PID_FILE = '.dev.pid';

export function writePidFile(): void {
  try {
    writeFileSync(PID_FILE, process.pid.toString());
  } catch (error) {
    console.error(`Failed to write PID file: ${error}`);
  }
}

export function cleanupPidFile(): void {
  try {
    unlinkSync(PID_FILE);
  } catch {
    // Ignore errors
  }
}

export function setupProcessHandlers(): void {
  process.on('exit', cleanupPidFile);
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}

// ============================================
// BUNDLE MANAGEMENT
// ============================================

let bundleCache: Map<string, string> = new Map();
let mainBundleHash = '';
let bundleTime = 0;

/**
 * Build and cache all JS bundles
 */
export async function buildBundles(config: ServerConfig = {}): Promise<BundleInfo> {
  const now = Date.now();
  if (bundleCache.size > 0 && (now - bundleTime) < 1000) {
    return { 
      code: bundleCache.get('main.js') || '', 
      hash: mainBundleHash,
      outputs: bundleCache,
    };
  }
  
  const defines: Record<string, string> = {
    'process.env.NODE_ENV': '"development"',
    ...config.defines,
  };
  
  if (config.editorialMode) {
    defines['process.env.EDITORIAL_MODE'] = 'true';
  }
  
  const result = await Bun.build({
    entrypoints: ['./src/app/main.tsx'],
    outdir: './dist',
    minify: false,
    splitting: false,
    plugins: [contentPlugin, griffelPlugin, mdxPlugin],
    target: 'browser',
    define: defines,
  });
  
  if (!result.success) {
    console.error('JS build failed:', result.logs);
    const fallback = '// Build failed\nconsole.error("JS build failed");';
    bundleCache.set('main.js', fallback);
    mainBundleHash = 'error';
    return { code: fallback, hash: 'error', outputs: bundleCache };
  }
  
  // Cache all outputs
  bundleCache.clear();
  for (const output of result.outputs) {
    const filename = output.path.split('/').pop()!;
    const code = await output.text();
    bundleCache.set(filename, code);
  }
  
  // Find main entry and compute hash
  const mainOutput = result.outputs.find(o => o.path.includes('main'));
  if (mainOutput) {
    const mainCode = await mainOutput.text();
    mainBundleHash = contentHash(mainCode);
  }
  
  bundleTime = now;
  const modeLabel = config.editorialMode ? ' (editorial mode)' : '';
  console.log(`📦 JS bundles rebuilt: ${result.outputs.length} files, main.${mainBundleHash}.js${modeLabel}`);
  
  return { 
    code: bundleCache.get('main.js') || '', 
    hash: mainBundleHash,
    outputs: bundleCache,
  };
}

/**
 * Get a specific bundle file by name
 */
export async function getBundle(filename: string, config: ServerConfig = {}): Promise<string | null> {
  await buildBundles(config);
  return bundleCache.get(filename) || null;
}

/**
 * Clear the bundle cache (for hot reload)
 */
export function clearBundleCache(): void {
  bundleCache.clear();
  mainBundleHash = '';
  bundleTime = 0;
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function cssResponse(css: string | Blob): Response {
  return new Response(css, {
    headers: { 'Content-Type': 'text/css' },
  });
}

export function jsResponse(code: string): Response {
  return new Response(code, {
    headers: { 
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
    },
  });
}

// ============================================
// COMMON ROUTE HANDLERS
// ============================================

/**
 * Handle JS bundle requests
 */
export async function handleJsBundle(
  pathname: string, 
  config: ServerConfig = {}
): Promise<Response | null> {
  if (!pathname.endsWith('.js')) return null;
  
  const filename = pathname.slice(1); // Remove leading /
  
  // For main bundle with hash, strip the hash
  const mainMatch = pathname.match(/^\/main\.([a-f0-9]+)\.js$/);
  const lookupName = mainMatch ? 'main.js' : filename;
  
  const code = await getBundle(lookupName, config);
  if (code) {
    return jsResponse(code);
  }
  
  // Try direct lookup for chunk files
  const chunkCode = await getBundle(filename, config);
  if (chunkCode) {
    return jsResponse(chunkCode);
  }
  
  return null;
}

/**
 * Handle static CSS file requests
 */
export async function handleStaticCss(pathname: string): Promise<Response | null> {
  if (!pathname.startsWith('/styles/')) return null;
  
  const file = Bun.file(`src${pathname}`);
  if (await file.exists()) {
    return cssResponse(file);
  }
  
  return new Response('Not found', { status: 404 });
}

/**
 * Handle analytics events (dev mode beacon)
 */
export async function handleAnalytics(req: Request, pathname: string): Promise<Response | null> {
  if (pathname !== '/__analytics' || req.method !== 'POST') return null;
  
  try {
    const event = await req.json();
    const emoji = event.type === 'page_view' ? '📄' 
      : event.type === 'scroll' ? '📜'
      : event.type === 'outbound_click' ? '🔗' : '📊';
    
    // Format a concise single-line log
    const path = event.location?.replace(/^https?:\/\/[^/]+/, '') || '?';
    const ref = event.referrer?.replace(/^https?:\/\/[^/]+/, '') || '-';
    const reason = event.reason || '';
    const mode = event.mode ? `[${event.mode}]` : '';
    
    console.log(`${emoji} ${path} ← ${ref} ${reason} ${mode}`.trim());
  } catch {
    console.log('📊 Analytics: Invalid event data');
  }
  
  return new Response('OK', { status: 200 });
}

// ============================================
// CONTENT DISCOVERY
// ============================================

export interface ContentDiscoveryResult {
  allContentMeta: Record<string, any>;
  allContentIds: string[];
  allContent: Awaited<ReturnType<typeof discoverContent>>;
}

/**
 * Discover all content for client-side navigation
 */
export async function discoverAllContent(): Promise<ContentDiscoveryResult> {
  const allContent = await discoverContent();
  const allContentMeta: Record<string, any> = {};
  const allContentIds: string[] = [];
  
  for (const c of allContent) {
    allContentMeta[c.id] = c.meta;
    allContentIds.push(c.id);
  }
  
  return { allContentMeta, allContentIds, allContent };
}

// ============================================
// PAGE RENDERING
// ============================================

export interface RenderOptions {
  jsPath: string;
  cssPath?: string;
  isDev?: boolean;
  allContentMeta: Record<string, any>;
  allContentIds: string[];
  editorialMode?: boolean;
  editorialCssPath?: string;
}

/**
 * Render the index page
 */
export async function renderIndexPage(
  allContent: Awaited<ReturnType<typeof discoverContent>>,
  options: RenderOptions
): Promise<string> {
  let html = generateIndexHtml({
    nodes: allContent.map(c => c.meta),
    jsPath: options.jsPath,
    cssPath: options.cssPath || '/styles',
    isDev: options.isDev ?? true,
    allContentMeta: options.allContentMeta,
    allContentIds: options.allContentIds,
  });
  
  if (options.editorialMode && options.editorialCssPath) {
    html = injectEditorialMode(html, options.editorialCssPath);
  }
  
  return html;
}

/**
 * Render a content page with SSR
 */
export async function renderContentPage(
  nodeId: string,
  options: RenderOptions
): Promise<string> {
  const rendered = await renderAppToString(nodeId);
  
  let html: string;
  
  if (!rendered) {
    // Node exists but couldn't be rendered - fall back to client-side rendering
    const meta = await getNodeMeta(nodeId);
    html = generateHtml({
      meta: meta || { id: nodeId, title: nodeId, summary: '' },
      jsPath: options.jsPath,
      cssPath: options.cssPath || '/styles',
      isDev: options.isDev ?? true,
      allContentMeta: options.allContentMeta,
      allContentIds: options.allContentIds,
    });
  } else {
    html = generateHtml({
      meta: rendered.meta,
      contentHtml: rendered.html,
      ssrStyleElements: rendered.styleElements,
      jsPath: options.jsPath,
      cssPath: options.cssPath || '/styles',
      isDev: options.isDev ?? true,
      allContentMeta: options.allContentMeta,
      allContentIds: options.allContentIds,
    });
  }
  
  if (options.editorialMode && options.editorialCssPath) {
    html = injectEditorialMode(html, options.editorialCssPath);
  }
  
  return html;
}

/**
 * Inject editorial mode assets into HTML
 */
function injectEditorialMode(html: string, cssPath: string): string {
  const editorialAssets = `
    <link rel="stylesheet" href="${cssPath}">
    <script>window.__EDITORIAL_MODE__ = true;</script>
  `;
  return html.replace('</head>', `${editorialAssets}</head>`);
}

// ============================================
// REQUEST HANDLER FACTORY
// ============================================

export interface CreateHandlerOptions extends ServerConfig {
  /** Additional route handlers to run before standard routes */
  preRoutes?: RouteHandler[];
  /** Additional route handlers to run after standard routes but before content */
  postRoutes?: RouteHandler[];
}

/**
 * Create the main request handler
 */
export function createRequestHandler(options: CreateHandlerOptions = {}) {
  const config: ServerConfig = {
    editorialMode: options.editorialMode,
    defines: options.defines,
    port: options.port,
  };
  
  return async function handleRequest(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;
      
      // Run pre-routes (editorial API, etc.)
      if (options.preRoutes) {
        for (const handler of options.preRoutes) {
          // Build partial context for pre-routes
          const partialCtx = { url, pathname, method } as RequestContext;
          const response = await handler(req, partialCtx);
          if (response) return response;
        }
      }
      
      // Handle JS bundles
      const jsResponse = await handleJsBundle(pathname, config);
      if (jsResponse) return jsResponse;
      
      // Handle analytics
      const analyticsResponse = await handleAnalytics(req, pathname);
      if (analyticsResponse) return analyticsResponse;
      
      // Handle static CSS
      const cssResponse = await handleStaticCss(pathname);
      if (cssResponse) return cssResponse;
      
      // Get bundle info for HTML generation
      const bundle = await buildBundles(config);
      const jsPath = `/main.${bundle.hash}.js`;
      
      // Discover content
      const { allContentMeta, allContentIds, allContent } = await discoverAllContent();
      
      // Build full request context
      const nodeId = pathname === '/' ? 'intro' : pathname.slice(1).replace(/\/$/, '');
      const ctx: RequestContext = {
        url,
        pathname,
        method,
        nodeId,
        jsPath,
        allContentMeta,
        allContentIds,
      };
      
      // Run post-routes (editorial CSS, variant rendering, etc.)
      if (options.postRoutes) {
        for (const handler of options.postRoutes) {
          const response = await handler(req, ctx);
          if (response) return response;
        }
      }
      
      // Standard content routes
      const renderOptions: RenderOptions = {
        jsPath,
        cssPath: '/styles',
        isDev: true,
        allContentMeta,
        allContentIds,
        editorialMode: config.editorialMode,
        editorialCssPath: config.editorialMode ? '/editorial/styles.css' : undefined,
      };
      
      // Index page
      if (nodeId === 'index') {
        const html = await renderIndexPage(allContent, renderOptions);
        return htmlResponse(html);
      }
      
      // Check if content exists (extract base node ID for variant check)
      const baseNodeId = nodeId.split('/')[0];
      if (!(await contentExists(baseNodeId)) && !(await contentExists(nodeId))) {
        return new Response('Not found', { status: 404 });
      }
      
      // Render content page
      const html = await renderContentPage(nodeId, renderOptions);
      return htmlResponse(html);
      
    } catch (error) {
      console.error('Request error:', error);
      return new Response(`Error: ${error}`, { status: 500 });
    }
  };
}

// ============================================
// SERVER FACTORY
// ============================================

export interface ServerInstance {
  server: ReturnType<typeof Bun.serve>;
  port: number;
}

/**
 * Create and start the server
 */
export function createServer(options: CreateHandlerOptions = {}): ServerInstance {
  const port = options.port || 3000;
  
  writePidFile();
  setupProcessHandlers();
  
  const server = Bun.serve({
    port,
    fetch: createRequestHandler(options),
    development: false,
  });
  
  return { server, port };
}

// Re-export utilities that might be needed by consumers
export { contentHash, escapeHtml } from '@/lib/html-template.ts';
export { contentExists, discoverContent, getContentPath } from '@/lib/content.ts';
export { getNodeMeta, clearCache, renderMarkdownContent } from '@/lib/ssr.tsx';

