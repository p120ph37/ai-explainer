/**
 * Editorial API client
 * 
 * Provides typed methods for interacting with the editorial server API.
 */

import type {
  EditorialNote,
  EditorialState,
  PageVariants,
  PageVariant,
  CreateNoteRequest,
  UpdateNoteRequest,
  AddResponseRequest,
  CreateVariantRequest,
  NoteStatus,
  NotePriority,
  NoteAnchor,
} from '@/editorial/_types.ts';

const API_BASE = '/api/editorial';

/**
 * Fetch helper with error handling
 */
async function apiFetch<T>(
  path: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Editorial API client
 */
export const editorialApi = {
  /**
   * Get the full editorial state (notes + variants)
   */
  async getState(): Promise<EditorialState> {
    return apiFetch<EditorialState>('/state');
  },
  
  /**
   * Get notes for AI consumption (text format)
   */
  async getNotesForAI(pageId?: string, includeAddressed = false): Promise<string> {
    const params = new URLSearchParams();
    if (pageId) params.set('pageId', pageId);
    if (includeAddressed) params.set('includeAddressed', 'true');
    
    const response = await fetch(`${API_BASE}/notes/ai?${params}`);
    return response.text();
  },
  
  /**
   * Get notes for a specific page
   */
  async getNotesForPage(pageId: string, variantId?: string | null): Promise<EditorialNote[]> {
    const params = variantId ? `?variantId=${variantId}` : '';
    return apiFetch<EditorialNote[]>(`/notes/page/${pageId}${params}`);
  },
  
  /**
   * Create a new note
   */
  async createNote(request: CreateNoteRequest): Promise<EditorialNote> {
    return apiFetch<EditorialNote>('/notes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: UpdateNoteRequest): Promise<EditorialNote> {
    return apiFetch<EditorialNote>(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  
  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Add a response to a note
   */
  async addResponse(noteId: string, request: AddResponseRequest): Promise<EditorialNote> {
    return apiFetch<EditorialNote>(`/notes/${noteId}/responses`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  /**
   * Mark a note as addressed
   */
  async markAddressed(noteId: string, author: string, actionTaken: string): Promise<EditorialNote> {
    return apiFetch<EditorialNote>(`/notes/${noteId}/address`, {
      method: 'POST',
      body: JSON.stringify({ author, actionTaken }),
    });
  },
  
  /**
   * Mark a note's anchor as invalid (orphaned)
   */
  async markOrphaned(noteId: string): Promise<EditorialNote> {
    return apiFetch<EditorialNote>(`/notes/${noteId}/orphan`, {
      method: 'POST',
    });
  },
  
  /**
   * Get variants for a page
   */
  async getVariants(pageId: string): Promise<PageVariants> {
    return apiFetch<PageVariants>(`/variants/${pageId}`);
  },
  
  /**
   * Create a new variant
   */
  async createVariant(request: CreateVariantRequest): Promise<PageVariant> {
    return apiFetch<PageVariant>('/variants', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  /**
   * Update a variant's content
   */
  async updateVariant(pageId: string, variantId: string, content: string): Promise<PageVariant> {
    return apiFetch<PageVariant>(`/variants/${pageId}/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
  
  /**
   * Delete a variant
   */
  async deleteVariant(pageId: string, variantId: string): Promise<void> {
    await apiFetch<{ success: boolean }>(`/variants/${pageId}/${variantId}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Get the base MDX content for a page
   */
  async getBaseContent(pageId: string): Promise<string> {
    const response = await fetch(`${API_BASE}/content/${pageId}`);
    if (!response.ok) {
      throw new Error(`Failed to get content: ${response.status}`);
    }
    return response.text();
  },
};

