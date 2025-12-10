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
 * Get the current variant name from URL path
 * Returns null if viewing base content
 */
function getCurrentVariantName(): string | null {
  if (typeof window === 'undefined') return null;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length <= 1) return null;
  
  // Convert kebab-case to Title Case (e.g., "metaphor-voice" -> "Metaphor Voice")
  return pathParts[1]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Editorial mode badge component
 * Shows "EDITORIAL MODE" and optionally the variant name
 */
function EditorialBadge({ variantName }: { variantName?: string | null }) {
  if (!isEditorialMode()) return null;
  
  return (
    <div className="editorial-mode-badge">
      📝 EDITORIAL MODE
      {variantName && (
        <span className="editorial-mode-badge__variant">— {variantName}</span>
      )}
    </div>
  );
}

/**
 * Shared app header component
 */
function AppHeader({ theme, onThemeToggle }: { theme: string; onThemeToggle: () => void }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a href="/" className="app-logo">
          Understanding Frontier AI
        </a>
        
        <button 
          className="theme-toggle" 
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

/**
 * Editorial-only app for variant pages
 * Renders overlay components only, keeping SSR content intact
 */
export function EditorialOnlyApp() {
  const theme = useSignal(getEffectiveTheme());
  const variantName = getCurrentVariantName();
  
  useEffect(() => {
    // Apply the main visual theme
    document.documentElement.setAttribute('data-visual-theme', 'main');
    
    // Inject theme toggle into the existing SSR header
    const headerInner = document.querySelector('.app-header__inner');
    if (headerInner && !headerInner.querySelector('.theme-toggle')) {
      const toggle = document.createElement('button');
      toggle.className = 'theme-toggle';
      toggle.setAttribute('aria-label', `Switch to ${getEffectiveTheme() === 'light' ? 'dark' : 'light'} theme`);
      toggle.textContent = getEffectiveTheme() === 'light' ? '🌙' : '☀️';
      toggle.addEventListener('click', () => {
        toggleTheme();
        const newTheme = getEffectiveTheme();
        toggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        toggle.setAttribute('aria-label', `Switch to ${newTheme === 'light' ? 'dark' : 'light'} theme`);
      });
      headerInner.appendChild(toggle);
    }
  }, []);
  
  return (
    <>
      {/* Editorial badge with variant name */}
      <EditorialBadge variantName={variantName} />
      
      {/* Quest log sidebar */}
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
      <EditorialBadge variantName={null} />
      
      <AppHeader theme={theme.value} onThemeToggle={handleThemeToggle} />
      
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
