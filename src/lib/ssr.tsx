/**
 * Server-Side Rendering for MDX Content
 * 
 * Compiles MDX files and renders them to HTML strings for SEO.
 * Used by both dev server and build script.
 */

import { h, Fragment } from 'preact';
import renderToString from 'preact-render-to-string';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'preact/jsx-runtime';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkStripImports from './remark-strip-imports.ts';
import { nodeFiles, type NodeMeta, specialPages } from './node-metadata.ts';

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
};

// Cache compiled modules
const moduleCache = new Map<string, { default: any; meta: NodeMeta }>();

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
 */
export async function loadMdxModule(nodeId: string, contentDir: string = 'src/content'): Promise<{ default: any; meta: NodeMeta } | null> {
  // Check cache
  const cacheKey = `${contentDir}:${nodeId}`;
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey)!;
  }
  
  const filePath = nodeFiles[nodeId];
  if (!filePath) return null;
  
  try {
    const fullPath = `${contentDir}/${filePath}`;
    const file = Bun.file(fullPath);
    
    if (!(await file.exists())) {
      return null;
    }
    
    const content = await file.text();
    const module = await compileMdx(content);
    
    // Ensure meta has required fields
    const meta: NodeMeta = {
      id: nodeId,
      title: module.meta?.title || nodeId,
      summary: module.meta?.summary || '',
      category: module.meta?.category,
      order: module.meta?.order,
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
export async function renderMdxContent(nodeId: string, contentDir: string = 'src/content'): Promise<{ html: string; meta: NodeMeta } | null> {
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
export async function getNodeMeta(nodeId: string, contentDir: string = 'src/content'): Promise<NodeMeta | null> {
  // Check for special pages
  if (nodeId in specialPages) {
    return specialPages[nodeId];
  }
  
  const module = await loadMdxModule(nodeId, contentDir);
  return module?.meta || null;
}

/**
 * Clear the module cache (useful for dev server hot reload)
 */
export function clearCache(): void {
  moduleCache.clear();
}
