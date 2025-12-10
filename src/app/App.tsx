/**
 * Root application component
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { currentRoute, initRouter, registerNodeId } from './router.ts';
import { toggleTheme, getEffectiveTheme } from './theme.ts';
import { markVisited } from './state.ts';
import { ContentView } from './components/ContentView.tsx';
import { MarginDeoverlap } from './components/MarginDeoverlap.tsx';
import { ProgressSidebar } from './components/ProgressSidebar.tsx';
import { DiscoveryAnimationLayer } from './components/DiscoveryAnimation.tsx';
import { contentRegistry } from '../content/_registry.ts';
import type { ComponentType } from 'preact';

/**
 * Check if editorial mode is enabled (set by editorial server)
 */
function isEditorialMode(): boolean {
  return typeof window !== 'undefined' && (window as any).__EDITORIAL_MODE__ === true;
}

/**
 * Get the page ID for editorial mode
 * For variant URLs (/nodeId/variantId), returns the base nodeId
 */
function getEditorialPageId(): string {
  if (typeof window === 'undefined') return 'intro';
  
  // Parse first path segment as the page ID
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  return pathParts[0] || 'intro';
}

/**
 * Check if viewing an editorial variant page
 * Variant URLs have pattern: /nodeId/variantId
 */
function isViewingEditorialVariant(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isEditorialMode()) return false;
  
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  return pathParts.length > 1;
}

/**
 * Lazy-loaded Editorial Layer component
 * Only loaded when editorial mode is active
 */
function EditorialLayerLoader({ pageId }: { pageId: string }) {
  const EditorialLayer = useSignal<ComponentType<{ pageId: string }> | null>(null);
  
  useEffect(() => {
    if (isEditorialMode()) {
      // Dynamically import editorial client only when needed
      import('../editorial/client/index.ts').then((mod) => {
        EditorialLayer.value = mod.EditorialLayer;
      }).catch((err) => {
        console.error('Failed to load editorial layer:', err);
      });
    }
  }, []);
  
  if (!isEditorialMode() || !EditorialLayer.value) {
    return null;
  }
  
  const Component = EditorialLayer.value;
  return <Component pageId={pageId} />;
}

/**
 * Editorial-only app for variant pages
 * Only renders the editorial UI layer, preserving SSR content
 */
export function EditorialOnlyApp() {
  useEffect(() => {
    // Apply the main visual theme
    document.documentElement.setAttribute('data-visual-theme', 'main');
  }, []);
  
  return (
    <>
      {/* Progress sidebar - still useful for navigation */}
      <ProgressSidebar />
      
      {/* Editorial mode layer */}
      <EditorialLayerLoader pageId={getEditorialPageId()} />
    </>
  );
}

export function App() {
  const theme = useSignal(getEffectiveTheme());
  
  useEffect(() => {
    // Register all known node IDs with the router
    const nodeIds = contentRegistry.getAllIds();
    nodeIds.forEach(registerNodeId);
    
    // Also register special pages
    registerNodeId('index');
    
    // Initialize router
    initRouter();
    
    // Apply the main visual theme
    document.documentElement.setAttribute('data-visual-theme', 'main');
  }, []);
  
  // Mark nodes as visited when viewed
  useEffect(() => {
    const nodeId = currentRoute.value.nodeId;
    markVisited(nodeId);
  }, [currentRoute.value.nodeId]);
  
  const handleThemeToggle = () => {
    toggleTheme();
    theme.value = getEffectiveTheme();
  };
  
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <a href="/" className="app-logo">
            Understanding Frontier AI
          </a>
          
          <button 
            className="theme-toggle" 
            onClick={handleThemeToggle}
            aria-label={`Switch to ${theme.value === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme.value === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {/* For variant pages in editorial mode, don't replace SSR content */}
        {!isViewingEditorialVariant() && <ContentView />}
        <MarginDeoverlap />
      </main>
      
      <footer className="app-footer">
        <div className="content-width">
          <p>
            An open educational resource for understanding how AI actually works.
          </p>
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="/index">Content Index</a>
            <span className="footer-separator">·</span>
            <a href="/intro">Start Here</a>
          </nav>
        </div>
      </footer>
      
      {/* Quest log sidebar */}
      <ProgressSidebar />
      
      {/* Discovery animation overlay */}
      <DiscoveryAnimationLayer />
      
      {/* Editorial mode layer - only loaded when editorial server is running */}
      {/* For variant URLs (/nodeId/variantId), extract the base nodeId */}
      <EditorialLayerLoader pageId={getEditorialPageId()} />
    </div>
  );
}
