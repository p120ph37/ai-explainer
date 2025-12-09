/**
 * Development server for the Frontier AI Explainer
 * 
 * Uses Bun.serve with HTML imports. MDX plugin is configured via bunfig.toml.
 * Writes PID to .dev.pid for clean process management.
 */

import { writeFileSync, unlinkSync, existsSync } from "fs";
import index from "./index.html" with { type: "html" };

const PID_FILE = ".dev.pid";

// Write PID file for process management
writeFileSync(PID_FILE, process.pid.toString());

// Clean up PID file on exit
function cleanup() {
  try {
    if (existsSync(PID_FILE)) {
      unlinkSync(PID_FILE);
    }
  } catch {
    // Ignore errors during cleanup
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

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
   PID: ${process.pid} (saved to ${PID_FILE})

   Press Ctrl+C to stop
`);
