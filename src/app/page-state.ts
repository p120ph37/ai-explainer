/**
 * Page State Preservation
 * 
 * Captures and restores UI state (scroll position, open/closed collapsibles)
 * when navigating via SPA mode and browser history.
 * 
 * This enables proper back/forward behavior where users return to the
 * exact state they left a page in.
 * 
 * Uses the centralized collapsible state from useCollapsible hook.
 */

import { 
  getAllCollapsibleStates, 
  restoreCollapsibleStates, 
  clearCollapsibleStates,
  resetCollapsibleIds,
} from '@/app/hooks/useCollapsible.ts';

// ============================================
// TYPES
// ============================================

export interface PageUIState {
  scrollY: number;
  scrollX: number;
  collapsibles: Record<string, boolean>;
  timestamp: number;
}

export interface ExtendedHistoryState {
  nodeId: string;
  path: string[];
  ui?: PageUIState;
}

// ============================================
// STATE CAPTURE
// ============================================

/**
 * Capture the current page's UI state
 */
export function capturePageState(): PageUIState {
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    collapsibles: getAllCollapsibleStates(),
    timestamp: Date.now(),
  };
}

/**
 * Save scroll position to history.state
 * Call this BEFORE pushState to preserve the outgoing page's scroll position
 * 
 * Note: Collapsible states are saved immediately when they change (in useCollapsible.ts)
 * This function only adds scroll position to the existing state.
 * 
 * Timing:
 * 1. saveCurrentPageState() - replaceState to add scroll position to CURRENT entry
 * 2. pushState() - add NEW entry for destination page
 * 3. Update document.title - set title for new page
 */
export function saveCurrentPageState(): void {
  const currentState = history.state as ExtendedHistoryState | null;
  
  if (!currentState) {
    console.warn('[PageState] Cannot save state: history.state is null');
    return;
  }
  
  // Only update scroll position - collapsibles are already saved via useCollapsible
  const newState: ExtendedHistoryState = {
    ...currentState,
    ui: {
      ...(currentState.ui || { collapsibles: {}, timestamp: Date.now() }),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      timestamp: Date.now(),
    },
  };
  
  // Use replaceState to update the CURRENT entry (not push a new one)
  history.replaceState(newState, '', window.location.href);
}

// ============================================
// STATE RESTORATION
// ============================================

/**
 * Restore page UI state from history
 * Called when navigating back/forward via browser buttons
 */
export function restorePageState(state: ExtendedHistoryState | null): void {
  // IMPORTANT: Reset ID counter so component IDs match the saved state
  // When going back, components will re-mount and generate IDs starting from 0,
  // which must match the IDs in the saved state
  resetCollapsibleIds();
  
  if (!state?.ui) {
    console.log('[PageState] No UI state to restore for:', state?.nodeId);
    // No state to restore - clear existing state for fresh page
    clearCollapsibleStates();
    return;
  }
  
  console.log('[PageState] Restoring state for:', state.nodeId, 'collapsibles:', Object.keys(state.ui.collapsibles));
  
  // Restore collapsible states via the centralized store
  restoreCollapsibleStates(state.ui.collapsibles);
  
  // Schedule scroll restoration after render completes
  scheduleScrollRestore(state.ui);
}

/**
 * Schedule scroll position restoration
 * Waits for components to render before scrolling
 */
function scheduleScrollRestore(ui: PageUIState): void {
  // Use requestAnimationFrame to wait for render, then setTimeout for paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Restore scroll position
      window.scrollTo({
        top: ui.scrollY,
        left: ui.scrollX,
        behavior: 'instant',
      });
    }, 50);
  });
}

// ============================================
// PAGE LIFECYCLE
// ============================================

/**
 * Prepare for a new page render
 * Call this when navigating to a NEW page (not back/forward)
 */
export function prepareForNewPage(): void {
  clearCollapsibleStates();
  resetCollapsibleIds();
}

// Debounce timer for scroll saving
let scrollSaveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Save scroll position with debouncing
 * Called on scroll events to keep the current history entry up-to-date
 */
function saveScrollPositionDebounced(): void {
  if (scrollSaveTimer) {
    clearTimeout(scrollSaveTimer);
  }
  
  scrollSaveTimer = setTimeout(() => {
    const currentState = history.state as ExtendedHistoryState | null;
    if (!currentState) return;
    
    const newState: ExtendedHistoryState = {
      ...currentState,
      ui: {
        ...(currentState.ui || { collapsibles: {}, timestamp: Date.now() }),
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        timestamp: Date.now(),
      },
    };
    
    history.replaceState(newState, '', window.location.href);
  }, 150); // 150ms debounce
}

/**
 * Initialize page state management
 * Sets up scroll listener to continuously save scroll position
 */
export function initPageState(): void {
  // Save scroll position on scroll (debounced)
  // This ensures scroll position is always up-to-date in the current history entry
  // so when back/forward happens, the entry we're leaving already has correct scroll
  window.addEventListener('scroll', saveScrollPositionDebounced, { passive: true });
  
  // Also save on beforeunload for external navigations
  window.addEventListener('beforeunload', () => {
    // Clear debounce and save immediately
    if (scrollSaveTimer) {
      clearTimeout(scrollSaveTimer);
    }
    saveCurrentPageState();
  });
}
