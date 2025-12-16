/**
 * Application Entry Point - True SSR Hydration
 * 
 * SSR renders the full App component to HTML.
 * Client hydrates the same component tree, taking over event handlers.
 * 
 * For initial page load:
 * - MDX content is already in the DOM from SSR
 * - We create a component that renders the same structure
 * - Preact attaches event handlers to existing DOM
 * 
 * For SPA navigation (future):
 * - Would need to fetch and render new content
 */

import { hydrate } from 'preact';
import { App } from './App.tsx';
import { initializeTheme, getEffectiveTheme } from './theme.ts';
import { getNodeMeta } from '../lib/content.ts';

// MDX components for client-side rendering
import { Term } from './components/content/Term.tsx';
import { Expandable } from './components/content/Expandable.tsx';
import { Recognition } from './components/content/Recognition.tsx';
import { TryThis } from './components/content/TryThis.tsx';
import { Sources, Citation, Reference, Footnote } from './components/content/Sources.tsx';
import { Metaphor } from './components/content/Metaphor.tsx';
import { Question } from './components/content/Question.tsx';
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
} from './components/diagrams/index.ts';
import { MDXProvider } from './components/MDXProvider.tsx';

// MDX components map
const mdxComponents = {
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

// Initialize theme before hydration to prevent flash
initializeTheme();

/**
 * Get the content component for a given node ID.
 * Each MDX file is imported dynamically.
 */
async function getContentComponent(nodeId: string): Promise<(() => any) | null> {
  // Map of all available content modules
  // These are lazy-loaded via dynamic imports
  const modules: Record<string, () => Promise<any>> = {
    'agents': () => import('../content/agents.mdx'),
    'alignment': () => import('../content/alignment.mdx'),
    'applications': () => import('../content/applications.mdx'),
    'attention': () => import('../content/attention.mdx'),
    'bias': () => import('../content/bias.mdx'),
    'context-window': () => import('../content/context-window.mdx'),
    'cutoff': () => import('../content/cutoff.mdx'),
    'embeddings': () => import('../content/embeddings.mdx'),
    'emergence': () => import('../content/emergence.mdx'),
    'guardrails': () => import('../content/guardrails.mdx'),
    'hallucinations': () => import('../content/hallucinations.mdx'),
    'hardware': () => import('../content/hardware.mdx'),
    'inference': () => import('../content/inference.mdx'),
    'intro': () => import('../content/intro.mdx'),
    'labels': () => import('../content/labels.mdx'),
    'local': () => import('../content/local.mdx'),
    'memory': () => import('../content/memory.mdx'),
    'models': () => import('../content/models.mdx'),
    'multimodal': () => import('../content/multimodal.mdx'),
    'neural-network': () => import('../content/neural-network.mdx'),
    'open': () => import('../content/open.mdx'),
    'optimization': () => import('../content/optimization.mdx'),
    'parameters': () => import('../content/parameters.mdx'),
    'players': () => import('../content/players.mdx'),
    'prompt-engineering': () => import('../content/prompt-engineering.mdx'),
    'reasoning': () => import('../content/reasoning.mdx'),
    'reward': () => import('../content/reward.mdx'),
    'scale': () => import('../content/scale.mdx'),
    'security': () => import('../content/security.mdx'),
    'temperature': () => import('../content/temperature.mdx'),
    'tokens': () => import('../content/tokens.mdx'),
    'tools': () => import('../content/tools.mdx'),
    'training': () => import('../content/training.mdx'),
    'transformer': () => import('../content/transformer.mdx'),
    'tuning': () => import('../content/tuning.mdx'),
    'understanding': () => import('../content/understanding.mdx'),
    'vector-databases': () => import('../content/vector-databases.mdx'),
  };
  
  const loader = modules[nodeId];
  if (!loader) {
    console.warn(`No content module found for: ${nodeId}`);
    return null;
  }
  
  try {
    const module = await loader();
    const MdxContent = module.default;
    
    // Return a component that renders the MDX with components
    return () => (
      <MDXProvider>
        <MdxContent components={mdxComponents} />
      </MDXProvider>
    );
  } catch (error) {
    console.error(`Failed to load content for ${nodeId}:`, error);
    return null;
  }
}

/**
 * Initialize and hydrate the application
 */
async function initApp() {
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    console.error('App root element not found');
    return;
  }
  
  // Get initial node ID from SSR data attribute
  const nodeId = appRoot.dataset.initialNode || 'intro';
  
  // Get metadata from injected window globals
  const meta = getNodeMeta(nodeId);
  
  if (!meta) {
    console.error(`No metadata found for node: ${nodeId}`);
    return;
  }
  
  // Load the content component
  const ContentComponent = await getContentComponent(nodeId);
  
  if (!ContentComponent) {
    console.error(`Failed to load content component for: ${nodeId}`);
    return;
  }
  
  // Get current theme
  const theme = getEffectiveTheme();
  
  // Hydrate the App - Preact will match the SSR DOM and attach event handlers
  hydrate(
    <App
      nodeId={nodeId}
      ContentComponent={ContentComponent}
      meta={meta}
      initialTheme={theme}
    />,
    appRoot
  );
  
  console.log(`✅ Hydrated: /${nodeId}`);
}

// Start hydration
initApp();
