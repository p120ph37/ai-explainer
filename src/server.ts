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

import { createServer } from '@/lib/server-core.ts';

const { server, port } = createServer();

console.log(`
🧠 Frontier AI Explainer
   Development server running at http://localhost:${port}
   PID: ${process.pid} (saved to .dev.pid)
   
   Features:
   - Server-side rendered content (SSR)
   - File-based routing (src/content/{id}.mdx)
   - Clean URLs (/tokens, /models, etc.)
   
   Press Ctrl+C to stop
`);
