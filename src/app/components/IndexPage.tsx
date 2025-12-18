/**
 * Index page - dynamically generated table of contents
 * 
 * Lists all registered content nodes grouped by category,
 * providing an alternate navigation path to inline hyperlinks.
 * 
 * Category information is read from each node's frontmatter metadata.
 */

import { useEffect, useMemo } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { makeStyles, mergeClasses } from '@griffel/react';
import { getNodeMeta, getAllNodeIds, type ContentMeta } from '@/lib/content.ts';
import { resetAllProgress, progressStats } from '@/app/progress.ts';
import { SitemapNetworkGraph } from './diagrams/SitemapNetworkGraph.tsx';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  indexPage: {
    maxWidth: 'var(--content-width)',
    marginInline: 'auto',
  },
  
  contentHeader: {
    marginBottom: 'var(--space-xl)',
  },
  
  headerTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 700,
    color: 'var(--color-text-heading)',
    marginBottom: 'var(--space-sm)',
  },
  
  contentSummary: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-muted)',
  },
  
  intro: {
    marginBottom: 'var(--space-xl)',
    color: 'var(--color-text-body)',
    lineHeight: 'var(--line-height-relaxed)',
  },
  
  categories: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
  },
  
  categoryTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: 'var(--space-md)',
    paddingBottom: 'var(--space-xs)',
    borderBottom: '2px solid var(--color-primary)',
  },
  
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  
  item: {
    marginTop: 0,
    marginBottom: 0,
  },
  
  link: {
    display: 'block',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    textDecorationLine: 'none',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': {
      backgroundColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-primary)',
      transform: 'translateX(4px)',
    },
  },
  
  title: {
    display: 'block',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-md)',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
    marginBottom: 'var(--space-2xs)',
  },
  
  linkHoverTitle: {
    // Applied on hover via parent
  },
  
  summary: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: 'var(--line-height-normal)',
  },
  
  stats: {
    marginTop: 'var(--space-xl)',
    paddingTop: 'var(--space-lg)',
    borderTop: '1px solid var(--color-border-subtle)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
  
  progress: {
    marginTop: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
  },
  
  progressTitle: {
    marginTop: 0,
    marginBottom: 'var(--space-sm)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  progressText: {
    marginTop: 0,
    marginBottom: 'var(--space-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  
  resetButton: {
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: 'var(--transition-fast)',
    ':hover': {
      color: 'var(--color-bg)',
      backgroundColor: 'var(--color-error)',
    },
  },
  
  loading: {
    paddingTop: 'var(--space-xl)',
    paddingBottom: 'var(--space-xl)',
    paddingLeft: 'var(--space-xl)',
    paddingRight: 'var(--space-xl)',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  },
  
  error: {
    paddingTop: 'var(--space-xl)',
    paddingBottom: 'var(--space-xl)',
    paddingLeft: 'var(--space-xl)',
    paddingRight: 'var(--space-xl)',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  },
  
  sitemapSection: {
    marginTop: 'var(--space-2xl)',
    marginBottom: 'var(--space-2xl)',
    paddingTop: 'var(--space-xl)',
    borderTop: '2px solid var(--color-border-subtle)',
  },
  
  sitemapTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-xl)',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
    marginBottom: 'var(--space-md)',
  },
  
  sitemapDescription: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-lg)',
    lineHeight: 'var(--line-height-relaxed)',
  },
});

// ============================================
// COMPONENT
// ============================================

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

export function IndexPage() {
  const nodes = useSignal<NodeInfo[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const styles = useStyles();
  
  useEffect(() => {
    async function loadAllNodes() {
      loading.value = true;
      error.value = null;
      
      try {
        const loadedNodes: NodeInfo[] = [];
        
        // Get all content IDs dynamically
        const allIds = getAllNodeIds();
        
        for (const nodeId of allIds) {
          // Skip variants (IDs with '/') - they're sub-pages
          if (nodeId.includes('/')) continue;
          
          const meta = getNodeMeta(nodeId);
          
          // Skip draft pages
          if (!meta || meta.draft) continue;
          
          loadedNodes.push({
            id: nodeId,
            meta,
          });
        }
        
        // Sort by order field
        loadedNodes.sort((a, b) => {
          const orderA = a.meta.order ?? 999;
          const orderB = b.meta.order ?? 999;
          return orderA - orderB;
        });
        
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
      <div className={styles.indexPage}>
        <div className={styles.loading}>Loading content index...</div>
      </div>
    );
  }
  
  if (error.value) {
    return (
      <div className={styles.indexPage}>
        <div className={styles.error}>{error.value}</div>
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
  
  // Build metadata map for sitemap diagram
  const allMeta = useMemo(() => {
    const metaMap: Record<string, ContentMeta> = {};
    for (const node of nodes.value) {
      metaMap[node.id] = node.meta;
    }
    return metaMap;
  }, [nodes.value]);
  
  return (
    <article className={mergeClasses(styles.indexPage, 'content-node')}>
      <header className={styles.contentHeader}>
        <h1 className={styles.headerTitle}>Content Index</h1>
        <p className={styles.contentSummary}>
          A complete listing of all topics in this explainer, organized by category.
        </p>
      </header>
      
      <div>
        <p className={styles.intro}>
          This index provides an alternate way to explore the content. 
          You can also navigate through the inline links within each topic, 
          which connect related concepts together.
        </p>
        
        <section className={styles.sitemapSection}>
          <h2 className={styles.sitemapTitle}>Content Network</h2>
          <p className={styles.sitemapDescription}>
            This interactive network shows how topics link to each other. Each arrow represents a link 
            from one page to another. The layout is automatically generated based on the actual links 
            in the content. Click any node to navigate to that topic.
          </p>
          <SitemapNetworkGraph allMeta={allMeta} />
        </section>
        
        <nav className={styles.categories} aria-label="Content categories">
          {sortedCategories.map(category => {
            const categoryNodes = grouped.get(category);
            if (!categoryNodes || categoryNodes.length === 0) return null;
            
            return (
              <section key={category}>
                <h2 className={styles.categoryTitle}>{category}</h2>
                <ul className={styles.list}>
                  {categoryNodes.map(node => (
                    <li key={node.id} className={styles.item}>
                      <a href={`/${node.id}`} className={styles.link}>
                        <span className={styles.title}>{node.meta.title}</span>
                        <span className={styles.summary}>{node.meta.summary}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
        
        <div className={styles.stats}>
          <p>
            <strong>{nodes.value.length}</strong> topics across{' '}
            <strong>{grouped.size}</strong> categories
          </p>
        </div>
        
        <div className={styles.progress}>
          <h3 className={styles.progressTitle}>Your Progress</h3>
          <p className={styles.progressText}>
            <strong>{progressStats.value.discovered}</strong> topics discovered,{' '}
            <strong>{progressStats.value.fullyExplored}</strong> complete
          </p>
          <button 
            className={styles.resetButton}
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
