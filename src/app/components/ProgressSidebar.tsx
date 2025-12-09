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
import { 
  progressState, 
  getNodeProgress,
  getQuestStatus,
  countDiscoveredTopics,
  questStatusInfo,
  resetNodeProgress,
  markQuestComplete,
  type QuestStatus,
} from '../progress.ts';
import { getNode } from '../../content/_registry.ts';
import type { ContentMeta } from '../../content/_types.ts';

interface NodeInfo {
  id: string;
  meta: ContentMeta;
  linkedTopics: string[]; // children + related
}

// All node IDs (should match registry)
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
  
  // Load all node metadata
  useEffect(() => {
    async function loadNodes() {
      const loaded: NodeInfo[] = [];
      
      for (const nodeId of allNodeIds) {
        try {
          const module = await getNode(nodeId);
          if (module?.meta) {
            const linkedTopics = [
              ...(module.meta.children || []),
              ...(module.meta.related || []),
            ];
            
            loaded.push({
              id: nodeId,
              meta: module.meta,
              linkedTopics,
            });
          }
        } catch {
          // Skip nodes that fail to load
        }
      }
      
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
        className="progress-toggle"
        onClick={() => isOpen.value = !isOpen.value}
        aria-expanded={isOpen.value}
        aria-controls="progress-sidebar"
        title={isOpen.value ? 'Hide quest log' : 'Show quest log'}
      >
        <span className="progress-toggle-icon">📜</span>
        <span className="progress-toggle-label">Quest Log</span>
        <span className="progress-toggle-count">
          {stats.value.complete}/{stats.value.discovered}
        </span>
      </button>
      
      {/* Sidebar panel */}
      <aside 
        id="progress-sidebar"
        className={`progress-sidebar ${isOpen.value ? 'progress-sidebar--open' : ''}`}
        aria-label="Reading progress"
      >
        <div className="progress-sidebar-header">
          <h2 className="progress-sidebar-title">
            <span className="progress-sidebar-icon">📜</span>
            Quest Log
          </h2>
          <button 
            className="progress-sidebar-close"
            onClick={() => isOpen.value = false}
            aria-label="Close quest log"
          >
            ×
          </button>
        </div>
        
        {/* Overall stats */}
        <div className="progress-bar-container">
          <div className="progress-overview">
            <div className="progress-overview-stat">
              <span className="progress-overview-label">Discovered</span>
              <span className="progress-overview-value">
                {stats.value.discovered}/{stats.value.total}
              </span>
            </div>
            <div className="progress-overview-stat">
              <span className="progress-overview-label">Complete</span>
              <span className="progress-overview-value">
                {stats.value.complete}/{stats.value.discovered}
              </span>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-bar-fill progress-bar-fill--discovered"
              style={{ width: `${(stats.value.discovered / stats.value.total) * 100}%` }}
            />
            <div 
              className="progress-bar-fill progress-bar-fill--complete"
              style={{ width: `${(stats.value.complete / stats.value.total) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Legend */}
        <div className="progress-legend">
          <span className="progress-legend-item">
            <span className="legend-icon quest-discovered">○</span> Discovered
          </span>
          <span className="progress-legend-item">
            <span className="legend-icon quest-in-progress">◐</span> In Progress
          </span>
          <span className="progress-legend-item">
            <span className="legend-icon quest-complete">●</span> Complete
          </span>
        </div>
        
        {/* Node list by category */}
        <div className="progress-categories">
          {loading.value ? (
            <div className="progress-loading">Loading quests...</div>
          ) : discoveredNodes.value.length === 0 ? (
            <div className="progress-empty">
              <p>No quests discovered yet!</p>
              <p className="progress-empty-hint">
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
                  className="progress-category"
                  open
                >
                  <summary className="progress-category-header">
                    <span className="progress-category-name">{category}</span>
                    <span className="progress-category-count">
                      {categoryComplete}/{categoryTotal}
                    </span>
                  </summary>
                  
                  <ul className="progress-node-list">
                    {categoryNodes.map(node => (
                      <QuestItem 
                        key={node.id} 
                        node={node}
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
        <div className="progress-footer">
          <p className="progress-hint">
            Scroll through content and discover topic links to complete quests.
            Click status icons to manually toggle completion.
          </p>
        </div>
      </aside>
      
      {/* Backdrop for mobile */}
      {isOpen.value && (
        <div 
          className="progress-backdrop"
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
  onCycleStatus: (nodeId: string, status: QuestStatus) => void;
  onClose: () => void;
}) {
  const info = questStatusInfo[node.status];
  const hasTopics = node.totalTopicsCount > 0;
  
  // Calculate if quest requirements are met
  const exploredComplete = node.exploredPercent >= 100;
  const topicsComplete = node.discoveredTopicsCount >= node.totalTopicsCount;
  
  return (
    <li className={`progress-node ${info.className}`}>
      <div className="progress-node-header">
        <button
          className="progress-node-status"
          onClick={() => onCycleStatus(node.id, node.status)}
          title={`${info.label} (click to toggle)`}
          aria-label={`${node.meta.title}: ${info.label}`}
        >
          {info.icon}
        </button>
        <a 
          href={`/${node.id}`}
          className="progress-node-link"
          onClick={onClose}
        >
          {node.meta.title}
        </a>
      </div>
      
      {/* Progress details for visited quests */}
      {(node.status === 'in_progress' || node.status === 'complete') && (
        <div className="progress-node-details">
          {/* Explored progress bar */}
          <div className="progress-node-bar-container">
            <div className="progress-node-bar">
              <div 
                className={`progress-node-bar-fill ${exploredComplete ? 'complete' : ''}`}
                style={{ width: `${node.exploredPercent}%` }}
              />
            </div>
            <span className="progress-node-bar-label">
              {node.exploredPercent}%
            </span>
          </div>
          
          {/* Topics discovered count */}
          {hasTopics && (
            <div className={`progress-node-topics ${topicsComplete ? 'complete' : ''}`}>
              <span className="progress-node-topics-icon">🔗</span>
              <span className="progress-node-topics-count">
                {node.discoveredTopicsCount}/{node.totalTopicsCount}
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
