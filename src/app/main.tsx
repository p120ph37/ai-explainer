/**
 * Application entry point
 * 
 * Bootstraps the app, initializes routing, and renders the shell.
 */

import { render } from 'preact';
import { App } from './App.tsx';
import { initializeTheme } from './theme.ts';

// Initialize theme before rendering to avoid flash
initializeTheme();

// Mount the app
const appRoot = document.getElementById('app');
if (appRoot) {
  render(<App />, appRoot);
}

// Remove loading state
document.querySelector('.loading-state')?.remove();

