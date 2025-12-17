/**
 * Shared Collapsible State Management
 * 
 * Provides a centralized way to manage open/closed state for all collapsible
 * components (Expandable, Question, Metaphor, Recognition).
 * 
 * Features:
 * - Unique ID generation for each collapsible instance
 * - Centralized state tracking via signals
 * - Automatic state persistence on navigation
 * - State restoration on browser back/forward
 */

import { signal, computed } from '@preact/signals';
import { useEffect, useMemo } from 'preact/hooks';

// ============================================
// STATE STORE
// ============================================

// Map of collapsible IDs to their open state
// Using a signal so changes trigger re-renders
const collapsibleStates = signal<Record<string, boolean>>({});

// Counter for generating unique IDs within a page session
let idCounter = 0;

/**
 * Generate a unique ID for a collapsible instance
 */
function generateId(type: string): string {
  return `${type}-${++idCounter}`;
}

/**
 * Reset ID counter (call on page navigation)
 */
export function resetCollapsibleIds(): void {
  idCounter = 0;
}

/**
 * Get the open state for a collapsible
 */
export function getCollapsibleState(id: string): boolean {
  return collapsibleStates.value[id] ?? false;
}

/**
 * Set the open state for a collapsible
 * Also immediately persists to history.state so back/forward preserves state
 */
export function setCollapsibleState(id: string, isOpen: boolean): void {
  collapsibleStates.value = {
    ...collapsibleStates.value,
    [id]: isOpen,
  };
  
  // Immediately persist to history.state
  // This ensures state is saved even if user presses back without navigating
  persistCollapsibleStatesToHistory();
}

/**
 * Persist current collapsible states to history.state
 * Uses replaceState to update the current entry without adding a new one
 */
function persistCollapsibleStatesToHistory(): void {
  const currentState = history.state;
  if (!currentState) return;
  
  const newState = {
    ...currentState,
    ui: {
      ...(currentState.ui || {}),
      collapsibles: { ...collapsibleStates.value },
      // Don't update scroll position here - that's handled separately
    },
  };
  
  history.replaceState(newState, '', window.location.href);
}

/**
 * Toggle the open state for a collapsible
 */
export function toggleCollapsible(id: string): void {
  setCollapsibleState(id, !getCollapsibleState(id));
}

/**
 * Get all collapsible states (for serialization)
 */
export function getAllCollapsibleStates(): Record<string, boolean> {
  return { ...collapsibleStates.value };
}

/**
 * Restore all collapsible states (from deserialization)
 */
export function restoreCollapsibleStates(states: Record<string, boolean>): void {
  collapsibleStates.value = states;
}

/**
 * Clear all collapsible states (on new page load)
 */
export function clearCollapsibleStates(): void {
  collapsibleStates.value = {};
  idCounter = 0;
}

// ============================================
// HOOK
// ============================================

export interface UseCollapsibleOptions {
  /** Type of collapsible (for ID generation and styling) */
  type: 'expandable' | 'question' | 'metaphor' | 'recognition';
  /** Default open state */
  defaultOpen?: boolean;
  /** Optional explicit ID (for special cases) */
  id?: string;
}

export interface UseCollapsibleReturn {
  /** Unique ID for this collapsible instance */
  id: string;
  /** Whether the collapsible is currently open */
  isOpen: boolean;
  /** Toggle the open state */
  toggle: () => void;
  /** Set the open state directly */
  setOpen: (open: boolean) => void;
  /** Props to spread on the trigger element */
  triggerProps: {
    onClick: () => void;
    'aria-expanded': boolean;
  };
  /** Props to spread on the root element for state tracking */
  rootProps: {
    'data-collapsible': string;  // type (question, metaphor, etc.)
    'data-open': boolean;
  };
}

/**
 * Hook for managing collapsible component state
 * 
 * Usage:
 * ```tsx
 * function MyCollapsible({ children }) {
 *   const { id, isOpen, toggle, triggerProps, openClassName } = useCollapsible({
 *     type: 'question',
 *   });
 *   
 *   return (
 *     <aside className={isOpen ? openClassName : ''}>
 *       <button {...triggerProps}>Toggle</button>
 *       {isOpen && <div>{children}</div>}
 *     </aside>
 *   );
 * }
 * ```
 */
export function useCollapsible(options: UseCollapsibleOptions): UseCollapsibleReturn {
  const { type, defaultOpen = false, id: explicitId } = options;
  
  // Generate or use explicit ID - stable across renders
  const id = useMemo(() => explicitId ?? generateId(type), [explicitId, type]);
  
  // Initialize state on mount if not already set
  useEffect(() => {
    if (!(id in collapsibleStates.value)) {
      setCollapsibleState(id, defaultOpen);
    }
    
    // Cleanup on unmount (optional - keeps state for navigation)
    // return () => { delete collapsibleStates.value[id]; };
  }, [id, defaultOpen]);
  
  // Compute isOpen reactively from the signal
  const isOpen = computed(() => collapsibleStates.value[id] ?? defaultOpen).value;
  
  const toggle = () => toggleCollapsible(id);
  const setOpen = (open: boolean) => setCollapsibleState(id, open);
  
  return {
    id,
    isOpen,
    toggle,
    setOpen,
    triggerProps: {
      onClick: toggle,
      'aria-expanded': isOpen,
    },
    rootProps: {
      'data-collapsible': type,
      'data-open': isOpen,
    },
  };
}

