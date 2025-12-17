/**
 * Editorial mode server
 * 
 * Extends the base dev server with editorial features:
 * - Note management (create, edit, delete, mark addressed)
 * - Variant management (create, edit, delete)
 * - AI-consumable note format
 * 
 * Run with: bun run dev:editorial
 */

import { existsSync, readFileSync } from 'fs';
import { 
  createServer, 
  jsonResponse, 
  errorResponse, 
  cssResponse,
  htmlResponse,
  getNodeMeta,
  getContentPath,
  escapeHtml,
  renderMarkdownContent,
  type RouteHandler,
  type RequestContext,
} from '@/lib/server-core.ts';
import {
  loadNotes,
  saveNotes,
  createNote,
  updateNote,
  deleteNote,
  addResponse,
  markAddressed,
  markAnchorInvalid,
  getNotesForPage,
  loadVariants,
  saveVariants,
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

const EDITORIAL_CSS_PATH = '/editorial/styles.css';

// ============================================
// HELPERS
// ============================================

async function parseJsonBody<T>(req: Request): Promise<T> {
  const text = await req.text();
  return JSON.parse(text) as T;
}

// ============================================
// EDITORIAL API ROUTES
// ============================================

const editorialApiHandler: RouteHandler = async (req, ctx) => {
  const { pathname, method, url } = ctx;
  
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
    const noteId = pathname.split('/')[4];
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
    const noteId = pathname.split('/')[4];
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
    const noteId = pathname.split('/')[4];
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
      const contentPath = getContentPath(body.pageId);
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
    const pageId = parts[4];
    const variantId = parts[5];
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
    const pageId = parts[4];
    const variantId = parts[5];
    const deleted = await deleteVariant(pageId, variantId);
    if (!deleted) {
      return errorResponse('Variant not found', 404);
    }
    return jsonResponse({ success: true });
  }
  
  // Get base MDX content for a page
  if (pathname.startsWith('/api/editorial/content/') && method === 'GET') {
    const pageId = pathname.split('/').pop()!;
    const contentPath = getContentPath(pageId);
    if (!contentPath || !existsSync(contentPath)) {
      return errorResponse(`Page "${pageId}" not found`, 404);
    }
    const content = readFileSync(contentPath, 'utf-8');
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  
  return null;
};

// ============================================
// EDITORIAL CSS HANDLER
// ============================================

const editorialCssHandler: RouteHandler = async (_req, ctx) => {
  if (ctx.pathname !== EDITORIAL_CSS_PATH) return null;
  
  const file = Bun.file('./src/editorial/styles.css');
  if (await file.exists()) {
    return cssResponse(file);
  }
  return cssResponse('/* Editorial styles not found */');
};

// ============================================
// VARIANT PAGE HANDLER
// ============================================

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
  const { nodeId, variantId, variantTitle, variantSummary, variantLabel, contentHtml, baseMeta, jsPath, cssPath } = options;
  
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

const variantPageHandler: RouteHandler = async (_req, ctx) => {
  const { pathname, nodeId, jsPath } = ctx;
  
  // Check for variant in URL path: /nodeId/variantId
  const pathParts = pathname.slice(1).split('/').filter(Boolean);
  if (pathParts.length < 2) return null;
  
  const baseNodeId = pathParts[0];
  const variantId = pathParts[1];
  
  // Skip if this is an API route
  if (baseNodeId === 'api') return null;
  
  const variants = await loadVariants(baseNodeId);
  const variant = variants?.variants.find(v => v.id === variantId);
  
  if (!variant) return null;
  
  // Extract title and summary from the markdown content
  const titleMatch = variant.content.match(/^#\s+(.+)\n/);
  const variantTitle = titleMatch ? titleMatch[1] : variant.label;
  
  const summaryMatch = variant.content.match(/^#\s+.+\n+\*([^*]+)\*\n/);
  const variantSummary = summaryMatch ? summaryMatch[1] : '';
  
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
};

// ============================================
// CREATE SERVER
// ============================================

const { server, port } = createServer({
  editorialMode: true,
  preRoutes: [editorialApiHandler],
  postRoutes: [editorialCssHandler, variantPageHandler],
});

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
