/**
 * Development server for the Frontier AI Explainer
 * 
 * Serves the app with:
 * - Server-side rendered (SSR) content for SEO
 * - Clean URLs (/tokens serves tokens content)
 * - Hashed JS bundles (matching production layout)
 * - File-based routing (src/content/{id}.mdx → /{id})
 * - Hot reload support
 */

import { writeFileSync, unlinkSync } from 'fs';
import { renderAppToString, getNodeMeta, clearCache } from './lib/ssr.tsx';
import { generateHtml, generateIndexHtml, contentHash } from './lib/html-template.ts';
import { discoverContent, contentExists, clearContentCache } from './lib/content.ts';
import mdxPlugin from './plugins/mdx-plugin.ts';
import griffelPlugin from './plugins/griffel-plugin.ts';

const PID_FILE = '.dev.pid';

// Write PID to file on startup
try {
  writeFileSync(PID_FILE, process.pid.toString());
} catch (error) {
  console.error(`Failed to write PID file: ${error}`);
}

// JS bundle state
// Bundle cache: maps filename to code
let bundleCache: Map<string, string> = new Map();
let mainBundleHash = '';
let bundleTime = 0;

/**
 * Build and cache all JS bundles (main + chunks)
 */
async function buildBundles(): Promise<string> {
  const now = Date.now();
  if (bundleCache.size > 0 && (now - bundleTime) < 1000) {
    return mainBundleHash;
  }
  
  const result = await Bun.build({
    entrypoints: ['./src/app/main.tsx'],
    outdir: './dist',
    minify: false,
    splitting: false,
    plugins: [griffelPlugin, mdxPlugin],
    target: 'browser',
    define: {
      'process.env.NODE_ENV': '"development"',
    },
  });
  
  if (!result.success) {
    console.error('JS build failed:', result.logs);
    return 'error';
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
  console.log(`📦 JS bundles rebuilt: ${result.outputs.length} files, main.${mainBundleHash}.js`);
  
  return mainBundleHash;
}

/**
 * Get a bundle file by name
 */
async function getBundle(filename: string): Promise<string | null> {
  await buildBundles();
  return bundleCache.get(filename) || null;
}

const server = Bun.serve({
  port: 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Serve JS bundles (main and chunks)
    if (pathname.endsWith('.js')) {
      const filename = pathname.slice(1); // Remove leading /
      
      // For main bundle with hash, strip the hash
      const mainMatch = pathname.match(/^\/main\.([a-f0-9]+)\.js$/);
      const lookupName = mainMatch ? 'main.js' : filename;
      
      const code = await getBundle(lookupName);
      if (code) {
        return new Response(code, {
          headers: { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache',
          },
        });
      }
      
      // Try direct lookup for chunk files
      const chunkCode = await getBundle(filename);
      if (chunkCode) {
        return new Response(chunkCode, {
          headers: { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache',
          },
        });
      }
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
    const hash = await buildBundles();
    const jsPath = `/main.${hash}.js`;
    
    // Discover all content for client-side navigation
    const allContent = await discoverContent();
    const allContentMeta: Record<string, any> = {};
    const allContentIds: string[] = [];
    for (const c of allContent) {
      allContentMeta[c.id] = c.meta;
      allContentIds.push(c.id);
    }
    
    // Handle content routes
    const nodeId = pathname === '/' ? 'intro' : pathname.slice(1).split('/')[0];
    
    // Special case: index page
    if (nodeId === 'index') {
      const html = generateIndexHtml({
        nodes: allContent.map(c => c.meta),
        jsPath,
        cssPath: '/styles',
        isDev: false,
        allContentMeta,
        allContentIds,
      });
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Check if it's a valid content file
    if (!(await contentExists(nodeId))) {
      return new Response('Not found', { status: 404 });
    }
    
    // Render the full app with SSR
    const rendered = await renderAppToString(nodeId);
    
    if (!rendered) {
      // Node exists but couldn't be rendered - fall back to client-side rendering
      const meta = await getNodeMeta(nodeId);
      const html = generateHtml({
        meta: meta || { id: nodeId, title: nodeId, summary: '' },
        jsPath,
        cssPath: '/styles',
        isDev: false,
        allContentMeta,
        allContentIds,
      });
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Generate HTML with SSR content
    const html = generateHtml({
      meta: rendered.meta,
      contentHtml: rendered.html,
      ssrStyleElements: rendered.styleElements,
      jsPath,
      cssPath: '/styles',
      isDev: false,
      allContentMeta,
      allContentIds,
    });
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
  
  development: false,
});

// Clean up PID file on exit
process.on('exit', () => {
  try {
    unlinkSync(PID_FILE);
  } catch (error) {
    // Ignore errors
  }
});

// Handle termination signals
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

console.log(`
🧠 Frontier AI Explainer
   Development server running at http://localhost:${server.port}
   PID: ${process.pid} (saved to ${PID_FILE})
   
   Features:
   - Server-side rendered content (SSR)
   - File-based routing (src/content/{id}.mdx)
   - Clean URLs (/tokens, /models, etc.)
   
   Press Ctrl+C to stop
`);
