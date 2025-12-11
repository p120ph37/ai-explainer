/**
 * Editorial mode state management
 * 
 * Uses Preact signals for reactive state management.
 * Only loaded when editorial mode is active.
 */

import { signal, computed } from '@preact/signals';
import type { 
  EditorialNote, 
  PageVariants,
  TextSelectionAnchor,
  NoteStatus,
  NotePriority,
} from '../_types.ts';
import { editorialApi } from './api.ts';

/**
 * Check if editorial mode is enabled
 */
export function isEditorialMode(): boolean {
  return typeof window !== 'undefined' && (window as any).__EDITORIAL_MODE__ === true;
}

// ============================================
// STATE SIGNALS
// ============================================

/** Whether the editorial panel is open */
export const panelOpen = signal(false);

/** Current page being viewed */
export const currentPageId = signal<string | null>(null);

/** Current variant being viewed (null = base) */
export const currentVariantId = signal<string | null>(null);

/** All notes for the current page */
export const notes = signal<EditorialNote[]>([]);

/** Variants for the current page */
export const variants = signal<PageVariants | null>(null);

/** Currently selected note ID */
export const selectedNoteId = signal<string | null>(null);

/** Whether we're in the process of creating a new note */
export const isCreatingNote = signal(false);

/** Pending text selection for note creation */
export const pendingSelection = signal<TextSelectionAnchor | null>(null);

/** Position for the selection toolbar popup */
export const selectionToolbarPosition = signal<{ x: number; y: number } | null>(null);

/** Position for the create note popover */
export const createPopoverPosition = signal<{ x: number; y: number } | null>(null);

/** Loading state */
export const isLoading = signal(false);

/** Error message */
export const errorMessage = signal<string | null>(null);

/** Filter: which statuses to show */
export const statusFilter = signal<NoteStatus[]>(['open', 'in-progress', 'question']);

/** Filter: which priorities to show */
export const priorityFilter = signal<NotePriority[]>(['critical', 'high', 'medium', 'low']);

// ============================================
// COMPUTED VALUES
// ============================================

/** Notes filtered by current filters */
export const filteredNotes = computed(() => {
  const allNotes = notes.value;
  const statuses = statusFilter.value;
  const priorities = priorityFilter.value;
  const variant = currentVariantId.value;
  
  return allNotes.filter(note => {
    // Filter by variant
    if (note.variantId !== variant) return false;
    // Filter by status
    if (!statuses.includes(note.status)) return false;
    // Filter by priority
    if (!priorities.includes(note.priority)) return false;
    return true;
  });
});

/** Orphaned notes (invalid anchors) */
export const orphanedNotes = computed(() => {
  return filteredNotes.value.filter(n => !n.anchorValid);
});

/** Valid (anchored) notes */
export const anchoredNotes = computed(() => {
  return filteredNotes.value.filter(n => n.anchorValid);
});

/** Count of open notes */
export const openNotesCount = computed(() => {
  return notes.value.filter(n => n.status === 'open' || n.status === 'question').length;
});

/** Currently selected note object */
export const selectedNote = computed(() => {
  if (!selectedNoteId.value) return null;
  return notes.value.find(n => n.id === selectedNoteId.value) || null;
});

/** Available variants (including base) */
export const availableVariants = computed(() => {
  const base = { id: null, label: 'Base' };
  const pageVariants = variants.value?.variants || [];
  return [base, ...pageVariants.map(v => ({ id: v.id, label: v.label }))];
});

// ============================================
// ACTIONS
// ============================================

/**
 * Load notes and variants for a page
 */
