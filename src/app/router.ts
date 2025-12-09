/**
 * Hybrid Router
 * 
 * Provides SPA-like navigation while using real URLs for SEO and deep linking.
 * 
 * Features:
 * - Real pathname-based URLs (/tokens, /intro, etc.)
 * - Intercepts internal link clicks for instant navigation
 * - Fetches HTML and swaps content without full page reload
 * - Uses History API for proper back/forward support
 * - Falls back to normal navigation for external links
 * 
 * This approach combines the benefits of:
 * - MPA: Real URLs, SEO, deep linking, server-rendered initial content
 * - SPA: Fast navigation, preserved state, no JS reload
 */

import { signal } from '@preact/signals';

export interface RouteState {
  nodeId: string;
  path: string[];  // Breadcrumb trail of node IDs
}

// Current route state
export const currentRoute = signal<RouteState>({
  nodeId: 'intro',
  path: ['intro'],
});

// Navigation state
export const isNavigating = signal(false);

// Known internal node IDs (populated at runtime from content registry)
const knownNodeIds = new Set<string>();

/**
 * Register a node ID as a valid internal route
 */
export function registerNodeId(nodeId: string): void {
  knownNodeIds.add(nodeId);
}

/**
 * Check if a path is an internal route
 */
export function isInternalPath(path: string): boolean {
  // Remove leading slash and get first segment
  const nodeId = path.replace(/^\//, '').split('/')[0];
  
  // Check if it's a known node or special page
  return knownNodeIds.has(nodeId) || nodeId === 'index' || nodeId === '';
}

/**
 * Check if a hash is an in-page anchor (not a route)
 * In-page anchors include: #ref-1, #fn-1, etc.
 * Routes use paths like /tokens
 */
export function isInPageAnchor(hash: string): boolean {
  if (!hash) return false;
  // Any hash is an in-page anchor (routes use paths now)
  return hash.startsWith('#');
}

/**
 * Parse URL pathname into a route state
 */
function parsePathname(pathname: string): RouteState {
  // Remove leading/trailing slashes and split
  const parts = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  
  if (parts.length === 0) {
    return { nodeId: 'intro', path: ['intro'] };
  }
  
  const nodeId = parts[parts.length - 1] || 'intro';
  
  return {
    nodeId,
    path: parts.length > 0 ? parts : ['intro'],
  };
}

/**
 * Get the initial node ID from the page's data attribute
 */
function getInitialNodeId(): string {
  const app = document.getElementById('app');
  return app?.dataset.initialNode || 'intro';
}

/**
 * Navigate to a content node
 * 
 * Options:
 * - addToPath: Add to breadcrumb trail (drilling down)
 * - replace: Replace current history entry
 * - skipFetch: Don't fetch content (used for initial load)
 */
export async function navigateTo(
  nodeId: string, 
  options: { 
    addToPath?: boolean;
    replace?: boolean;
    skipFetch?: boolean;
  } = {}
): Promise<void> {
  const current = currentRoute.value;
  
  // Build new path
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
  const url = `/${nodeId}`;
  
  if (options.replace) {
    window.history.replaceState(newRoute, '', url);
  } else {
    window.history.pushState(newRoute, '', url);
  }
  
  // Update route state (triggers re-render)
  currentRoute.value = newRoute;
  
  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'instant' });
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
  
  const newRoute: RouteState = {
    nodeId,
    path: newPath,
  };
  
  // Update URL and history
  window.history.pushState(newRoute, '', `/${nodeId}`);
  currentRoute.value = newRoute;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Handle click events on links
 * Intercepts internal links for SPA-like navigation
 */
