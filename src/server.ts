/**
 * Development server for the Frontier AI Explainer
 * 
 * Serves the app with:
 * - Server-side rendered (SSR) content for SEO
 * - Clean URLs (/tokens serves tokens content)
 * - Hashed JS bundles (matching production layout)
 * - File-based routing (src/content/{id}.mdx → /{id})
 * - Hot reload support
 * - Editorial mode (EDITORIAL_MODE=true): inline notes, A/B testing, etc.
 * 
 * Usage:
 *   bun run dev              # Standard dev server
 *   bun run dev:editorial    # Editorial mode with notes & variants
 */

import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { isEditorialMode } from '@/lib/build-mode.ts';
import { renderAppToString, getNodeMeta, clearCache, renderMarkdownContent } from '@/lib/ssr.tsx';
import { generateHtml, generateIndexHtml, contentHash, escapeHtml } from '@/lib/html-template.ts';
import { discoverContent, contentExists, clearContentCache, getContentPath } from '@/lib/content.ts';
import mdxPlugin from '@/plugins/mdx-plugin.ts';
import griffelPlugin from '@/plugins/griffel-plugin.ts';
import contentPlugin from '@/plugins/content-plugin.ts';

// Editorial imports (statically imported, pruned at build time if not used)
import {
  createNote,
  updateNote,
  deleteNote,
  addResponse,
  markAddressed,
  markAnchorInvalid,
  getNotesForPage,
  loadVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  getEditorialState,
  getNotesForAI,
} from '@/editorial/persistence.ts';

import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  AddResponseRequest,
  CreateVariantRequest,
} from '@/editorial/_types.ts';

// ============================================
// TYPES
// ============================================

interface BundleInfo {
  code: string;
  hash: string;
  outputs: Map<string, string>;
}

interface RenderOptions {
  jsPath: string;
  cssPath?: string;
  isDev?: boolean;
  allContentMeta: Record<string, any>;
  allContentIds: string[];
}

// ============================================
// PID FILE MANAGEMENT
// ============================================

const PID_FILE = '.dev.pid';

function writePidFile(): void {
  try {
    writeFileSync(PID_FILE, process.pid.toString());
  } catch (error) {
    console.error(`Failed to write PID file: ${error}`);
  }
}

function cleanupPidFile(): void {
  try {
    unlinkSync(PID_FILE);
  } catch {
    // Ignore errors
  }
}

