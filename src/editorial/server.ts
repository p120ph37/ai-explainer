/**
 * Editorial mode server
 * 
 * This server extends the base dev server with editorial features.
 * Run with: bun src/editorial/server.ts
 * 
 * Editorial features are ONLY available through this entry point.
 * The standard server (src/server.ts) and production build have
 * no editorial code whatsoever.
 */

import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { renderMdxContent, getNodeMeta, clearCache } from '../lib/ssr.tsx';
import { generateHtml, generateIndexHtml } from '../lib/html-template.ts';
import { getAllNodeIds, isValidNode, getContentPath } from '../lib/node-metadata.ts';
import mdxPlugin from '../plugins/mdx-plugin.ts';
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
} from './persistence.ts';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  AddResponseRequest,
  CreateVariantRequest,
} from './_types.ts';

const PID_FILE = '.dev.pid';
const EDITORIAL_CSS_PATH = '/editorial/styles.css';

// Write PID to file on startup
try {
  writeFileSync(PID_FILE, process.pid.toString());
} catch (error) {
  console.error(`Failed to write PID file: ${error}`);
}

// JS bundle state
let jsBundle: { code: string; hash: string } | null = null;
let jsBundleTime = 0;

/**
 * Generate a short hash from content
 */
function contentHash(content: string): string {
  const hasher = new Bun.CryptoHasher('md5');
  hasher.update(content);
  return hasher.digest('hex').slice(0, 8);
}

/**
 * Build and cache the JS bundle (with editorial mode flag)
 */
async function getJsBundle(): Promise<{ code: string; hash: string }> {
  const now = Date.now();
  if (jsBundle && (now - jsBundleTime) < 1000) {
    return jsBundle;
  }
  
  const result = await Bun.build({
    entrypoints: ['./src/app/main.tsx'],
    outdir: './dist',
    minify: false,
    splitting: false,
    plugins: [mdxPlugin],
    target: 'browser',
    define: {
      'process.env.NODE_ENV': '"development"',
      // This flag enables editorial mode in the frontend
      'process.env.EDITORIAL_MODE': 'true',
    },
  });
  
  if (!result.success) {
    console.error('JS build failed:', result.logs);
    const fallback = '// Build failed\nconsole.error("JS build failed");';
    return { code: fallback, hash: 'error' };
  }
  
  const output = result.outputs.find(o => o.path.endsWith('.js'));
  if (!output) {
    const fallback = '// No output found';
    return { code: fallback, hash: 'empty' };
  }
  
  const code = await output.text();
  const hash = contentHash(code);
  
  jsBundle = { code, hash };
  jsBundleTime = now;
  
  console.log(`📦 JS bundle rebuilt: main.${hash}.js (editorial mode)`);
  
  return jsBundle;
}

/**
 * Generate HTML with editorial mode enabled
 */
function generateEditorialHtml(options: {
  meta: { id: string; title: string; summary: string };
  contentHtml?: string;
  jsPath: string;
  cssPath: string;
}): string {
  // Get base HTML and inject editorial assets
  const baseHtml = generateHtml({
    ...options,
    isDev: false,
  });
  
  // Inject editorial CSS and mode flag before </head>
  const editorialAssets = `
    <link rel="stylesheet" href="${EDITORIAL_CSS_PATH}">
    <script>window.__EDITORIAL_MODE__ = true;</script>
  `;
  
  return baseHtml.replace('</head>', `${editorialAssets}</head>`);
}

/**
 * Parse JSON body from request
 */
async function parseJsonBody<T>(req: Request): Promise<T> {
  const text = await req.text();
  return JSON.parse(text) as T;
}

/**
 * JSON response helper
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Error response helper
 */
function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

