/**
 * Application entry point
 * 
 * Bootstraps the app, initializes routing, and renders the shell.
 * 
 * In editorial mode, variants are first-class content nodes that are
 * rendered the same way as base pages (via ContentView).
 */

import { render } from 'preact';
import { App } from './App.tsx';
import { initializeTheme } from './theme.ts';
import { initializeVariants, getAllVariantIds } from '../content/_registry.ts';
import { registerNodeId } from './router.ts';

// Initialize theme before rendering to avoid flash
initializeTheme();

/**
 * Check if in editorial mode
 */
function isEditorialMode(): boolean {
  return (window as any).__EDITORIAL_MODE__ === true;
}

/**
 * Initialize and mount the app
 */
async function initApp() {
  const appRoot = document.getElementById('app');
  if (!appRoot) return;
  
  // In editorial mode, initialize variants so they can be navigated to
  if (isEditorialMode()) {
    await initializeVariants();
    
    // Register variant IDs with the router
    const variantIds = getAllVariantIds();
    for (const id of variantIds) {
      registerNodeId(id);
    }
  }
  
  // Render the app - unified for both base pages and variants
  render(<App />, appRoot);
  
  // Remove loading state
  document.querySelector('.loading-state')?.remove();
}

// Initialize
initApp();


