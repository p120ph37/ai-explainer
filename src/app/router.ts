/**
 * Simple client-side router
 * 
 * Handles navigation between content nodes using the History API.
 * Supports prefetching of likely next nodes for smooth navigation.
 */

import { signal, effect } from '@preact/signals';

export interface RouteState {
  nodeId: string;
  path: string[];  // Breadcrumb trail of node IDs
}

// Current route state
export const currentRoute = signal<RouteState>({
  nodeId: 'intro',
  path: ['intro'],
});

// Navigation history for back button support
const navHistory: RouteState[] = [];

/**
 * Parse the current URL into a route state
 */
function parseUrl(): RouteState {
  const hash = window.location.hash.slice(1); // Remove #
  
  if (!hash) {
    return { nodeId: 'intro', path: ['intro'] };
  }
  
  // URL format: #/path/to/node
  const parts = hash.split('/').filter(Boolean);
  const nodeId = parts[parts.length - 1] || 'intro';
  
  return {
    nodeId,
    path: parts.length > 0 ? parts : ['intro'],
  };
}

/**
 * Navigate to a content node
 */
export function navigateTo(nodeId: string, options: { 
  addToPath?: boolean;
  replace?: boolean;
} = {}): void {
  const current = currentRoute.value;
  
  let newPath: string[];
  
  if (options.addToPath) {
    // Add to current path (drilling down)
    newPath = [...current.path, nodeId];
  } else {
    // Replace current node (lateral navigation)
    newPath = [...current.path.slice(0, -1), nodeId];
  }
  
  const newRoute: RouteState = {
    nodeId,
    path: newPath,
  };
  
  // Update URL
  const hash = `#/${newPath.join('/')}`;
  
  if (options.replace) {
    window.history.replaceState(newRoute, '', hash);
  } else {
    navHistory.push(current);
    window.history.pushState(newRoute, '', hash);
  }
  
  currentRoute.value = newRoute;
}

/**
 * Navigate up one level in the concept hierarchy
 */
export function navigateUp(): void {
  const current = currentRoute.value;
  
  if (current.path.length <= 1) {
    return; // Already at root
  }
  
  const newPath = current.path.slice(0, -1);
  const nodeId = newPath[newPath.length - 1] || 'intro';
  
  navigateTo(nodeId, { replace: false });
  currentRoute.value = { nodeId, path: newPath };
}

/**
 * Initialize the router
 */
export function initRouter(): void {
  // Handle initial URL
  currentRoute.value = parseUrl();
  
  // Handle browser back/forward
  window.addEventListener('popstate', (event) => {
    if (event.state) {
      currentRoute.value = event.state as RouteState;
    } else {
      currentRoute.value = parseUrl();
    }
  });
}

/**
 * Prefetch a content node for faster navigation
 */
export async function prefetchNode(nodeId: string): Promise<void> {
  // Dynamic import to trigger bundler code-splitting
  try {
    await import(`../content/${nodeId}.tsx`);
  } catch {
    // Node doesn't exist at that path, try finding it
    console.debug(`Prefetch: Node ${nodeId} not found at expected path`);
  }
}

/**
 * Effect to prefetch likely next nodes when route changes
 */
export function setupPrefetching(getRelatedNodes: (nodeId: string) => string[]): void {
  effect(() => {
    const { nodeId } = currentRoute.value;
    const related = getRelatedNodes(nodeId);
    
    // Prefetch after a short delay to not compete with current page load
    setTimeout(() => {
      related.forEach(prefetchNode);
    }, 1000);
  });
}