const server = Bun.serve({
  port: 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;
    
    // ========================================
    // EDITORIAL API ROUTES
    // ========================================
    
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
    
    // ========================================
    // EDITORIAL CSS
    // ========================================
    
    if (pathname === EDITORIAL_CSS_PATH) {
      const file = Bun.file('./src/editorial/styles.css');
      if (await file.exists()) {
        return new Response(file, {
          headers: { 'Content-Type': 'text/css' },
        });
      }
      return new Response('/* Editorial styles not found */', {
        headers: { 'Content-Type': 'text/css' },
      });
    }
    
    // ========================================
    // STANDARD DEV SERVER ROUTES
    // ========================================
    
    // Serve the compiled JS bundle
    const jsMatch = pathname.match(/^\/main\.([a-f0-9]+)\.js$/);
    if (jsMatch) {
      const bundle = await getJsBundle();
      return new Response(bundle.code, {
        headers: { 
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    // Serve static CSS files
    if (pathname.startsWith('/styles/')) {
      const file = Bun.file(`src${pathname}`);
      if (await file.exists()) {
        return new Response(file, {
          headers: { 'Content-Type': 'text/css' },
        });
      }
      return new Response('Not found', { status: 404 });
    }
    
    // Get current JS bundle hash for HTML generation
    const bundle = await getJsBundle();
    const jsPath = `/main.${bundle.hash}.js`;
    
    // Handle content routes
    const nodeId = pathname === '/' ? 'intro' : pathname.slice(1).split('/')[0];
    
    // Special case: index page
    if (nodeId === 'index') {
      const allMetas = await Promise.all(
        getAllNodeIds().map(id => getNodeMeta(id))
      );
      const validMetas = allMetas.filter(Boolean) as NonNullable<typeof allMetas[0]>[];
      
      const html = generateIndexHtml({
        nodes: validMetas,
        jsPath,
        cssPath: '/styles',
        isDev: false,
      });
      
      // Inject editorial mode
      const editorialHtml = html.replace('</head>', `
        <link rel="stylesheet" href="${EDITORIAL_CSS_PATH}">
        <script>window.__EDITORIAL_MODE__ = true;</script>
      </head>`);
      
      return new Response(editorialHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Check if it's a valid node
    if (!isValidNode(nodeId)) {
      return new Response('Not found', { status: 404 });
    }
    
    // Check for variant parameter
    const variantId = url.searchParams.get('variant');
    
    // If viewing a variant, render variant content instead
    if (variantId) {
      const variants = await loadVariants(nodeId);
      const variant = variants?.variants.find(v => v.id === variantId);
      
      if (variant) {
        // TODO: Render variant content (requires MDX compilation)
        // For now, show a placeholder
        const meta = await getNodeMeta(nodeId);
        const html = generateEditorialHtml({
          meta: meta || { id: nodeId, title: `${nodeId} (variant: ${variantId})`, summary: '' },
          contentHtml: `<div class="variant-content"><p>Variant: ${variantId}</p><pre>${variant.content.slice(0, 500)}...</pre></div>`,
          jsPath,
          cssPath: '/styles',
        });
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }
    
    // Render the content node with SSR
    const rendered = await renderMdxContent(nodeId);
    
    if (!rendered) {
      const meta = await getNodeMeta(nodeId);
      const html = generateEditorialHtml({
        meta: meta || { id: nodeId, title: nodeId, summary: '' },
        jsPath,
        cssPath: '/styles',
      });
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Generate HTML with SSR content and editorial mode
    const html = generateEditorialHtml({
      meta: rendered.meta,
      contentHtml: rendered.html,
      jsPath,
      cssPath: '/styles',
    });
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
  
  development: {
    console: true,
  },
});

// Clean up PID file on exit
process.on('exit', () => {
  try {
    unlinkSync(PID_FILE);
  } catch (error) {
    // Ignore errors
  }
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

console.log(`
📝 Frontier AI Explainer - EDITORIAL MODE
   Server running at http://localhost:${server.port}
   PID: ${process.pid} (saved to ${PID_FILE})
   
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

