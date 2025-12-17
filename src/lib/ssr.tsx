/**
 * Server-Side Rendering
 * 
 * Renders the full App component to HTML for SEO and fast initial paint.
 * The same component tree is hydrated on the client.
 * 
 * MDX files are imported directly using Bun's preload plugin (src/plugins/preload.ts)
 * which registers @mdx-js/esbuild for runtime transpilation.
 * 
 * Uses @griffel/react's RendererProvider for CSS-in-JS SSR support.
 */

import * as preact from 'preact';
import { h } from 'preact';
import renderToString from 'preact-render-to-string';
import { type ContentMeta, specialPages } from '@/lib/content.ts';
import { App } from '@/app/App.tsx';

// Griffel SSR imports
import { createDOMRenderer, renderToStyleElements, RendererProvider } from '@griffel/react';

// Cache imported modules
const moduleCache = new Map<string, { default: any; meta: ContentMeta }>();

/**
 * Load an MDX module via dynamic import
 * Bun's preload plugin handles the MDX transpilation
 */
export async function loadMdxModule(nodeId: string, contentDir: string = 'src/content'): Promise<{ default: any; meta: ContentMeta } | null> {
  // Check cache
  const cacheKey = `${contentDir}:${nodeId}`;
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey)!;
  }
  
  try {
    // Check if file exists first
    const fullPath = `${contentDir}/${nodeId}.mdx`;
    const file = Bun.file(fullPath);
    
    if (!(await file.exists())) {
      return null;
    }
    
    // Dynamic import - Bun's preload plugin handles MDX transpilation
    const module = await import(`@/content/${nodeId}.mdx`);
    
    // Ensure meta has required fields
    const meta: ContentMeta = {
      id: nodeId,
      title: module.meta?.title || nodeId,
      summary: module.meta?.summary || '',
      category: module.meta?.category,
      order: module.meta?.order,
      prerequisites: module.meta?.prerequisites,
      children: module.meta?.children,
      related: module.meta?.related,
      keywords: module.meta?.keywords,
    };
    
    const result = { default: module.default, meta };
    moduleCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Failed to load MDX for ${nodeId}:`, error);
    return null;
  }
}

/**
 * Render MDX content to an HTML string
 */
export async function renderMdxContent(nodeId: string, contentDir: string = 'src/content'): Promise<{ html: string; meta: ContentMeta } | null> {
  const module = await loadMdxModule(nodeId, contentDir);
  if (!module) return null;
  
  const Component = module.default;
  
  try {
    // MDX components are provided via @mdx-js/preact's MDXProvider
    // which is configured in the preload plugin
    const html = renderToString(<Component />);
    
    return { html, meta: module.meta };
  } catch (error) {
    console.error(`Failed to render ${nodeId}:`, error);
    return null;
  }
}

/**
 * Get metadata for a node (faster than full render)
 */
export async function getNodeMeta(nodeId: string, contentDir: string = 'src/content'): Promise<ContentMeta | null> {
  // Check for special pages
  if (nodeId in specialPages) {
    return specialPages[nodeId] ?? null;
  }
  
  const module = await loadMdxModule(nodeId, contentDir);
  return module?.meta ?? null;
}

/**
 * Clear the module cache (useful for dev server hot reload)
 */
export function clearCache(): void {
  moduleCache.clear();
}

/**
 * Render the full App to HTML string
 * This is the main SSR entry point - renders the complete page
 * 
 * Uses @griffel/react's RendererProvider to capture CSS during SSR,
 * and renderToStyleElements to generate <style> tags for rehydration.
 */
export async function renderAppToString(
  nodeId: string, 
  contentDir: string = 'src/content'
): Promise<{ html: string; meta: ContentMeta; styleElements: string } | null> {
  // Load the MDX module
  const module = await loadMdxModule(nodeId, contentDir);
  if (!module) return null;
  
  // Create a fresh renderer for this SSR pass
  // createDOMRenderer(undefined) creates an in-memory renderer for SSR
  const renderer = createDOMRenderer(undefined as unknown as Document);
  
  // MDX components are provided via @mdx-js/preact's MDXProvider
  const ContentComponent = module.default;
  
  try {
    // Render the full App with the content, wrapped in RendererProvider
    // Use h() directly to avoid TypeScript type mismatch between React/Preact
    const appElement = h(
      RendererProvider as any,
      { renderer },
      h(App, {
        nodeId,
        ContentComponent,
        meta: module.meta,
        initialTheme: 'light',
      })
    );
    
    const html = renderToString(appElement);
    
    // Get style elements with data attributes for client-side rehydration
    // renderToStyleElements returns React/Preact elements
    const styleElementsArray = renderToStyleElements(renderer);
    const styleElements = styleElementsArray
      .map(el => renderToString(el as unknown as preact.VNode))
      .join('\n');
    
    return { html, meta: module.meta, styleElements };
  } catch (error) {
    console.error(`Failed to render app for ${nodeId}:`, error);
    return null;
  }
}

/**
 * Render markdown/MDX content string to HTML
 * Used for rendering variant content in editorial mode
 * 
 * Note: This uses @mdx-js/mdx's evaluate() for runtime compilation of strings.
 * File-based MDX uses Bun's preload plugin instead.
 */
export async function renderMarkdownContent(content: string): Promise<string> {
  // Lazy import evaluate only when needed (editorial mode)
  const { evaluate } = await import('@mdx-js/mdx');
  const { h, Fragment } = await import('preact');
  const runtime = await import('preact/jsx-runtime');
  
  try {
    const result = await evaluate(content, {
      ...runtime,
      Fragment,
      jsx: h,
      jsxs: h,
      development: false,
    });
    
    const Component = result.default;
    const html = renderToString(<Component />);
    
    return html;
  } catch (error) {
    console.error('Failed to render markdown content:', error);
    // Return a basic HTML rendering as fallback
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    const html = escaped
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    return `<div class="variant-content"><p>${html}</p></div>`;
  }
}
