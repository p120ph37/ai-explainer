/**
 * Type definitions for the editorial markup system
 * 
 * Editorial notes are positionally-anchored annotations that can be attached
 * to specific text selections or points within content pages.
 */

/**
 * Anchor types for editorial notes
 */
export type AnchorType = 
  | 'text-selection'    // Anchored to a specific text selection
  | 'element'           // Anchored to a specific element (by data-anchor-id)
  | 'line'              // Anchored to a line range in the source MDX
  | 'page';             // General note for the page (no specific anchor)

/**
 * Represents a text selection anchor
 * Uses a stable path + text content approach for resilience to edits
 */
export interface TextSelectionAnchor {
  type: 'text-selection';
  /** The selected text (used for validation and re-finding) */
  selectedText: string;
  /** Character offset from start of the content body */
  startOffset: number;
  /** Character offset to end of selection */
  endOffset: number;
  /** CSS selector path to the container element (for faster lookup) */
  containerPath?: string;
  /** Surrounding context for fuzzy matching if exact match fails */
  contextBefore?: string;
  contextAfter?: string;
}

export interface ElementAnchor {
  type: 'element';
  /** data-anchor-id attribute value */
  anchorId: string;
}

export interface LineAnchor {
  type: 'line';
  /** Starting line number in the MDX source */
  startLine: number;
  /** Ending line number in the MDX source */
  endLine?: number;
}

export interface PageAnchor {
  type: 'page';
}

export type NoteAnchor = TextSelectionAnchor | ElementAnchor | LineAnchor | PageAnchor;

/**
 * Status of an editorial note
 */
export type NoteStatus = 
  | 'open'          // Needs attention
  | 'in-progress'   // Being worked on
  | 'addressed'     // Marked as addressed (by AI or human)
  | 'wont-fix'      // Explicitly not addressing
  | 'question';     // AI has a clarifying question

/**
 * Priority levels for notes
 */
export type NotePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * A response to a note (from AI or human)
 */
export interface NoteResponse {
  id: string;
  /** Who responded: 'ai' | 'human' | 'cursor' */
  author: string;
  content: string;
  timestamp: string;
  /** If AI is marking addressed, what was done */
  actionTaken?: string;
}

/**
 * An editorial note
 */
export interface EditorialNote {
  /** Unique identifier */
  id: string;
  
  /** Page this note is attached to (node ID, e.g., 'intro', 'tokens') */
  pageId: string;
  
  /** Variant this note is attached to (null = base variant) */
  variantId: string | null;
  
  /** Where the note is anchored */
  anchor: NoteAnchor;
  
  /** Whether the anchor is currently valid */
  anchorValid: boolean;
  
  /** The note content (markdown supported) */
  content: string;
  
  /** Optional title/label */
  title?: string;
  
  /** Current status */
  status: NoteStatus;
  
  /** Priority level */
  priority: NotePriority;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last updated timestamp */
  updatedAt: string;
  
  /** Author of the note */
  author: string;
  
  /** Responses/thread on this note */
  responses: NoteResponse[];
}

/**
 * Page variant for A/B/C testing
 */
export interface PageVariant {
  /** Variant identifier (e.g., 'a', 'b', 'approach-2') */
  id: string;
  
  /** Human-readable label */
  label: string;
  
  /** Optional description of what this variant is testing */
  description?: string;
  
  /** The variant content (full MDX content) */
  content: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Page variants metadata (stored alongside the base MDX file)
 */
export interface PageVariants {
  /** Page ID this variants file belongs to */
  pageId: string;
  
  /** All variants for this page */
  variants: PageVariant[];
}

/**
 * Editorial state for the entire project
 */
export interface EditorialState {
  /** All notes across all pages */
  notes: EditorialNote[];
  
  /** Map of page ID to variant metadata */
  variants: Record<string, PageVariants>;
}

/**
 * API request/response types
 */
export interface CreateNoteRequest {
  pageId: string;
  variantId?: string | null;
  anchor: NoteAnchor;
  content: string;
  title?: string;
  priority?: NotePriority;
  tags?: string[];
  author?: string;
}

export interface UpdateNoteRequest {
  content?: string;
  title?: string;
  status?: NoteStatus;
  priority?: NotePriority;
  tags?: string[];
  anchor?: NoteAnchor;
}

export interface AddResponseRequest {
  author: string;
  content: string;
  actionTaken?: string;
}

export interface CreateVariantRequest {
  pageId: string;
  id: string;
  label: string;
  description?: string;
  /** If provided, copy from this variant; otherwise copy from base */
  copyFrom?: string;
}

/**
 * Frontend state types
 */
export interface EditorialModeState {
  enabled: boolean;
  activePageId: string | null;
  activeVariantId: string | null;
  selectedNoteId: string | null;
  isCreatingNote: boolean;
  pendingSelection: TextSelectionAnchor | null;
}