export async function loadPageData(pageId: string): Promise<void> {
  currentPageId.value = pageId;
  isLoading.value = true;
  errorMessage.value = null;
  
  // Restore panel state from previous page
  restorePanelState();
  
  // Read variant from URL path: /nodeId/variantId
  if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      currentVariantId.value = pathParts[1];
    } else {
      currentVariantId.value = null;
    }
  }
  
  try {
    const [pageNotes, pageVariants] = await Promise.all([
      editorialApi.getNotesForPage(pageId),
      editorialApi.getVariants(pageId),
    ]);
    
    notes.value = pageNotes;
    variants.value = pageVariants;
  } catch (error) {
    errorMessage.value = `Failed to load editorial data: ${error}`;
    console.error('Failed to load page data:', error);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Reload notes for the current page
 */
export async function reloadNotes(): Promise<void> {
  if (!currentPageId.value) return;
  
  try {
    const pageNotes = await editorialApi.getNotesForPage(currentPageId.value);
    notes.value = pageNotes;
  } catch (error) {
    console.error('Failed to reload notes:', error);
  }
}

/**
 * Create a new note
 */
export async function createNote(options: {
  content: string;
  title?: string;
  priority?: NotePriority;
  tags?: string[];
}): Promise<EditorialNote | null> {
  if (!currentPageId.value || !pendingSelection.value) {
    errorMessage.value = 'No page or selection for note creation';
    return null;
  }
  
  try {
    const note = await editorialApi.createNote({
      pageId: currentPageId.value,
      variantId: currentVariantId.value,
      anchor: pendingSelection.value,
      content: options.content,
      title: options.title,
      priority: options.priority,
      tags: options.tags,
    });
    
    // Add to local state
    notes.value = [...notes.value, note];
    
    // Clear creation state
    pendingSelection.value = null;
    isCreatingNote.value = false;
    createPopoverPosition.value = null;
    
    return note;
  } catch (error) {
    errorMessage.value = `Failed to create note: ${error}`;
    return null;
  }
}

/**
 * Create a page-level note (no text selection)
 */
export async function createPageNote(options: {
  content: string;
  title?: string;
  priority?: NotePriority;
  tags?: string[];
}): Promise<EditorialNote | null> {
  if (!currentPageId.value) {
    errorMessage.value = 'No page for note creation';
    return null;
  }
  
  try {
    const note = await editorialApi.createNote({
      pageId: currentPageId.value,
      variantId: currentVariantId.value,
      anchor: { type: 'page' },
      content: options.content,
      title: options.title,
      priority: options.priority,
      tags: options.tags,
    });
    
    notes.value = [...notes.value, note];
    return note;
  } catch (error) {
    errorMessage.value = `Failed to create note: ${error}`;
    return null;
  }
}

/**
 * Update a note
 */
export async function updateNote(
  noteId: string, 
  updates: { content?: string; title?: string; status?: NoteStatus; priority?: NotePriority }
): Promise<void> {
  try {
    const updated = await editorialApi.updateNote(noteId, updates);
    notes.value = notes.value.map(n => n.id === noteId ? updated : n);
  } catch (error) {
    errorMessage.value = `Failed to update note: ${error}`;
  }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  try {
    await editorialApi.deleteNote(noteId);
    notes.value = notes.value.filter(n => n.id !== noteId);
    
    if (selectedNoteId.value === noteId) {
      selectedNoteId.value = null;
    }
  } catch (error) {
    errorMessage.value = `Failed to delete note: ${error}`;
  }
}

/**
 * Add a response to a note
 */
export async function addNoteResponse(
  noteId: string,
  author: string,
  content: string,
  actionTaken?: string
): Promise<void> {
  try {
    const updated = await editorialApi.addResponse(noteId, { author, content, actionTaken });
    notes.value = notes.value.map(n => n.id === noteId ? updated : n);
  } catch (error) {
    errorMessage.value = `Failed to add response: ${error}`;
  }
}

/**
 * Mark a note as addressed
 */
export async function markNoteAddressed(
  noteId: string,
  author: string,
  actionTaken: string
): Promise<void> {
  try {
    const updated = await editorialApi.markAddressed(noteId, author, actionTaken);
    notes.value = notes.value.map(n => n.id === noteId ? updated : n);
  } catch (error) {
    errorMessage.value = `Failed to mark as addressed: ${error}`;
  }
}

/**
 * Switch to a different variant using the router
 * 
 * Now that variants are first-class content nodes in the registry,
 * switching variants is just regular SPA navigation via the router.
 */
export async function switchVariant(variantId: string | null): Promise<void> {
  const pageId = currentPageId.value;
  if (!pageId) return;
  
  selectedNoteId.value = null;
  
  // Build the node ID for navigation
  const nodeId = variantId ? `${pageId}/${variantId}` : pageId;
  
  // Update our local state
  currentVariantId.value = variantId;
  
  // Use the router for SPA navigation
  // Dynamic import to avoid circular dependencies
  const { navigateTo } = await import('../../app/router.ts');
  navigateTo(nodeId, { replace: false });
}

/**
 * Create a new variant
 */
export async function createVariant(
  id: string,
  label: string,
  description?: string,
  copyFrom?: string
): Promise<void> {
  if (!currentPageId.value) return;
  
  try {
    const variant = await editorialApi.createVariant({
      pageId: currentPageId.value,
      id,
      label,
      description,
      copyFrom,
    });
    
    // Reload variants
    const pageVariants = await editorialApi.getVariants(currentPageId.value);
    variants.value = pageVariants;
    
    // Switch to the new variant
    switchVariant(variant.id);
  } catch (error) {
    errorMessage.value = `Failed to create variant: ${error}`;
  }
}

/**
 * Delete a variant
 */
export async function deleteVariant(variantId: string): Promise<void> {
  if (!currentPageId.value) return;
  
  try {
    await editorialApi.deleteVariant(currentPageId.value, variantId);
    
    // Reload variants
    const pageVariants = await editorialApi.getVariants(currentPageId.value);
    variants.value = pageVariants;
    
    // If we were viewing this variant, switch back to base
    if (currentVariantId.value === variantId) {
      switchVariant(null);
    }
  } catch (error) {
    errorMessage.value = `Failed to delete variant: ${error}`;
  }
}

/**
 * Open the panel
 */
export function openPanel(): void {
  panelOpen.value = true;
  document.body.classList.add('editorial-panel-open');
  // Persist panel state across page navigations
  try {
    sessionStorage.setItem('editorial-panel-open', 'true');
  } catch {}
}

/**
 * Close the panel
 */
export function closePanel(): void {
  panelOpen.value = false;
  document.body.classList.remove('editorial-panel-open');
  try {
    sessionStorage.setItem('editorial-panel-open', 'false');
  } catch {}
}

/**
 * Restore panel state from session storage
 */
export function restorePanelState(): void {
  try {
    const wasOpen = sessionStorage.getItem('editorial-panel-open') === 'true';
    if (wasOpen) {
      panelOpen.value = true;
      document.body.classList.add('editorial-panel-open');
    }
  } catch {}
}

/**
 * Toggle the panel
 */
export function togglePanel(): void {
  if (panelOpen.value) {
    closePanel();
  } else {
    openPanel();
  }
}

/**
 * Select a note
 */
export function selectNote(noteId: string | null): void {
  selectedNoteId.value = noteId;
  
  // If selecting a note, open the panel
  if (noteId && !panelOpen.value) {
    openPanel();
  }
}

/**
 * Start note creation flow with a text selection
 */
export function startNoteCreation(selection: TextSelectionAnchor, position: { x: number; y: number }): void {
  pendingSelection.value = selection;
  isCreatingNote.value = true;
  createPopoverPosition.value = position;
  selectionToolbarPosition.value = null;
}

/**
 * Cancel note creation
 */
export function cancelNoteCreation(): void {
  pendingSelection.value = null;
  isCreatingNote.value = false;
  createPopoverPosition.value = null;
}

/**
 * Show the selection toolbar at a position
 */
export function showSelectionToolbar(position: { x: number; y: number }): void {
  selectionToolbarPosition.value = position;
}

/**
 * Hide the selection toolbar
 */
export function hideSelectionToolbar(): void {
  selectionToolbarPosition.value = null;
}

/**
 * Clear any error message
 */
export function clearError(): void {
  errorMessage.value = null;
}

