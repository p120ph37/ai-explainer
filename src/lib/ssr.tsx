/**
 * Server-Side Rendering
 * 
 * Renders the full App component to HTML for SEO and fast initial paint.
 * The same component tree is hydrated on the client.
 * 
 * Uses @griffel/react's RendererProvider for CSS-in-JS SSR support.
 */

import * as preact from 'preact';
import { h, Fragment } from 'preact';
import renderToString from 'preact-render-to-string';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'preact/jsx-runtime';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkStripImports from './remark-strip-imports.ts';
import { type ContentMeta, specialPages } from './content.ts';
import { App } from '../app/App.tsx';

// Griffel SSR imports
import { createDOMRenderer, renderToStyleElements, RendererProvider } from '@griffel/react';

// Import our custom MDX components
import { Term } from '../app/components/content/Term.tsx';
import { Expandable } from '../app/components/content/Expandable.tsx';
import { Recognition } from '../app/components/content/Recognition.tsx';
import { TryThis } from '../app/components/content/TryThis.tsx';
import { Sources, Citation, Reference, Footnote } from '../app/components/content/Sources.tsx';
import { Metaphor } from '../app/components/content/Metaphor.tsx';
import { Question } from '../app/components/content/Question.tsx';

// Import diagram components
import { 
  ScaleComparison, 
  NetworkGraph, 
  BarChart, 
  TokenBoundaries,
  LayerStack,
  FlowDiagram,
  DiagramPlaceholder,
  TokenizerDemo,
  PerceptronToy,
  GameOfLife,
} from '../app/components/diagrams/index.ts';

// Custom components for MDX - these replace imports during SSR
const mdxComponents = {
  // Content components
  Term,
  Expandable,
  Recognition,
  TryThis,
  Sources,
  Citation,
  Reference,
  Footnote,
  Metaphor,
  Question,
  // Diagram components
  ScaleComparison,
  NetworkGraph,
  BarChart,
  TokenBoundaries,
  LayerStack,
  FlowDiagram,
  DiagramPlaceholder,
  TokenizerDemo,
  PerceptronToy,
  GameOfLife,
};

// Cache compiled modules
const moduleCache = new Map<string, { default: any; meta: ContentMeta }>();

/**
 * Compile and evaluate MDX content
 */
async function compileMdx(content: string): Promise<{ default: any; meta: any }> {
  const result = await evaluate(content, {
    ...runtime,
    Fragment,
    jsx: h,
    jsxs: h,
    remarkPlugins: [
      remarkStripImports,  // Strip imports before frontmatter processing
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'meta' }],
    ],
    development: false,
    useMDXComponents: () => mdxComponents,
  });
  
  return result as { default: any; meta: any };
}

/**
 * Load and compile an MDX file, returning component and meta
 * Uses direct file path: src/content/{id}.mdx
 */
export async function loadMdxModule(nodeId: string, contentDir: string = 'src/content'): Promise<{ default: any; meta: ContentMeta } | null> {
  // Check cache
  const cacheKey = `${contentDir}:${nodeId}`;
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey)!;
  }
  
  try {
    // Direct file path - no registry lookup needed
    const fullPath = `${contentDir}/${nodeId}.mdx`;
    const file = Bun.file(fullPath);
    
    if (!(await file.exists())) {
      return null;
    }
    
    const content = await file.text();
    const module = await compileMdx(content);
    
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
    console.error(`Failed to compile MDX for ${nodeId}:`, error);
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
    // Render the MDX component with our custom components
    const html = renderToString(
      <Component components={mdxComponents} />
    );
    
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
  
  // Create a wrapper component that provides the MDX components
  const ContentWithComponents = () => (
    <module.default components={mdxComponents} />
  );
  
  try {
    // Render the full App with the content, wrapped in RendererProvider
    // Use h() directly to avoid TypeScript type mismatch between React/Preact
    const appElement = h(
      RendererProvider as any,
      { renderer },
      h(App, {
        nodeId,
        ContentComponent: ContentWithComponents,
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
 */
export async function renderMarkdownContent(content: string): Promise<string> {
  try {
    const module = await compileMdx(content);
    const Component = module.default;
    
    const html = renderToString(
      <Component components={mdxComponents} />
    );
    
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
