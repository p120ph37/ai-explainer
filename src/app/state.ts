/**
 * Minimal application state management
 * 
 * Uses Preact Signals for reactive state.
 * Keeps state minimal - most state lives in URL/router.
 */

import { signal, computed } from '@preact/signals';

/**
 * Track which expandable sections the user has opened
 * Key: `${nodeId}:${sectionId}`
 */
export const expandedSections = signal<Set<string>>(new Set());

export function toggleSection(nodeId: string, sectionId: string): void {
  const key = `${nodeId}:${sectionId}`;
  const current = expandedSections.value;
  const next = new Set(current);
  
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  
  expandedSections.value = next;
}

export function isSectionExpanded(nodeId: string, sectionId: string): boolean {
  return expandedSections.value.has(`${nodeId}:${sectionId}`);
}

/**
 * Track nodes the user has visited (for "visited" styling)
 */
const VISITED_STORAGE_KEY = 'ai-explainer-visited';

function loadVisited(): Set<string> {
  try {
    const stored = localStorage.getItem(VISITED_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveVisited(visited: Set<string>): void {
  try {
    localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...visited]));
  } catch {
    // localStorage might be unavailable
  }
}

export const visitedNodes = signal<Set<string>>(loadVisited());

export function markVisited(nodeId: string): void {
  const next = new Set(visitedNodes.value);
  next.add(nodeId);
  visitedNodes.value = next;
  saveVisited(next);
}

export function hasVisited(nodeId: string): boolean {
  return visitedNodes.value.has(nodeId);
}

/**
 * Reading progress estimate
 */
export const readingProgress = computed(() => {
  const visited = visitedNodes.value.size;
  // This will be updated once we have the full content graph
  const total = 20; // Placeholder
  return Math.round((visited / total) * 100);
});

