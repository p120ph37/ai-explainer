/**
 * Progress tracking for content nodes
 * 
 * Each topic/quest tracks:
 * - exploredPercent: How much of the page content has been scrolled (0-100)
 * - discoveredTopics: Which topic links have been found on this page
 * - totalTopicsOnPage: How many discoverable links exist on this page
 * 
 * A quest is "complete" when:
 * - exploredPercent >= 100 AND
 * - all discoverable topics on the page have been found
 * 
 * If new topics are added to a page between sessions, a previously-complete
 * quest may become incomplete.
 */

import { signal, computed } from '@preact/signals';

export type QuestStatus = 'undiscovered' | 'discovered' | 'in_progress' | 'complete';

interface NodeProgress {
  /** How much of the page has been scrolled through (0-100) */
  exploredPercent: number;
  /** Topic IDs that have been discovered ON this page */
  discoveredTopicsOnPage: string[];
  /** When the node was first discovered */
  discoveredAt?: number;
  /** When the node was first visited */
  visitedAt?: number;
  /** When the quest was completed */
  completedAt?: number;
}

interface ProgressState {
  /** Map of nodeId -> progress data */
  nodes: Record<string, NodeProgress>;
  /** Global set of all discovered topic IDs (regardless of where discovered) */
  allDiscoveredTopics: string[];
}

const STORAGE_KEY = 'ai-explainer-progress-v3';

function loadProgress(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage might be unavailable
  }
  return { nodes: {}, allDiscoveredTopics: [] };
}

function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be unavailable
  }
}

// Reactive progress state
export const progressState = signal<ProgressState>(loadProgress());

// Event emitter for discovery animations
type DiscoveryCallback = (nodeId: string, sourceElement: HTMLElement) => void;
const discoveryCallbacks: DiscoveryCallback[] = [];

export function onDiscovery(callback: DiscoveryCallback): () => void {
  discoveryCallbacks.push(callback);
  return () => {
    const index = discoveryCallbacks.indexOf(callback);
    if (index > -1) discoveryCallbacks.splice(index, 1);
  };
}

function emitDiscovery(nodeId: string, sourceElement: HTMLElement): void {
  discoveryCallbacks.forEach(cb => cb(nodeId, sourceElement));
}

/**
 * Get progress for a specific node
 */
export function getNodeProgress(nodeId: string): NodeProgress {
  return progressState.value.nodes[nodeId] || {
    exploredPercent: 0,
    discoveredTopicsOnPage: [],
  };
}

/**
 * Get the quest status for a node
 */
export function getQuestStatus(nodeId: string, totalTopicsOnPage: number = 0): QuestStatus {
  const progress = getNodeProgress(nodeId);
  
  // Not yet discovered (never seen a link to this topic)
  if (!progressState.value.allDiscoveredTopics.includes(nodeId)) {
    return 'undiscovered';
  }
  
  // Discovered but never visited
  if (!progress.visitedAt) {
    return 'discovered';
  }
  
  // Check completion: explored 100% AND all topics on page discovered
  const isFullyExplored = progress.exploredPercent >= 100;
  const allTopicsFound = progress.discoveredTopicsOnPage.length >= totalTopicsOnPage;
  
  if (isFullyExplored && allTopicsFound) {
    return 'complete';
  }
  
  return 'in_progress';
}

/**
 * Check if a topic has been globally discovered (seen anywhere)
 */
export function isTopicDiscovered(nodeId: string): boolean {
  return progressState.value.allDiscoveredTopics.includes(nodeId);
}

/**
 * Mark a topic as globally discovered
 * Called when a link to this topic becomes visible on any page
 * Returns true if this was a NEW discovery
 */
export function markTopicDiscovered(
  nodeId: string, 
  sourceElement?: HTMLElement,
  currentPageId?: string
): boolean {
  const current = progressState.value;
  
  // Check if already globally discovered
  const wasAlreadyDiscovered = current.allDiscoveredTopics.includes(nodeId);
  
  // Update global discovery list
  const allDiscovered = wasAlreadyDiscovered 
    ? current.allDiscoveredTopics 
    : [...current.allDiscoveredTopics, nodeId];
  
  // Update the node's own progress (mark as discovered)
  const nodeProgress = current.nodes[nodeId] || {
    exploredPercent: 0,
    discoveredTopicsOnPage: [],
  };
  
  if (!nodeProgress.discoveredAt) {
    nodeProgress.discoveredAt = Date.now();
  }
  
  // Also track which page discovered this topic
  let updatedNodes = { ...current.nodes };
  updatedNodes[nodeId] = nodeProgress;
  
  // If discovered from a specific page, update that page's discovered count
  if (currentPageId && currentPageId !== nodeId) {
    const pageProgress = current.nodes[currentPageId] || {
      exploredPercent: 0,
      discoveredTopicsOnPage: [],
    };
    
    if (!pageProgress.discoveredTopicsOnPage.includes(nodeId)) {
      updatedNodes[currentPageId] = {
        ...pageProgress,
        discoveredTopicsOnPage: [...pageProgress.discoveredTopicsOnPage, nodeId],
      };
    }
  }
  
  const next: ProgressState = {
    allDiscoveredTopics: allDiscovered,
    nodes: updatedNodes,
  };
  
  progressState.value = next;
  saveProgress(next);
  
  // Emit discovery event for animation (only if NEW discovery)
  if (!wasAlreadyDiscovered && sourceElement) {
    emitDiscovery(nodeId, sourceElement);
  }
  
  return !wasAlreadyDiscovered;
}