function setupProcessHandlers(): void {
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
async function buildBundles(): Promise<BundleInfo> {
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
  };
  
  if (isEditorialMode()) {
    defines['process.env.EDITORIAL_MODE'] = '"true"';
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
  const modeLabel = isEditorialMode() ? ' (editorial mode)' : '';
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
async function getBundle(filename: string): Promise<string | null> {
  await buildBundles();
  return bundleCache.get(filename) || null;
}

// ============================================
// RESPONSE HELPERS
// ============================================

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function cssResponse(css: string | Blob): Response {
  return new Response(css, {
    headers: { 'Content-Type': 'text/css' },
  });
}

function jsResponse(code: string): Response {
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
async function handleJsBundle(pathname: string): Promise<Response | null> {
  if (!pathname.endsWith('.js')) return null;
  
  const filename = pathname.slice(1); // Remove leading /
  
  // For main bundle with hash, strip the hash
  const mainMatch = pathname.match(/^\/main\.([a-f0-9]+)\.js$/);
  const lookupName = mainMatch ? 'main.js' : filename;
  
  const code = await getBundle(lookupName);
  if (code) {
    return jsResponse(code);
  }
  
  // Try direct lookup for chunk files
  const chunkCode = await getBundle(filename);
  if (chunkCode) {
    return jsResponse(chunkCode);
  }
  
  return null;
}

/**
 * Handle static CSS file requests
 */
async function handleStaticCss(pathname: string): Promise<Response | null> {
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
async function handleAnalytics(req: Request, pathname: string): Promise<Response | null> {
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
// EDITORIAL MODE HANDLERS
// ============================================

async function parseJsonBody<T>(req: Request): Promise<T> {
  const text = await req.text();
  return JSON.parse(text) as T;
}

/**
 * Handle editorial API requests (only active in editorial mode)
 */
async function handleEditorialApi(req: Request, url: URL, pathname: string, method: string): Promise<Response | null> {
  if (!isEditorialMode()) return null;
  
  // Get editorial state (all notes and variants)
  if (pathname === '/api/editorial/state' && method === 'GET') {
    const state = await getEditorialState();
    return jsonResponse(state);
  }
  
  // Get notes for AI consumption
  if (pathname === '/api/editorial/notes/ai' && method === 'GET') {
    const pageId = url.searchParams.get('pageId') || undefined;
    const includeAddressed = url.searchParams.get('includeAddressed') === 'true';
    const text = await getNotesForAI(pageId, includeAddressed);
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  
  // Get notes for a page
  if (pathname.startsWith('/api/editorial/notes/page/') && method === 'GET') {
    const pageId = pathname.split('/').pop()!;
    const variantId = url.searchParams.get('variantId');
    const notes = await getNotesForPage(pageId, variantId);
    return jsonResponse(notes);
  }
  
  // Create note
  if (pathname === '/api/editorial/notes' && method === 'POST') {
    try {
      const body = await parseJsonBody<CreateNoteRequest>(req);
      const note = await createNote(body);
      return jsonResponse(note, 201);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Update note
  if (pathname.match(/^\/api\/editorial\/notes\/[^/]+$/) && method === 'PATCH') {
    const noteId = pathname.split('/').pop()!;
    try {
      const body = await parseJsonBody<UpdateNoteRequest>(req);
      const note = await updateNote(noteId, body);
      if (!note) {
        return errorResponse('Note not found', 404);
      }
      return jsonResponse(note);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Delete note
  if (pathname.match(/^\/api\/editorial\/notes\/[^/]+$/) && method === 'DELETE') {
    const noteId = pathname.split('/').pop()!;
    const deleted = await deleteNote(noteId);
    if (!deleted) {
      return errorResponse('Note not found', 404);
    }
    return jsonResponse({ success: true });
  }
  
  // Add response to note
  if (pathname.match(/^\/api\/editorial\/notes\/[^/]+\/responses$/) && method === 'POST') {
    const noteId = pathname.split('/')[4]!;
    try {
      const body = await parseJsonBody<AddResponseRequest>(req);
      const note = await addResponse(noteId, body);
      if (!note) {
        return errorResponse('Note not found', 404);
      }
      return jsonResponse(note);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Mark note as addressed
  if (pathname.match(/^\/api\/editorial\/notes\/[^/]+\/address$/) && method === 'POST') {
    const noteId = pathname.split('/')[4]!;
    try {
      const body = await parseJsonBody<{ author: string; actionTaken: string }>(req);
      const note = await markAddressed(noteId, body.author, body.actionTaken);
      if (!note) {
        return errorResponse('Note not found', 404);
      }
      return jsonResponse(note);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Mark note anchor as invalid
  if (pathname.match(/^\/api\/editorial\/notes\/[^/]+\/orphan$/) && method === 'POST') {
    const noteId = pathname.split('/')[4]!;
    const note = await markAnchorInvalid(noteId);
    if (!note) {
      return errorResponse('Note not found', 404);
    }
    return jsonResponse(note);
  }
  
  // Get variants for a page
  if (pathname.startsWith('/api/editorial/variants/') && method === 'GET') {
    const pageId = pathname.split('/').pop()!;
    const variants = await loadVariants(pageId);
    return jsonResponse(variants || { pageId, variants: [] });
  }
  
  // Create variant
  if (pathname === '/api/editorial/variants' && method === 'POST') {
    try {
      const body = await parseJsonBody<CreateVariantRequest>(req);
      
      // Get base content from the MDX file
      const contentPath = await getContentPath(body.pageId);
      if (!contentPath || !existsSync(contentPath)) {
        return errorResponse(`Page "${body.pageId}" not found`, 404);
      }
      const baseContent = readFileSync(contentPath, 'utf-8');
      
      const variant = await createVariant(body, baseContent);
      return jsonResponse(variant, 201);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Update variant content
  if (pathname.match(/^\/api\/editorial\/variants\/[^/]+\/[^/]+$/) && method === 'PUT') {
    const parts = pathname.split('/');
    const pageId = parts[4]!;
    const variantId = parts[5]!;
    try {
      const body = await parseJsonBody<{ content: string }>(req);
      const variant = await updateVariant(pageId, variantId, body.content);
      if (!variant) {
        return errorResponse('Variant not found', 404);
      }
      return jsonResponse(variant);
    } catch (error) {
      return errorResponse(String(error));
    }
  }
  
  // Delete variant
  if (pathname.match(/^\/api\/editorial\/variants\/[^/]+\/[^/]+$/) && method === 'DELETE') {
    const parts = pathname.split('/');
    const pageId = parts[4]!;
    const variantId = parts[5]!;
    const deleted = await deleteVariant(pageId, variantId);
    if (!deleted) {
      return errorResponse('Variant not found', 404);
    }
    return jsonResponse({ success: true });
  }
  
  // Get base MDX content for a page
  if (pathname.startsWith('/api/editorial/content/') && method === 'GET') {
    const pageId = pathname.split('/').pop()!;
    const contentPath = await getContentPath(pageId);
    if (!contentPath || !existsSync(contentPath)) {
      return errorResponse(`Page "${pageId}" not found`, 404);
    }
    const content = readFileSync(contentPath, 'utf-8');
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  
  return null;
}

/**
 * Handle editorial CSS requests (only active in editorial mode)
 */
async function handleEditorialCss(pathname: string): Promise<Response | null> {
  if (!isEditorialMode()) return null;
  if (pathname !== '/editorial/styles.css') return null;
  
  const file = Bun.file('./src/editorial/styles.css');
  if (await file.exists()) {
    return cssResponse(file);
  }
  return cssResponse('/* Editorial styles not found */');
}

/**
 * Handle variant page requests (only active in editorial mode)
 */
async function handleVariantPage(pathname: string, jsPath: string): Promise<Response | null> {
  if (!isEditorialMode()) return null;
  
  // Check for variant in URL path: /nodeId/variantId
  const pathParts = pathname.slice(1).split('/').filter(Boolean);
  if (pathParts.length < 2) return null;
  
  const baseNodeId = pathParts[0]!;
  const variantId = pathParts[1]!;
  
  // Skip if this is an API route
  if (baseNodeId === 'api') return null;
  
  const variants = await loadVariants(baseNodeId);
  const variant = variants?.variants.find(v => v.id === variantId);
  
  if (!variant) return null;
  
  // Extract title and summary from the markdown content
  const titleMatch = variant.content.match(/^#\s+(.+)\n/);
  const variantTitle = titleMatch?.[1] ?? variant.label;
  
  const summaryMatch = variant.content.match(/^#\s+.+\n+\*([^*]+)\*\n/);
  const variantSummary = summaryMatch?.[1] ?? '';
  
  // Strip the header section from the body
  const contentBody = variant.content
    .replace(/^#\s+.+\n+/, '')           // Remove H1
    .replace(/^\*[^*]+\*\n+/, '')        // Remove italic summary
    .replace(/^---\n+/, '');             // Remove horizontal rule
  
  const variantHtml = await renderMarkdownContent(contentBody);
  const meta = await getNodeMeta(baseNodeId);
  
  const html = generateVariantHtml({
    nodeId: baseNodeId,
    variantId,
    variantTitle,
    variantSummary,
    variantLabel: variant.label,
    contentHtml: variantHtml,
    baseMeta: meta || { id: baseNodeId, title: baseNodeId, summary: '' },
    jsPath,
    cssPath: '/styles',
  });
  
  return htmlResponse(html);
}

function generateVariantHtml(options: {
  nodeId: string;
  variantId: string;
  variantTitle: string;
  variantSummary: string;
  variantLabel: string;
  contentHtml: string;
  baseMeta: { id: string; title: string; summary: string };
  jsPath: string;
  cssPath: string;
}): string {
  const { nodeId, variantId, variantTitle, variantSummary, variantLabel, contentHtml, jsPath, cssPath } = options;
  
  const pageTitle = `${variantTitle} | Understanding Frontier AI`;
  const description = variantSummary || `Voice variant: ${variantId}`;
  const escapedDescription = escapeHtml(description);
  const escapedTitle = escapeHtml(pageTitle);
  const escapedNodeId = escapeHtml(nodeId);
  const escapedVariantId = escapeHtml(variantId);
  const escapedVariantLabel = escapeHtml(variantLabel);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapedDescription}">
  <title>${escapedTitle}</title>
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="${cssPath}/base.css">
  <link rel="stylesheet" href="${cssPath}/components.css">
  <link rel="stylesheet" href="${cssPath}/themes.css">
  <link rel="stylesheet" href="${cssPath}/theme-main.css">
  <link rel="stylesheet" href="/editorial/styles.css">
  
  <!-- Editorial mode -->
  <script>window.__EDITORIAL_MODE__ = true;</script>
</head>
<body>
  <div id="app" data-initial-node="${escapedNodeId}" data-variant="${escapedVariantId}">
    <div class="ssr-shell" data-ssr="true">
      <header class="app-header">
        <div class="app-header__inner">
          <a href="/" class="app-logo">Understanding Frontier AI</a>
        </div>
      </header>
      
      <main class="app-main">
        <article class="content-node" data-node-id="${escapedNodeId}">
          <header class="content-node__header">
            <div class="variant-indicator">
              <span class="variant-indicator__badge">${escapedVariantLabel}</span>
              <a href="/${escapedNodeId}" class="variant-indicator__back">← Back to base</a>
            </div>
            <h1 class="content-node__title">${escapeHtml(variantTitle)}</h1>
            <p class="content-node__summary">${escapedDescription}</p>
          </header>
          
          <div class="content-node__body">
            ${contentHtml}
          </div>
        </article>
      </main>
      
      <footer class="app-footer">
        <div class="content-width">
          <p>An open educational resource for understanding how AI actually works.</p>
        </div>
      </footer>
    </div>
  </div>
  
  <script type="module" src="${jsPath}"></script>
</body>
</html>`;
}

// ============================================
// CONTENT DISCOVERY
// ============================================

interface ContentDiscoveryResult {
  allContentMeta: Record<string, any>;
  allContentIds: string[];
  allContent: Awaited<ReturnType<typeof discoverContent>>;
}

/**
 * Discover all content for client-side navigation
 */
async function discoverAllContent(): Promise<ContentDiscoveryResult> {
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

/**
 * Inject editorial mode assets into HTML (only in editorial mode)
 */
function injectEditorialAssets(html: string): string {
  if (!isEditorialMode()) return html;
  
  const editorialAssets = `
    <link rel="stylesheet" href="/editorial/styles.css">
    <script>window.__EDITORIAL_MODE__ = true;</script>
  `;
  return html.replace('</head>', `${editorialAssets}</head>`);
}

/**
 * Render the index page
 */
async function renderIndexPage(
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
  
  return injectEditorialAssets(html);
}

/**
 * Render a content page with SSR
 */
async function renderContentPage(
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
  
  return injectEditorialAssets(html);
}

// ============================================
// REQUEST HANDLER
// ============================================

/**
 * Create the main request handler
 */
function createRequestHandler() {
  return async function handleRequest(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;
      
      // Editorial API routes (pruned if not in editorial mode)
      if (isEditorialMode()) {
        const editorialResponse = await handleEditorialApi(req, url, pathname, method);
        if (editorialResponse) return editorialResponse;
      }
      
      // Handle JS bundles
      const jsBundleResponse = await handleJsBundle(pathname);
      if (jsBundleResponse) return jsBundleResponse;
      
      // Handle analytics
      const analyticsResponse = await handleAnalytics(req, pathname);
      if (analyticsResponse) return analyticsResponse;
      
      // Handle static CSS
      const staticCssResponse = await handleStaticCss(pathname);
      if (staticCssResponse) return staticCssResponse;
      
      // Editorial CSS (pruned if not in editorial mode)
      if (isEditorialMode()) {
        const editorialCssResponse = await handleEditorialCss(pathname);
        if (editorialCssResponse) return editorialCssResponse;
      }
      
      // Get bundle info for HTML generation
      const bundle = await buildBundles();
      const jsPath = `/main.${bundle.hash}.js`;
      
      // Discover content
      const { allContentMeta, allContentIds, allContent } = await discoverAllContent();
      
      // Build request context
      const nodeId = pathname === '/' ? 'intro' : pathname.slice(1).replace(/\/$/, '');
      
      // Variant page handling (pruned if not in editorial mode)
      if (isEditorialMode()) {
        const variantResponse = await handleVariantPage(pathname, jsPath);
        if (variantResponse) return variantResponse;
      }
      
      // Standard content routes
      const renderOptions: RenderOptions = {
        jsPath,
        cssPath: '/styles',
        isDev: true,
        allContentMeta,
        allContentIds,
      };
      
      // Index page
      if (nodeId === 'index') {
        const html = await renderIndexPage(allContent, renderOptions);
        return htmlResponse(html);
      }
      
      // Check if content exists (extract base node ID for variant check)
      const baseNodeId = nodeId.split('/')[0] ?? nodeId;
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
// SERVER STARTUP
// ============================================

const port = 3000;

writePidFile();
setupProcessHandlers();

const server = Bun.serve({
  port,
  fetch: createRequestHandler(),
  development: false,
});

// Startup message
if (isEditorialMode()) {
  console.log(`
📝 Frontier AI Explainer - EDITORIAL MODE
   Server running at http://localhost:${port}
   PID: ${process.pid} (saved to .dev.pid)
   
   Editorial Features:
   - Positionally-anchored notes (create, edit, delete)
   - A/B/C variant testing
   - Notes persisted to ./editorial/ directory
   - AI-consumable notes at /api/editorial/notes/ai
   
   API Endpoints:
   - GET  /api/editorial/state        - Full editorial state
   - GET  /api/editorial/notes/ai     - Notes formatted for AI
   - GET  /api/editorial/notes/page/:id - Notes for a page
   - POST /api/editorial/notes        - Create note
   - PATCH /api/editorial/notes/:id   - Update note
   - DELETE /api/editorial/notes/:id  - Delete note
   
   Press Ctrl+C to stop
`);
} else {
  console.log(`
🧠 Frontier AI Explainer
   Development server running at http://localhost:${port}
   PID: ${process.pid} (saved to .dev.pid)
   
   Features:
   - Server-side rendered content (SSR)
   - File-based routing (src/content/{id}.mdx)
   - Clean URLs (/tokens, /models, etc.)
   
   Tip: Use bun run dev:editorial for editorial mode
   
   Press Ctrl+C to stop
`);
}
