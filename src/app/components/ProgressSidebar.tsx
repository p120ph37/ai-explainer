/**
 * Progress sidebar component (Quest Log)
 * 
 * Shows discovered topics with:
 * - Progress bar showing explored-percent
 * - Topics discovered count (x/y) based on global discovery state
 * - Completion status when both are maxed
 */

import { useSignal, useComputed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { makeStyles, mergeClasses } from '@griffel/react';
import { 
  progressState, 
  getNodeProgress,
  getQuestStatus,
  countDiscoveredTopics,
  questStatusInfo,
  resetNodeProgress,
  markQuestComplete,
  type QuestStatus,
} from '@/app/progress.ts';
import { getNodeMeta, getAllNodeIds, type ContentMeta } from '@/lib/content.ts';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  toggle: {
    position: 'fixed',
    top: 'calc(var(--space-xl) + 60px)',
    right: 'var(--space-md)',
    zIndex: 'var(--z-sticky)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--color-primary)',
      boxShadow: 'var(--shadow-lg)',
    },
  },
  toggleIcon: { fontSize: 'var(--font-size-lg)' },
  toggleLabel: { fontWeight: 500 },
  toggleCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-xs)',
    paddingTop: 'var(--space-2xs)',
    paddingBottom: 'var(--space-2xs)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-sm)',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '320px',
    maxWidth: '90vw',
    zIndex: 'var(--z-modal)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-xl)',
    transform: 'translateX(100%)',
    transitionProperty: 'transform',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease',
  },
  sidebarOpen: { transform: 'translateX(0)' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    borderBottom: '1px solid var(--color-border-subtle)',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    marginTop: 0,
    marginBottom: 0,
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-heading)',
  },
  titleIcon: { fontSize: 'var(--font-size-xl)' },
  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--color-primary)',
      color: 'var(--color-primary)',
    },
  },
  barContainer: {
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    borderBottom: '1px solid var(--color-border-subtle)',
  },
  overview: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-sm)',
  },
  overviewStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xs)',
  },
  overviewLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  overviewValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
  },
  bar: {
    position: 'relative',
    height: '8px',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    marginBottom: 'var(--space-sm)',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 'var(--radius-sm)',
    transitionProperty: 'width',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease',
  },
  barFillDiscovered: {
    backgroundColor: 'var(--color-warning)',
    opacity: 0.3,
  },
  barFillComplete: {
    backgroundImage: 'linear-gradient(90deg, var(--color-success), var(--color-primary))',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-bg-subtle)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
  },
  legendIcon: { fontSize: 'var(--font-size-sm)' },
  legendDiscovered: { color: 'var(--color-warning)' },
  legendInProgress: { color: 'var(--color-primary)' },
  legendComplete: { color: 'var(--color-success)' },
  categories: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
  },
  category: { marginBottom: 'var(--space-md)' },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    cursor: 'pointer',
    listStyleType: 'none',
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
    borderBottom: '1px solid var(--color-border-subtle)',
    '::-webkit-details-marker': { display: 'none' },
  },
  categoryName: { flex: 1 },
  categoryCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  nodeList: {
    listStyleType: 'none',
    paddingLeft: 0,
    marginTop: 'var(--space-xs)',
    marginBottom: 0,
  },
  node: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xs)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-sm)',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': { borderColor: 'var(--color-border)' },
  },
  nodeComplete: { opacity: 0.7 },
  nodeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  },
  nodeStatus: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-md)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--color-border-subtle)',
      backgroundColor: 'var(--color-bg-subtle)',
    },
  },
  nodeStatusUndiscovered: { color: 'var(--color-text-muted)' },
  nodeStatusDiscovered: { color: 'var(--color-warning)' },
  nodeStatusInProgress: { color: 'var(--color-primary)' },
  nodeStatusComplete: { color: 'var(--color-success)' },
  nodeLink: {
    flex: 1,
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--color-text)',
    textDecorationLine: 'none',
    transitionProperty: 'color',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': { color: 'var(--color-primary)' },
  },
  nodeLinkComplete: { color: 'var(--color-text-muted)' },
  nodeDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    paddingLeft: 'calc(24px + var(--space-xs))',
  },
  nodeBarContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  },
  nodeBar: {
    flex: 1,
    height: '4px',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  nodeBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '2px',
    transitionProperty: 'width',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease',
  },
  nodeBarFillComplete: { backgroundColor: 'var(--color-success)' },
  nodeBarLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    minWidth: '36px',
    textAlign: 'right',
  },
  nodeTopics: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  nodeTopicsComplete: { color: 'var(--color-success)' },
  nodeTopicsIcon: { fontSize: 'var(--font-size-sm)' },
  nodeTopicsCount: { fontFamily: 'var(--font-mono)' },
  empty: {
    paddingTop: 'var(--space-xl)',
    paddingBottom: 'var(--space-xl)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  },
  emptyHint: {
    fontSize: 'var(--font-size-sm)',
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  hint: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    lineHeight: 'var(--line-height-normal)',
  },
  loading: {
    paddingTop: 'var(--space-xl)',
    paddingBottom: 'var(--space-xl)',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 'calc(var(--z-modal) - 1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(2px)',
  },
});