function handleLinkClick(event: MouseEvent): void {
  // Ignore if modifier keys are pressed (new tab, etc.)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  
  // Find the closest anchor element
  const target = event.target as HTMLElement;
  const anchor = target.closest('a');
  
  if (!anchor) return;
  
  const href = anchor.getAttribute('href');
  if (!href) return;
  
  // Handle in-page anchors (like #ref-1)
  if (href.startsWith('#')) {
    // Let browser handle in-page anchor scrolling
    return;
  }
  
  // Check if it's an internal path-based link
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('.')) {
    const nodeId = href.slice(1).split('/')[0] || 'intro';
    
    // Check if it's a known internal route
    if (isInternalPath(href) || knownNodeIds.has(nodeId)) {
      event.preventDefault();
      navigateTo(nodeId, { addToPath: true });
      return;
    }
  }
  
  // Check for relative links (./path)
  if (href.startsWith('./')) {
    const normalizedPath = '/' + href.slice(2);
    const nodeId = normalizedPath.slice(1).split('/')[0] || 'intro';
    
    if (isInternalPath(normalizedPath) || knownNodeIds.has(nodeId)) {
      event.preventDefault();
      navigateTo(nodeId, { addToPath: true });
      return;
    }
  }
  
  // Check for absolute URLs to same origin
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin === window.location.origin && !url.pathname.includes('.')) {
      const nodeId = url.pathname.slice(1).split('/')[0] || 'intro';
      if (isInternalPath(url.pathname) || knownNodeIds.has(nodeId)) {
        event.preventDefault();
        navigateTo(nodeId, { addToPath: true });
        return;
      }
    }
  } catch {
    // Not a valid URL, let browser handle it
  }
  
  // External link - let browser handle normally
}

/**
 * Handle popstate (browser back/forward)
 */
function handlePopState(event: PopStateEvent): void {
  if (event.state) {
    currentRoute.value = event.state as RouteState;
  } else {
    // Parse from URL
    currentRoute.value = parsePathname(window.location.pathname);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Initialize the router
 */
export function initRouter(): void {
  // Get initial node from page data attribute or URL
  const initialNodeId = getInitialNodeId();
  const pathname = window.location.pathname;
  
  // Parse initial route
  let initialRoute: RouteState;
  
  if (pathname === '/' || pathname === '') {
    // Root URL - use initial node from data attribute
    initialRoute = { nodeId: initialNodeId, path: [initialNodeId] };
    // Replace URL to include the node path
    if (initialNodeId !== 'intro') {
      window.history.replaceState(initialRoute, '', `/${initialNodeId}`);
    }
  } else {
    // Parse from URL
    initialRoute = parsePathname(pathname);
  }
  
  currentRoute.value = initialRoute;
  
  // Store initial state
  window.history.replaceState(initialRoute, '', window.location.pathname);
  
  // Set up event listeners
  document.addEventListener('click', handleLinkClick);
  window.addEventListener('popstate', handlePopState);
}

/**
 * Clean up router (for testing)
 */
export function destroyRouter(): void {
  document.removeEventListener('click', handleLinkClick);
  window.removeEventListener('popstate', handlePopState);
}

/**
 * Get the current node ID
 */
export function getCurrentNodeId(): string {
  return currentRoute.value.nodeId;
}

/**
 * Prefetch a content node for faster navigation
 */
export async function prefetchNode(nodeId: string): Promise<void> {
  // Create a hidden link for prefetching
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/${nodeId}/`;
  document.head.appendChild(link);
}

/**
 * Set up prefetching for related nodes
 */
export function setupPrefetching(getRelatedNodes: (nodeId: string) => string[]): void {
  // Prefetch related nodes after a delay
  let prefetchTimeout: number;
  
  const doPrefetch = () => {
    const { nodeId } = currentRoute.value;
    const related = getRelatedNodes(nodeId);
    
    // Prefetch first 3 related nodes
    related.slice(0, 3).forEach(prefetchNode);
  };
  
  // Watch route changes
  const unsubscribe = currentRoute.subscribe(() => {
    clearTimeout(prefetchTimeout);
    prefetchTimeout = window.setTimeout(doPrefetch, 1000);
  });
  
  return unsubscribe;
}
