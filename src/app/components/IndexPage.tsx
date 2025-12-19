/**
 * Index page - dynamically generated table of contents
 * 
 * Lists all registered content nodes sorted by order field,
 * providing an alternate navigation path to inline hyperlinks.
 * 
 * In production mode, content is discovered and optimized at bundle time via Bun macros.
 * In development mode, content is loaded normally and optimization happens at runtime.
 */

import { useMemo } from 'preact/hooks';
import { makeStyles, mergeClasses } from '@griffel/react';
import { resetAllProgress, progressStats } from '@/app/progress.ts';
import { SitemapNetworkGraph } from './diagrams/SitemapNetworkGraph.tsx';
import { RadialSitemap } from './diagrams/RadialSitemap.tsx';

// Bundle-time imports (Bun macros - evaluated at transpile time)
import { discoverContent } from '@/lib/content.ts' with { type: 'macro' };
import { runFullOptimization } from '@/lib/sitemap-optimization.ts' with { type: 'macro' };
import { isProdMode } from '@/lib/build-mode.ts' with { type: 'macro' };

import type { ContentMeta, ContentFile } from '@/lib/content.ts';
import type { OptimizedContentFile } from '@/lib/sitemap-optimization.ts';

// ============================================
// BUNDLE-TIME DATA (computed by Bun macro)
// ============================================

/**
 * Content is discovered at bundle time via macro.
 * 
 * In production: Also run optimization at bundle time (displayOrder is set).
 * In development: Skip optimization so it runs at runtime with animation.
 * 
 * isProdMode() is a macro that returns a constant, allowing Bun's AST pruner
 * to eliminate the dead branch and skip macro evaluation in that branch.
 */
let ALL_CONTENT: (ContentFile | OptimizedContentFile)[];

if (isProdMode()) {
  // Production: run full optimization at bundle time
  ALL_CONTENT = await runFullOptimization(discoverContent());
} else {
  // Development: skip optimization, let it run at runtime with animation
  ALL_CONTENT = await discoverContent();
}

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
      borderTopColor: 'var(--color-primary)',
      borderRightColor: 'var(--color-primary)',
      borderBottomColor: 'var(--color-primary)',
      borderLeftColor: 'var(--color-primary)',
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
  
  topicsSection: {
    marginTop: 'var(--space-2xl)',
  },
  
  topicsTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: 'var(--space-md)',
    paddingBottom: 'var(--space-xs)',
    borderBottom: '2px solid var(--color-primary)',
  },
});

// ============================================
// COMPONENT
// ============================================

interface NodeInfo {
  id: string;
  meta: ContentMeta & { displayOrder?: number };
}

export function IndexPage() {
  const styles = useStyles();
  
  // Process the bundle-time content into the format we need
  const nodes = useMemo((): NodeInfo[] => {
    const loadedNodes: NodeInfo[] = [];
    
    for (const file of ALL_CONTENT) {
      // Skip variants (IDs with '/') - they're sub-pages
      if (file.id.includes('/')) continue;
      
      // Skip draft pages
      if (file.meta.draft) continue;
      
      loadedNodes.push({
        id: file.id,
        meta: file.meta,
      });
    }
    
    // Already sorted by discoverContent (order first, then id)
    return loadedNodes;
  }, []);
  
  // Build metadata map for sitemap diagram (includes displayOrder)
  const allMeta = useMemo(() => {
    const metaMap: Record<string, ContentMeta & { displayOrder?: number }> = {};
    for (const node of nodes) {
      metaMap[node.id] = node.meta;
    }
    return metaMap;
  }, [nodes]);
  
  return (
    <article className={mergeClasses(styles.indexPage, 'content-node')}>
      <header className={styles.contentHeader}>
        <h1 className={styles.headerTitle}>Content Index</h1>
        <p className={styles.contentSummary}>
          A complete listing of all topics in this explainer.
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

        <section className={styles.sitemapSection}>
          <h2 className={styles.sitemapTitle}>Radial Sitemap</h2>
          <p className={styles.sitemapDescription}>
            An alternative view of the content network as a radial layout. 
            Hover over any page ID to see its incoming links (purple) and outgoing links (blue), 
            and view the full page title. Click to navigate.
          </p>
          <RadialSitemap allMeta={allMeta} />
        </section>
        
        <section className={styles.topicsSection}>
          <h2 className={styles.topicsTitle}>All Topics</h2>
          <nav aria-label="Content topics">
            <ul className={styles.list}>
              {nodes.map(node => (
                <li key={node.id} className={styles.item}>
                  <a href={`/${node.id}`} className={styles.link}>
                    <span className={styles.title}>{node.meta.title}</span>
                    <span className={styles.summary}>{node.meta.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>
        
        <div className={styles.stats}>
          <p>
            <strong>{nodes.length}</strong> topics
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
