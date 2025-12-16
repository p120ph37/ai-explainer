/**
 * Root application component
 * 
 * Works identically on server and client for true SSR hydration.
 * Initial state is passed as props; client-side features activate after hydration.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { currentRoute, initRouter, registerNodeId } from './router.ts';
import { toggleTheme, getEffectiveTheme } from './theme.ts';
import { markVisited } from './state.ts';
import { MarginDeoverlap } from './components/MarginDeoverlap.tsx';
import { ProgressSidebar } from './components/ProgressSidebar.tsx';
import { DiscoveryAnimationLayer } from './components/DiscoveryAnimation.tsx';
import { contentRegistry } from '../lib/content.ts';
import { Breadcrumbs } from './components/Breadcrumbs.tsx';
import { NavLinks } from './components/NavLinks.tsx';
import { PrerequisitesBlock } from './components/PrerequisitesBlock.tsx';
import { MDXProvider } from './components/MDXProvider.tsx';
import { IndexPage } from './components/IndexPage.tsx';
import type { ComponentType } from 'preact';
import type { ContentMeta } from '../lib/content.ts';

// ============================================
// TYPES
// ============================================

export interface AppProps {
  /** Initial node ID to display */
  nodeId: string;
  /** Pre-compiled MDX content component */
  ContentComponent?: ComponentType<any>;
  /** Metadata for the content */
  meta?: ContentMeta;
  /** Initial theme (light/dark) */
  initialTheme?: 'light' | 'dark';
}

const isServer = typeof window === 'undefined';

// ============================================
// EDITORIAL MODE (client-only)
// ============================================

function isEditorialMode(): boolean {
  return !isServer && (window as any).__EDITORIAL_MODE__ === true;
}

function getEditorialPageId(nodeId: string): string {
  return nodeId.split('/')[0] || 'intro';
}

/**
 * Lazy-loaded Editorial Layer - only loaded when editorial mode is active
 */
function EditorialLayerLoader({ pageId }: { pageId: string }) {
  const EditorialLayer = useSignal<ComponentType<{ pageId: string }> | null>(null);
  
  useEffect(() => {
    if (isEditorialMode()) {
      import('../editorial/client/index.ts').then((mod) => {
        EditorialLayer.value = mod.EditorialLayer;
      }).catch((err) => {
        console.error('Failed to load editorial layer:', err);
      });
    }
  }, []);
  
  if (!EditorialLayer.value) return null;
  
  const Component = EditorialLayer.value;
  return <Component pageId={pageId} />;
}

function EditorialBadge({ nodeId }: { nodeId: string }) {
  if (!isEditorialMode()) return null;
  
  const variantId = nodeId.includes('/') ? nodeId.split('/')[1] : null;
  const variantName = variantId
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <div className="editorial-mode-badge">
      📝 EDITORIAL MODE
      {variantName && <span className="editorial-mode-badge__variant">— {variantName}</span>}
    </div>
  );
}

// ============================================
// APP HEADER
// ============================================

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

// ============================================
// CONTENT ARTICLE
// ============================================

function ContentArticle({ 
  nodeId, 
  meta, 
  ContentComponent 
}: { 
  nodeId: string; 
  meta: ContentMeta; 
  ContentComponent: ComponentType<any>;
}) {
  const hasPrerequisites = meta.prerequisites && meta.prerequisites.length > 0;
  
  return (
    <article className="content-node" data-node-id={nodeId}>
      <Breadcrumbs path={nodeId.split('/').filter(Boolean)} />
      
      <header className="content-node__header">
        <h1 className="content-node__title">{meta.title}</h1>
        {meta.summary && (
          <p className="content-node__summary">{meta.summary}</p>
        )}
      </header>
      
      {hasPrerequisites && (
        <PrerequisitesBlock prerequisites={meta.prerequisites!} />
      )}
      
      <div className="content-node__body">
        <MDXProvider>
          <ContentComponent />
        </MDXProvider>
      </div>
      
      <NavLinks children={meta.children} related={meta.related} />
    </article>
  );
}

// ============================================
// APP FOOTER
// ============================================

function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="content-width">
        <p>An open educational resource for understanding how AI actually works.</p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="/index">Content Index</a>
          <span className="footer-separator">·</span>
          <a href="/intro">Start Here</a>
        </nav>
      </div>
    </footer>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

export function App({ 
  nodeId, 
  ContentComponent, 
  meta,
  initialTheme = 'light',
}: AppProps) {
  const theme = useSignal(initialTheme);
  
  // Client-side initialization (runs after hydration)
  useEffect(() => {
    // Set the current route signal to match SSR
    currentRoute.value = { nodeId, path: nodeId.split('/').filter(Boolean) };
    
    // Register all known node IDs with the router
    const nodeIds = contentRegistry.getAllIds();
    nodeIds.forEach(registerNodeId);
    registerNodeId('index');
    
    // Initialize router for navigation
    initRouter();
    
    // Apply the main visual theme
    document.documentElement.setAttribute('data-visual-theme', 'main');
    
    // Sync theme with actual persisted value
    theme.value = getEffectiveTheme();
    
    // Mark initial node as visited
    markVisited(nodeId);
  }, []);
  
  const handleThemeToggle = () => {
    if (isServer) return;
    toggleTheme();
    theme.value = getEffectiveTheme();
  };
  
  // Render content based on nodeId
  const renderContent = () => {
    if (nodeId === 'index') {
      return <IndexPage />;
    }
    
    if (ContentComponent && meta) {
      return (
        <ContentArticle 
          nodeId={nodeId} 
          meta={meta} 
          ContentComponent={ContentComponent} 
        />
      );
    }
    
    return (
      <div className="content-node">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="app-shell">
      {/* Editorial badge - client-only, renders null on server */}
      <EditorialBadge nodeId={nodeId} />
      
      <AppHeader theme={theme.value} onThemeToggle={handleThemeToggle} />
      
      <main className="app-main">
        {renderContent()}
        <MarginDeoverlap />
      </main>
      
      <AppFooter />
      
      <ProgressSidebar />
      <DiscoveryAnimationLayer />
      
      {/* Editorial layer - client-only, lazy-loaded */}
      {isEditorialMode() && <EditorialLayerLoader pageId={getEditorialPageId(nodeId)} />}
    </div>
  );
}
