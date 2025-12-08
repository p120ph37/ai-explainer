/**
 * Development server for the Frontier AI Explainer
 * 
 * Uses Bun.serve with HTML imports. MDX plugin is configured via bunfig.toml.
 */

import index from "./index.html" with { type: "html" };

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/*": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`
🧠 Frontier AI Explainer
   Development server running at http://localhost:${server.port}

   Press Ctrl+C to stop
`);