/**
 * Mark a node as visited (user navigated to it)
 */
export function markVisited(nodeId: string): void {
  const current = progressState.value;
  const nodeProgress = current.nodes[nodeId] || {
    exploredPercent: 0,
    discoveredTopicsOnPage: [],
  };
  
  // Already visited, don't update
  if (nodeProgress.visitedAt) return;
  
  // Also mark as discovered if not already
  const allDiscovered = current.allDiscoveredTopics.includes(nodeId)
    ? current.allDiscoveredTopics
    : [...current.allDiscoveredTopics, nodeId];
  
  const next: ProgressState = {
    ...current,
    allDiscoveredTopics: allDiscovered,
    nodes: {
      ...current.nodes,
      [nodeId]: {
        ...nodeProgress,
        discoveredAt: nodeProgress.discoveredAt || Date.now(),
        visitedAt: Date.now(),
      },
    },
  };
  
  progressState.value = next;
  saveProgress(next);
}

/**
 * Update the explored percent for a node
 * Called as user scrolls through the content
 */
export function updateExploredPercent(nodeId: string, percent: number): void {
  const current = progressState.value;
  const nodeProgress = current.nodes[nodeId] || {
    exploredPercent: 0,
    discoveredTopicsOnPage: [],
  };
  
  // Only update if higher than before (can't "un-read")
  const newPercent = Math.max(nodeProgress.exploredPercent, Math.min(100, percent));
  
  if (newPercent === nodeProgress.exploredPercent) return;
  
  const next: ProgressState = {
    ...current,
    nodes: {
      ...current.nodes,
      [nodeId]: {
        ...nodeProgress,
        exploredPercent: newPercent,
      },
    },
  };
  
  progressState.value = next;
  saveProgress(next);
}

/**
 * Manually set a quest as complete
 */
export function markQuestComplete(nodeId: string): void {
  const current = progressState.value;
  const nodeProgress = current.nodes[nodeId] || {
    exploredPercent: 0,
    discoveredTopicsOnPage: [],
  };
  
  const next: ProgressState = {
    ...current,
    nodes: {
      ...current.nodes,
      [nodeId]: {
        ...nodeProgress,
        exploredPercent: 100,
        completedAt: Date.now(),
      },
    },
  };
  
  progressState.value = next;
  saveProgress(next);
}

/**
 * Reset progress for a specific node
 */
export function resetNodeProgress(nodeId: string): void {
  const current = progressState.value;
  const updatedNodes = { ...current.nodes };
  delete updatedNodes[nodeId];
  
  const next: ProgressState = {
    ...current,
    allDiscoveredTopics: current.allDiscoveredTopics.filter(id => id !== nodeId),
    nodes: updatedNodes,
  };
  
  progressState.value = next;
  saveProgress(next);
}

/**
 * Get stats for the progress sidebar
 */
export const progressStats = computed(() => {
  const state = progressState.value;
  const discovered = state.allDiscoveredTopics.length;
  
  let visited = 0;
  let complete = 0;
  
  for (const [nodeId, progress] of Object.entries(state.nodes)) {
    if (progress.visitedAt) visited++;
    if (progress.exploredPercent >= 100) complete++;
  }
  
  return { discovered, visited, complete };
});

/**
 * Reset all progress (for testing/debugging)
 */
export function resetAllProgress(): void {
  progressState.value = { nodes: {}, allDiscoveredTopics: [] };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Status display info
 */
export const questStatusInfo: Record<QuestStatus, { label: string; icon: string; className: string }> = {
  undiscovered: { label: 'Undiscovered', icon: '?', className: 'quest-undiscovered' },
  discovered: { label: 'Discovered', icon: '○', className: 'quest-discovered' },
  in_progress: { label: 'In Progress', icon: '◐', className: 'quest-in-progress' },
  complete: { label: 'Complete', icon: '●', className: 'quest-complete' },
};
