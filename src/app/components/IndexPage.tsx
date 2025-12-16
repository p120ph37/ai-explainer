/**
 * Index page - dynamically generated table of contents
 * 
 * Lists all registered content nodes grouped by category,
 * providing an alternate navigation path to inline hyperlinks.
 * 
 * Category information is read from each node's frontmatter metadata.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { getNodeMeta, type ContentMeta } from '../../lib/content.ts';
import { resetAllProgress, progressStats } from '../progress.ts';

interface NodeInfo {
  id: string;
  meta: ContentMeta;
}

// Category display order (categories not listed here will appear at the end)
const categoryOrder = [
  'Getting Started',
  'Foundations',
  'Ecosystem',
  'Safety & Alignment',
];

// List of all node IDs to load (matches _registry.ts)
const allNodeIds = [
  'intro',
  'tokens', 'why-large', 'context-window', 'neural-network', 'parameters',
  'embeddings', 'attention', 'transformer', 'labels', 'training',
  'reward', 'tuning', 'inference', 'temperature', 'emergence',
  'hallucinations', 'understanding', 'prompt-engineering', 'tools',
  'vector-databases', 'hardware',
  'models', 'players', 'open',
  'bias', 'alignment',
];

export function IndexPage() {
  const nodes = useSignal<NodeInfo[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  
  useEffect(() => {
    async function loadAllNodes() {
      loading.value = true;
      error.value = null;
      
      try {
        const loadedNodes: NodeInfo[] = [];
        
        for (const nodeId of allNodeIds) {
          const meta = getNodeMeta(nodeId);
          if (meta) {
            loadedNodes.push({
              id: nodeId,
              meta,
            });
          }
        }
        
        nodes.value = loadedNodes;
      } catch (e) {
        error.value = 'Failed to load content index';
        console.error(e);
      } finally {
        loading.value = false;
      }
    }
    
    loadAllNodes();
  }, []);
  
  if (loading.value) {
    return (
      <div className="index-page">
        <div className="index-loading">Loading content index...</div>
      </div>
    );
  }
  
  if (error.value) {
    return (
      <div className="index-page">
        <div className="index-error">{error.value}</div>
      </div>
    );
  }
  
  // Group nodes by category from metadata
  const grouped = new Map<string, NodeInfo[]>();
  for (const node of nodes.value) {
    const category = node.meta.category || 'Other';
    const existing = grouped.get(category) || [];
    existing.push(node);
    grouped.set(category, existing);
  }
  
  // Sort nodes within each category by order field
  for (const [category, categoryNodes] of grouped) {
    categoryNodes.sort((a, b) => {
      const orderA = a.meta.order ?? 999;
      const orderB = b.meta.order ?? 999;
      return orderA - orderB;
    });
  }
  
  // Get sorted category list (known categories first, then any others)
  const sortedCategories = [
    ...categoryOrder.filter(c => grouped.has(c)),
    ...[...grouped.keys()].filter(c => !categoryOrder.includes(c)),
  ];
  
  return (
    <article className="index-page content-node">
      <header className="content-header">
        <h1>Content Index</h1>
        <p className="content-summary">
          A complete listing of all topics in this explainer, organized by category.
        </p>
      </header>
      
      <div className="index-content">
        <p className="index-intro">
          This index provides an alternate way to explore the content. 
          You can also navigate through the inline links within each topic, 
          which connect related concepts together.
        </p>
        
        <nav className="index-categories" aria-label="Content categories">
          {sortedCategories.map(category => {
            const categoryNodes = grouped.get(category);
            if (!categoryNodes || categoryNodes.length === 0) return null;
            
            return (
              <section key={category} className="index-category">
                <h2>{category}</h2>
                <ul className="index-list">
                  {categoryNodes.map(node => (
                    <li key={node.id} className="index-item">
                      <a href={`/${node.id}`} className="index-link">
                        <span className="index-title">{node.meta.title}</span>
                        <span className="index-summary">{node.meta.summary}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
        
        <div className="index-stats">
          <p>
            <strong>{nodes.value.length}</strong> topics across{' '}
            <strong>{grouped.size}</strong> categories
          </p>
        </div>
        
        <div className="index-progress">
          <h3>Your Progress</h3>
          <p>
            <strong>{progressStats.value.discovered}</strong> topics discovered,{' '}
            <strong>{progressStats.value.fullyExplored}</strong> complete
          </p>
          <button 
            className="index-reset-button"
            onClick={() => {
              if (confirm('Clear all progress? This will reset your discovery and reading progress.')) {
                resetAllProgress();
                // Force re-render by updating a signal
                window.location.reload();
              }
            }}
          >
            Clear All Progress
          </button>
        </div>
      </div>
    </article>
  );
}
