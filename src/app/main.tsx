/**
 * Application entry point
 * 
 * Bootstraps the app, initializes routing, and renders the shell.
 */

import { render, hydrate } from 'preact';
import { App, EditorialOnlyApp } from './App.tsx';
import { initializeTheme } from './theme.ts';

// Initialize theme before rendering to avoid flash
initializeTheme();

/**
 * Check if viewing an editorial variant page
 * Variant pages have URL pattern: /nodeId/variantId
 */
function isEditorialVariantPage(): boolean {
  const isEditorial = (window as any).__EDITORIAL_MODE__ === true;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  return isEditorial && pathParts.length > 1;
}

// Mount the app
const appRoot = document.getElementById('app');
if (appRoot) {
  if (isEditorialVariantPage()) {
    // For variant pages, only mount editorial UI without replacing content
    // Find or create a container for editorial-only components
    let editorialRoot = document.getElementById('editorial-root');
    if (!editorialRoot) {
      editorialRoot = document.createElement('div');
      editorialRoot.id = 'editorial-root';
      document.body.appendChild(editorialRoot);
    }
    render(<EditorialOnlyApp />, editorialRoot);
  } else {
    // Normal page - render the full app
    render(<App />, appRoot);
  }
}

// Remove loading state
document.querySelector('.loading-state')?.remove();


