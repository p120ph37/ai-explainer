/**
 * Content view component
 * 
 * Dynamically loads and renders content nodes based on the current route.
 * Also handles special routes like the index page.
 * Includes prerequisites display and scroll completion tracking.
 * 
 * Supports both base pages (/tokens) and variants (/tokens/metaphor-voice).
 */

import { useSignal, useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { currentRoute, navigateTo } from '../router.ts';
import { 
  getNodeOrVariant, 
  getNodeOrVariantMeta, 
  isVariantId,
  parseVariantId,
  type VariantMeta,
} from '../../lib/content.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';
import { NavLinks } from './NavLinks.tsx';
import { IndexPage } from './IndexPage.tsx';
import { PrerequisitesBlock } from './PrerequisitesBlock.tsx';
import { useExplorationTracking } from '../hooks/useExplorationTracking.ts';
import { MDXProvider } from './MDXProvider.tsx';
import type { ComponentType } from 'preact';
import type { ContentMeta } from '../../lib/content.ts';

interface ContentModule {
  default: ComponentType;
  meta: {
    id: string;
    title: string;
    summary: string;
    prerequisites?: string[];
    children?: string[];
    related?: string[];
  };
}

/**
 * Check if metadata is for a variant
 */
function isVariantMeta(meta: ContentMeta | VariantMeta | undefined): meta is VariantMeta {
  return meta !== undefined && 'isVariant' in meta && meta.isVariant === true;
}

// Check if SSR content exists for this node
function hasSSRContent(): boolean {
  if (typeof window === 'undefined') return false;
  const ssrShell = document.querySelector('.ssr-shell');
  return ssrShell !== null;
}

export function ContentView() {
  const nodeId = useComputed(() => currentRoute.value.nodeId);
  // Don't show loading if SSR content exists
  const loading = useSignal(!hasSSRContent());
  const error = useSignal<string | null>(null);
  const Content = useSignal<ComponentType | null>(null);
  const meta = useSignal<ContentModule['meta'] | null>(null);
  
  // Handle special routes
  if (nodeId.value === 'index') {
    return <IndexPage />;
  }
  
  // Check if nodeId is an in-page anchor (like ref-1, fn-1) - these shouldn't trigger content loading
  const isInPageAnchor = (id: string) => id.startsWith('ref-') || id.startsWith('fn-');
  
  useEffect(() => {
    let cancelled = false;
    
    async function loadContent() {
      // Skip in-page anchors
      if (isInPageAnchor(nodeId.value)) {
        return;
      }
      
      loading.value = true;
      error.value = null;
      
      try {
        // Use unified loader that handles both base pages and variants
        const module = await getNodeOrVariant(nodeId.value);
        
        if (cancelled) return;
        
        if (module) {
          Content.value = module.default;
          // For variants, construct a compatible meta object
          const nodeMeta = getNodeOrVariantMeta(nodeId.value);
          if (isVariantMeta(nodeMeta)) {
            // Variant: use variant metadata
            meta.value = {
              id: nodeMeta.id,
              title: nodeMeta.title,
              summary: nodeMeta.summary,
              // Variants don't have children/related/prerequisites
            };
          } else {
            meta.value = module.meta;
          }
        } else {
          error.value = `Content node "${nodeId.value}" not found`;
          Content.value = null;
          meta.value = null;
        }
      } catch (err) {
        if (cancelled) return;
        error.value = `Failed to load content: ${err}`;
        Content.value = null;
        meta.value = null;
      } finally {
        if (!cancelled) {
          loading.value = false;
        }
      }
    }
    
    loadContent();
    
    return () => {
      cancelled = true;
    };
  }, [nodeId.value]);
  
  if (loading.value) {
    return (
      <div className="content-node">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error.value) {
    return (
      <div className="content-node">
        <div className="error-state">
          <h2>Oops!</h2>
          <p>{error.value}</p>
          <button onClick={() => navigateTo('intro')}>
            Go to Introduction
          </button>
        </div>
      </div>
    );
  }
  
  const ContentComponent = Content.value;
  const nodeMeta = meta.value;
  
  if (!ContentComponent || !nodeMeta) {
    return null;
  }
  
  return (
    <ContentRenderer 
      nodeId={nodeId.value}
      nodeMeta={nodeMeta}
      ContentComponent={ContentComponent}
      path={currentRoute.value.path}
    />
  );
}

/**
 * ContentBody handles the actual content rendering with SSR preservation
 */
function ContentBody({ 
  ContentComponent, 
  nodeId 
}: { 
  ContentComponent: ComponentType; 
  nodeId: string;
}) {
  // Check if we have SSR content and if this is the initial page
  if (typeof window !== 'undefined') {
    const app = document.getElementById('app');
    const initialNodeId = app?.dataset.initialNode;
    
    // If this is the initial SSR page, preserve the SSR content
    if (initialNodeId === nodeId) {
      const ssrBody = document.querySelector('.content-node--ssr .content-node__body');
      if (ssrBody) {
        // Preserve SSR content using dangerouslySetInnerHTML
        return (
          <div 
            className="content-node__body"
            dangerouslySetInnerHTML={{ __html: ssrBody.innerHTML }}
          />
        );
      }
    }
  }
  
  // For navigation or when SSR content not available, render component
  return (
    <div className="content-node__body">
      <MDXProvider>
        <ContentComponent />
      </MDXProvider>
    </div>
  );
}

/**
 * Inner component to use hooks properly (after conditional checks)
 */
function ContentRenderer({
  nodeId,
  nodeMeta,
  ContentComponent,
  path,
}: {
  nodeId: string;
  nodeMeta: ContentModule['meta'];
  ContentComponent: ComponentType;
  path: string[];
}) {
  // Track exploration progress (scroll position, expandables)
  // For variants, track the base page
  const trackingId = isVariantId(nodeId) ? parseVariantId(nodeId)?.basePageId || nodeId : nodeId;
  useExplorationTracking({ nodeId: trackingId });
  
  const hasPrerequisites = nodeMeta.prerequisites && nodeMeta.prerequisites.length > 0;
  const isVariant = isVariantId(nodeId);
  const variantInfo = isVariant ? parseVariantId(nodeId) : null;
  
  return (
    <article 
      className={`content-node ${isVariant ? 'variant-content' : ''}`} 
      data-node-id={nodeId}
      data-variant-id={variantInfo?.variantId}
    >
      <Breadcrumbs path={path} />
      
      <header className="content-node__header">
        <h1 className="content-node__title">{nodeMeta.title}</h1>
        {nodeMeta.summary && (
          <p className="content-node__summary">{nodeMeta.summary}</p>
        )}
      </header>
      
      {hasPrerequisites && (
        <PrerequisitesBlock prerequisites={nodeMeta.prerequisites!} />
      )}
      
      <ContentBody ContentComponent={ContentComponent} nodeId={nodeId} />
      
      {/* Only show nav links for base pages, not variants */}
      {!isVariant && (
        <NavLinks 
          children={nodeMeta.children}
          related={nodeMeta.related}
        />
      )}
    </article>
  );
}