// ============================================
// COMPONENT
// ============================================

interface NodeInfo {
  id: string;
  meta: ContentMeta;
  linkedTopics: string[]; // children + related
}

// Category order for display
const categoryOrder = [
  'Getting Started',
  'Foundations',
  'Ecosystem',
  'Safety & Alignment',
];

export function ProgressSidebar() {
  const isOpen = useSignal(false);
  const nodes = useSignal<NodeInfo[]>([]);
  const loading = useSignal(true);
  const styles = useStyles();
  
  // Load all node metadata dynamically
  useEffect(() => {
    async function loadNodes() {
      const loaded: NodeInfo[] = [];
      
      // Get all content IDs dynamically
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        // Skip variants (IDs with '/') - they're sub-pages
        if (nodeId.includes('/')) continue;
        
        const meta = getNodeMeta(nodeId);
        
        // Skip draft pages
        if (!meta || meta.draft) continue;
        
        const linkedTopics = [
          ...(meta.children || []),
          ...(meta.related || []),
        ];
        
        loaded.push({
          id: nodeId,
          meta,
          linkedTopics,
        });
      }
      
      // Sort by order field
      loaded.sort((a, b) => {
        const orderA = a.meta.order ?? 999;
        const orderB = b.meta.order ?? 999;
        return orderA - orderB;
      });
      
      nodes.value = loaded;
      loading.value = false;
    }
    
    loadNodes();
  }, []);
  
  // Compute status for each node (reactive to progress changes)
  const nodesWithStatus = useComputed(() => {
    // Subscribe to progressState to trigger recomputation
    const _ = progressState.value;
    
    return nodes.value.map(node => {
      const progress = getNodeProgress(node.id);
      const discoveredCount = countDiscoveredTopics(node.linkedTopics);
      
      return {
        ...node,
        exploredPercent: progress.exploredPercent,
        discoveredTopicsCount: discoveredCount,
        totalTopicsCount: node.linkedTopics.length,
        status: getQuestStatus(node.id, node.linkedTopics),
      };
    });
  });
  
  // Only show discovered nodes in the quest log
  const discoveredNodes = useComputed(() => {
    return nodesWithStatus.value.filter(
      node => node.status !== 'undiscovered'
    );
  });
  
  // Group by category
  const groupedNodes = useComputed(() => {
    const grouped = new Map<string, typeof nodesWithStatus.value>();
    
    for (const node of discoveredNodes.value) {
      const category = node.meta.category || 'Other';
      const existing = grouped.get(category) || [];
      existing.push(node);
      grouped.set(category, existing);
    }
    
    // Sort within categories by order
    for (const [, categoryNodes] of grouped) {
      categoryNodes.sort((a, b) => (a.meta.order ?? 999) - (b.meta.order ?? 999));
    }
    
    return grouped;
  });
  
  // Progress stats
  const stats = useComputed(() => {
    const all = nodesWithStatus.value;
    const discovered = discoveredNodes.value;
    const complete = discovered.filter(n => n.status === 'complete').length;
    const inProgress = discovered.filter(n => n.status === 'in_progress').length;
    const justDiscovered = discovered.filter(n => n.status === 'discovered').length;
    
    return { 
      total: all.length,
      discovered: discovered.length, 
      complete, 
      inProgress, 
      justDiscovered,
    };
  });
  
  const cycleStatus = (nodeId: string, currentStatus: QuestStatus) => {
    if (currentStatus === 'complete') {
      resetNodeProgress(nodeId);
    } else {
      markQuestComplete(nodeId);
    }
  };
  
  return (
    <>
      {/* Toggle button */}
      <button 
        className={styles.toggle}
        onClick={() => isOpen.value = !isOpen.value}
        aria-expanded={isOpen.value}
        aria-controls="progress-sidebar"
        title={isOpen.value ? 'Hide quest log' : 'Show quest log'}
      >
        <span className={styles.toggleIcon}>📜</span>
        <span className={styles.toggleLabel}>Quest Log</span>
        <span className={styles.toggleCount}>
          {stats.value.complete}/{stats.value.discovered}
        </span>
      </button>
      
      {/* Sidebar panel */}
      <aside 
        id="progress-sidebar"
        className={mergeClasses(styles.sidebar, isOpen.value && styles.sidebarOpen)}
        aria-label="Reading progress"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}>📜</span>
            Quest Log
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={() => isOpen.value = false}
            aria-label="Close quest log"
          >
            ×
          </button>
        </div>
        
        {/* Overall stats */}
        <div className={styles.barContainer}>
          <div className={styles.overview}>
            <div className={styles.overviewStat}>
              <span className={styles.overviewLabel}>Discovered</span>
              <span className={styles.overviewValue}>
                {stats.value.discovered}/{stats.value.total}
              </span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.overviewLabel}>Complete</span>
              <span className={styles.overviewValue}>
                {stats.value.complete}/{stats.value.discovered}
              </span>
            </div>
          </div>
          
          <div className={styles.bar}>
            <div 
              className={mergeClasses(styles.barFill, styles.barFillDiscovered)}
              style={{ width: `${(stats.value.discovered / stats.value.total) * 100}%` }}
            />
            <div 
              className={mergeClasses(styles.barFill, styles.barFillComplete)}
              style={{ width: `${(stats.value.complete / stats.value.total) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Legend */}
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={mergeClasses(styles.legendIcon, styles.legendDiscovered)}>○</span> Discovered
          </span>
          <span className={styles.legendItem}>
            <span className={mergeClasses(styles.legendIcon, styles.legendInProgress)}>◐</span> In Progress
          </span>
          <span className={styles.legendItem}>
            <span className={mergeClasses(styles.legendIcon, styles.legendComplete)}>●</span> Complete
          </span>
        </div>
        
        {/* Node list by category */}
        <div className={styles.categories}>
          {loading.value ? (
            <div className={styles.loading}>Loading quests...</div>
          ) : discoveredNodes.value.length === 0 ? (
            <div className={styles.empty}>
              <p>No quests discovered yet!</p>
              <p className={styles.emptyHint}>
                Start exploring to discover topics.
              </p>
            </div>
          ) : (
            categoryOrder.map(category => {
              const categoryNodes = groupedNodes.value.get(category);
              if (!categoryNodes || categoryNodes.length === 0) return null;
              
              const categoryComplete = categoryNodes.filter(n => n.status === 'complete').length;
              const categoryTotal = categoryNodes.length;
              
              return (
                <details 
                  key={category} 
                  className={styles.category}
                  open
                >
                  <summary className={styles.categoryHeader}>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>
                      {categoryComplete}/{categoryTotal}
                    </span>
                  </summary>
                  
                  <ul className={styles.nodeList}>
                    {categoryNodes.map(node => (
                      <QuestItem 
                        key={node.id} 
                        node={node}
                        styles={styles}
                        onCycleStatus={cycleStatus}
                        onClose={() => isOpen.value = false}
                      />
                    ))}
                  </ul>
                </details>
              );
            })
          )}
        </div>
        
        {/* Footer hint */}
        <div className={styles.footer}>
          <p className={styles.hint}>
            Scroll through content and discover topic links to complete quests.
            Click status icons to manually toggle completion.
          </p>
        </div>
      </aside>
      
      {/* Backdrop for mobile */}
      {isOpen.value && (
        <div 
          className={styles.backdrop}
          onClick={() => isOpen.value = false}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/**
 * Individual quest item with progress bar
 */
function QuestItem({ 
  node, 
  styles,
  onCycleStatus,
  onClose,
}: { 
  node: {
    id: string;
    meta: ContentMeta;
    exploredPercent: number;
    discoveredTopicsCount: number;
    totalTopicsCount: number;
    status: QuestStatus;
  };
  styles: ReturnType<typeof useStyles>;
  onCycleStatus: (nodeId: string, status: QuestStatus) => void;
  onClose: () => void;
}) {
  const info = questStatusInfo[node.status];
  const hasTopics = node.totalTopicsCount > 0;
  
  // Calculate if quest requirements are met
  const exploredComplete = node.exploredPercent >= 100;
  const topicsComplete = node.discoveredTopicsCount >= node.totalTopicsCount;
  
  const getStatusStyle = (status: QuestStatus) => {
    switch (status) {
      case 'undiscovered': return styles.nodeStatusUndiscovered;
      case 'discovered': return styles.nodeStatusDiscovered;
      case 'in_progress': return styles.nodeStatusInProgress;
      case 'complete': return styles.nodeStatusComplete;
      default: return '';
    }
  };
  
  return (
    <li className={mergeClasses(styles.node, node.status === 'complete' && styles.nodeComplete)}>
      <div className={styles.nodeHeader}>
        <button
          className={mergeClasses(styles.nodeStatus, getStatusStyle(node.status))}
          onClick={() => onCycleStatus(node.id, node.status)}
          title={`${info.label} (click to toggle)`}
          aria-label={`${node.meta.title}: ${info.label}`}
        >
          {info.icon}
        </button>
        <a 
          href={`/${node.id}`}
          className={mergeClasses(styles.nodeLink, node.status === 'complete' && styles.nodeLinkComplete)}
          onClick={onClose}
        >
          {node.meta.title}
        </a>
      </div>
      
      {/* Progress details for visited quests */}
      {(node.status === 'in_progress' || node.status === 'complete') && (
        <div className={styles.nodeDetails}>
          {/* Explored progress bar */}
          <div className={styles.nodeBarContainer}>
            <div className={styles.nodeBar}>
              <div 
                className={mergeClasses(styles.nodeBarFill, exploredComplete && styles.nodeBarFillComplete)}
                style={{ width: `${node.exploredPercent}%` }}
              />
            </div>
            <span className={styles.nodeBarLabel}>
              {node.exploredPercent}%
            </span>
          </div>
          
          {/* Topics discovered count */}
          {hasTopics && (
            <div className={mergeClasses(styles.nodeTopics, topicsComplete && styles.nodeTopicsComplete)}>
              <span className={styles.nodeTopicsIcon}>🔗</span>
              <span className={styles.nodeTopicsCount}>
                {node.discoveredTopicsCount}/{node.totalTopicsCount}
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
