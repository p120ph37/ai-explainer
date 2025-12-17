/**
 * Application Entry Point - SSR Hydration + SPA Navigation
 * 
 * Flow:
 * 1. Initial page load: SSR renders HTML → JS hydrates → Page becomes interactive
 * 2. SPA navigation: User clicks link → Router intercepts → Load MDX → Re-render
 * 
 * This provides:
 * - Fast initial load (SSR HTML visible immediately)
 * - SEO (search engines see full content)
 * - Deep linking (each URL serves complete page)
 * - Fast navigation (no full page reload after initial load)
 */

import { hydrate, render } from 'preact';
import { effect } from '@preact/signals';
import { App } from '@/app/App.tsx';
import { initializeTheme, getEffectiveTheme } from '@/app/theme.ts';
import { getNodeMeta, type ContentMeta } from '@/lib/content.ts';
import { currentRoute, initRouter, registerNodeId } from '@/app/router.ts';
import { initPageState } from '@/app/page-state.ts';
import { MDXProvider } from '@/app/components/MDXProvider.tsx';

// Dynamic content modules - generated at build time by content-plugin
// @ts-ignore - virtual module
import { contentModules, contentIds } from 'virtual:content-modules';

import type { ComponentType } from 'preact';

// Initialize theme before render to prevent flash
initializeTheme();

// ============================================
// CONTENT LOADING
// ============================================

/**
 * Load an MDX content component by node ID
 * Handles both base pages (e.g., "intro") and variants (e.g., "intro/research")
 */
async function loadContent(nodeId: string): Promise<{
  ContentComponent: ComponentType<any>;
  meta: ContentMeta;
} | null> {
  // Handle special pages
  if (nodeId === 'index') {
    return {
      ContentComponent: () => null, // IndexPage is rendered by App
      meta: { id: 'index', title: 'Content Index', summary: 'Browse all topics' },
    };
  }
  
  // Try to load the exact nodeId first (works for both base pages and variants)
  let loader = contentModules[nodeId];
  
  if (!loader) {
    console.warn(`No content module found for: ${nodeId}`);
    return null;
  }
  
  try {
    const module = await loader();
    const MdxContent = module.default;
    
    // Wrap MDX in provider for component resolution
    const ContentComponent = () => (
      <MDXProvider>
        <MdxContent />
      </MDXProvider>
    );
    
    // Get metadata
    const meta = getNodeMeta(nodeId) || module.meta || { id: nodeId, title: nodeId, summary: '' };
    
    return { ContentComponent, meta };
  } catch (error) {
    console.error(`Failed to load content for ${nodeId}:`, error);
    return null;
  }
}

// ============================================
// RENDERING
// ============================================

let appRoot: HTMLElement | null = null;
let isInitialHydration = true;
let currentlyRenderedNodeId: string | null = null;

/**
 * Render the app with given content
 */
async function renderApp(nodeId: string) {
  if (!appRoot) return;
  
  const content = await loadContent(nodeId);
  
  if (!content) {
    console.error(`Failed to load content for: ${nodeId}`);
    // Could show error page here
    return;
  }
  
  const theme = getEffectiveTheme();
  
  const app = (
    <App
      nodeId={nodeId}
      ContentComponent={content.ContentComponent}
      meta={content.meta}
      initialTheme={theme}
    />
  );
  
  if (isInitialHydration) {
    // First render: hydrate SSR content
    hydrate(app, appRoot);
    isInitialHydration = false;
    currentlyRenderedNodeId = nodeId;
    console.log(`✅ Hydrated: /${nodeId}`);
  } else {
    // SPA navigation: re-render with new content
    render(app, appRoot);
    currentlyRenderedNodeId = nodeId;
    console.log(`✅ Navigated: /${nodeId}`);
  }
}

// ============================================
// INITIALIZATION
// ============================================

async function initApp() {
  appRoot = document.getElementById('app');
  if (!appRoot) {
    console.error('App root element not found');
    return;
  }
  
  // Register all content IDs with router for internal link detection
  contentIds.forEach((id: string) => registerNodeId(id));
  registerNodeId('index');
  
  // Get initial node ID from SSR data attribute
  const initialNodeId = appRoot.dataset.initialNode || 'intro';
  
  // Initial hydration
  await renderApp(initialNodeId);
  
  // Initialize router (sets up link interception, history handling)
  initRouter();
  
  // Initialize page state management (beforeunload handler for scroll position)
  initPageState();
  
  // Watch for route changes and re-render
  effect(() => {
    const nodeId = currentRoute.value.nodeId;
    
    // Skip if already showing this content (prevents double-render)
    if (nodeId === currentlyRenderedNodeId) return;
    
    // Re-render with new content
    renderApp(nodeId);
  });
}

// Start the app
initApp();
