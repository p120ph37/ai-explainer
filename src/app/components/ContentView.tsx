/**
 * Content view component
 * 
 * Dynamically loads and renders content nodes based on the current route.
 * Also handles special routes like the index page.
 */

import { useSignal, useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { currentRoute, navigateTo } from '../router.ts';
import { contentRegistry, getNode, getNodeMeta } from '../../content/_registry.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';
import { NavLinks } from './NavLinks.tsx';
import { IndexPage } from './IndexPage.tsx';
import type { ComponentType } from 'preact';

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

export function ContentView() {
  const nodeId = useComputed(() => currentRoute.value.nodeId);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const Content = useSignal<ComponentType | null>(null);
  const meta = useSignal<ContentModule['meta'] | null>(null);
  
  // Handle special routes
  if (nodeId.value === 'index') {
    return <IndexPage />;
  }
  
  useEffect(() => {
    let cancelled = false;
    
    async function loadContent() {
      loading.value = true;
      error.value = null;
      
      try {
        const module = await getNode(nodeId.value);
        
        if (cancelled) return;
        
        if (module) {
          Content.value = module.default;
          meta.value = module.meta;
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
    <article className="content-node">
      <Breadcrumbs path={currentRoute.value.path} />
      
      <header className="content-node__header">
        <h1 className="content-node__title">{nodeMeta.title}</h1>
        <p className="content-node__summary">{nodeMeta.summary}</p>
      </header>
      
      <div className="content-node__body">
        <ContentComponent />
      </div>
      
      <NavLinks 
        children={nodeMeta.children}
        related={nodeMeta.related}
      />
    </article>
  );
}

