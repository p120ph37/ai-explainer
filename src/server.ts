/**
 * Development server for the Frontier AI Explainer
 * 
 * Serves the app with:
 * - Server-side rendered (SSR) content for SEO
 * - Clean URLs (/tokens serves tokens content)
 * - Hashed JS bundles (matching production layout)
 * - Per-page HTML identical to production build
 */

import { writeFileSync, unlinkSync } from 'fs';
import { renderMdxContent, getNodeMeta, clearCache } from './lib/ssr.tsx';
import { generateHtml, generateIndexHtml } from './lib/html-template.ts';
import { getAllNodeIds, isValidNode } from './lib/node-metadata.ts';
import mdxPlugin from './plugins/mdx-plugin.ts';

const PID_FILE = '.dev.pid';

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
 * Build and cache the JS bundle
 */
async function getJsBundle(): Promise<{ code: string; hash: string }> {
  // Check if we need to rebuild (simple time-based check)
  const now = Date.now();
  if (jsBundle && (now - jsBundleTime) < 1000) {
    return jsBundle;
  }
  
  // Rebuild
  const result = await Bun.build({
    entrypoints: ['./src/app/main.tsx'],
    outdir: './dist',
    minify: false,
    splitting: false,
    plugins: [mdxPlugin],
    target: 'browser',
    define: {
      'process.env.NODE_ENV': '"development"',
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
  
  console.log(`📦 JS bundle rebuilt: main.${hash}.js`);
  
  return jsBundle;
}

const server = Bun.serve({
  port: 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Serve the compiled JS bundle (matches /main.[hash].js pattern)
    const jsMatch = pathname.match(/^\/main\.([a-f0-9]+)\.js$/);
    if (jsMatch) {
      const bundle = await getJsBundle();
      // Verify hash matches (or serve anyway for dev convenience)
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
        isDev: false,  // Use production-style paths
      });
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Check if it's a valid node
    if (!isValidNode(nodeId)) {
      return new Response('Not found', { status: 404 });
    }
    
    // Render the content node with SSR
    const rendered = await renderMdxContent(nodeId);
    
    if (!rendered) {
      // Node exists but couldn't be rendered - fall back to client-side rendering
      const meta = await getNodeMeta(nodeId);
      const html = generateHtml({
        meta: meta || { id: nodeId, title: nodeId, summary: '' },
        jsPath,
        cssPath: '/styles',
        isDev: false,  // Use production-style paths
      });
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    // Generate HTML with SSR content
    const html = generateHtml({
      meta: rendered.meta,
      contentHtml: rendered.html,
      jsPath,
      cssPath: '/styles',
      isDev: false,  // Use production-style paths
    });
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
  
  // Disable Bun's fancy dev console to avoid terminal clearing/escape codes
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
   - Production-style hashed JS paths
   - Clean URLs (/tokens, /models, etc.)
   
   Press Ctrl+C to stop
`);
