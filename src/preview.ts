/**
 * Preview server for built output
 * 
 * Serves the dist/ directory to test production build locally.
 */

const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html for SPA routing
    if (path === "/" || !path.includes(".")) {
      path = "/index.html";
    }
    
    const file = Bun.file(`dist${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Fallback to index.html for client-side routing
    return new Response(Bun.file("dist/index.html"));
  },
});

console.log(`
🧠 Frontier AI Explainer (Preview)
   Serving built output at http://localhost:${server.port}

   Press Ctrl+C to stop
`);



