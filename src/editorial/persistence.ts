/**
 * Editorial notes persistence layer
 * 
 * Notes are stored in the `editorial/` directory at the project root:
 * - editorial/notes.json - All editorial notes
 * - editorial/variants/{pageId}.json - Variant content for each page
 * 
 * These files are NOT gitignored - they can be committed as work-in-progress.
 */

import { existsSync, mkdirSync, readdirSync } from 'fs';
import type {
  EditorialNote,
  EditorialState,
  PageVariants,
  PageVariant,
  CreateNoteRequest,
  UpdateNoteRequest,
  AddResponseRequest,
  CreateVariantRequest,
  NoteAnchor,
} from './_types.ts';

const EDITORIAL_DIR = './editorial';
const NOTES_FILE = `${EDITORIAL_DIR}/notes.json`;
const VARIANTS_DIR = `${EDITORIAL_DIR}/variants`;

/**
 * Generate a unique ID for notes/responses
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get current ISO timestamp
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Ensure editorial directories exist
 */
function ensureDirectories(): void {
  if (!existsSync(EDITORIAL_DIR)) {
    mkdirSync(EDITORIAL_DIR, { recursive: true });
  }
  if (!existsSync(VARIANTS_DIR)) {
    mkdirSync(VARIANTS_DIR, { recursive: true });
  }
}

/**
 * Load all editorial notes
 */
export async function loadNotes(): Promise<EditorialNote[]> {
  ensureDirectories();
  
  const file = Bun.file(NOTES_FILE);
  if (!await file.exists()) {
    return [];
  }
  
  try {
    const data = await file.json();
    return data.notes || [];
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
}

/**
 * Save all editorial notes
 */
export async function saveNotes(notes: EditorialNote[]): Promise<void> {
  ensureDirectories();
  
  const data = {
    version: 1,
    lastUpdated: now(),
    notes,
  };
  
  await Bun.write(NOTES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Create a new editorial note
 */
export async function createNote(request: CreateNoteRequest): Promise<EditorialNote> {
  const notes = await loadNotes();
  
  const note: EditorialNote = {
    id: generateId(),
    pageId: request.pageId,
    variantId: request.variantId ?? null,
    anchor: request.anchor,
    anchorValid: true,
    content: request.content,
    title: request.title,
    status: 'open',
    priority: request.priority ?? 'medium',
    tags: request.tags ?? [],
    createdAt: now(),
    updatedAt: now(),
    author: request.author ?? 'editor',
    responses: [],
  };
  
  notes.push(note);
  await saveNotes(notes);
  
  return note;
}

/**
 * Update an editorial note
 */
export async function updateNote(
  noteId: string, 
  updates: UpdateNoteRequest
): Promise<EditorialNote | null> {
  const notes = await loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  
  if (index === -1) {
    return null;
  }
  
  const note = notes[index];
  
  if (updates.content !== undefined) note.content = updates.content;
  if (updates.title !== undefined) note.title = updates.title;
  if (updates.status !== undefined) note.status = updates.status;
  if (updates.priority !== undefined) note.priority = updates.priority;
  if (updates.tags !== undefined) note.tags = updates.tags;
  if (updates.anchor !== undefined) {
    note.anchor = updates.anchor;
    note.anchorValid = true; // Reset validation on anchor update
  }
  
  note.updatedAt = now();
  
  await saveNotes(notes);
  return note;
}

/**
 * Delete an editorial note
 */
export async function deleteNote(noteId: string): Promise<boolean> {
  const notes = await loadNotes();
  const index = notes.findIndex(n => n.id === noteId);
  
  if (index === -1) {
    return false;
  }
  
  notes.splice(index, 1);
  await saveNotes(notes);
  
  return true;
}

/**
 * Add a response to a note
 */
export async function addResponse(
  noteId: string,
  request: AddResponseRequest
): Promise<EditorialNote | null> {
  const notes = await loadNotes();
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    return null;
  }
  
  note.responses.push({
    id: generateId(),
    author: request.author,
    content: request.content,
    timestamp: now(),
    actionTaken: request.actionTaken,
  });
  
  note.updatedAt = now();
  
  await saveNotes(notes);
  return note;
}

/**
 * Mark a note as addressed (typically by AI)
 */
export async function markAddressed(
  noteId: string,
  author: string,
  actionTaken: string
): Promise<EditorialNote | null> {
  const notes = await loadNotes();
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    return null;
  }
  
  note.status = 'addressed';
  note.responses.push({
    id: generateId(),
    author,
    content: `Marked as addressed.`,
    timestamp: now(),
    actionTaken,
  });
  
  note.updatedAt = now();
  
  await saveNotes(notes);
  return note;
}

/**
 * Mark a note's anchor as invalid (orphaned)
 */
export async function markAnchorInvalid(noteId: string): Promise<EditorialNote | null> {
  const notes = await loadNotes();
  const note = notes.find(n => n.id === noteId);
  
  if (!note) {
    return null;
  }
  
  note.anchorValid = false;
  note.updatedAt = now();
  
  await saveNotes(notes);
  return note;
}

/**
 * Get notes for a specific page
 */
export async function getNotesForPage(
  pageId: string,
  variantId?: string | null
): Promise<EditorialNote[]> {
  const notes = await loadNotes();
  
  return notes.filter(n => {
    if (n.pageId !== pageId) return false;
    // Only filter by variant if explicitly requested (not undefined)
    // Note: url.searchParams.get() returns null when param is missing,
    // so we need to check for both undefined and null
    if (variantId !== undefined && variantId !== null && n.variantId !== variantId) return false;
    return true;
  });
}

/**
 * Load variants for a page
 * 
 * Variants can come from two sources:
 * 1. JSON file: editorial/variants/{pageId}.json (for editable variants)
 * 2. Markdown files: editorial/variants/{pageId}/*.md (for voice samples)
 */
export async function loadVariants(pageId: string): Promise<PageVariants | null> {
  ensureDirectories();
  
  const variants: PageVariant[] = [];
  
  // 1. Load from JSON file if it exists
  const jsonFile = Bun.file(`${VARIANTS_DIR}/${pageId}.json`);
  if (await jsonFile.exists()) {
    try {
      const jsonData = await jsonFile.json() as PageVariants;
      if (jsonData.variants) {
        variants.push(...jsonData.variants);
      }
    } catch (error) {
      console.error(`Failed to load JSON variants for ${pageId}:`, error);
    }
  }
  
  // 2. Load from markdown files in subdirectory if it exists
  const voiceDir = `${VARIANTS_DIR}/${pageId}`;
  if (existsSync(voiceDir)) {
    try {
      const files = readdirSync(voiceDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const variantId = file.replace('.md', '');
          // Skip if already loaded from JSON
          if (variants.some(v => v.id === variantId)) continue;
          
          const content = await Bun.file(`${voiceDir}/${file}`).text();
          // Extract label from first line if it's a heading
          const firstLine = content.split('\n')[0];
          const labelMatch = firstLine.match(/^#\s+(.+)/);
          const label = labelMatch ? labelMatch[1] : variantId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          
          variants.push({
            id: variantId,
            label,
            description: `Voice variant: ${variantId}`,
            content,
            createdAt: now(),
            updatedAt: now(),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to load voice variants for ${pageId}:`, error);
    }
  }
  
  if (variants.length === 0) {
    return null;
  }
  
  return {
    pageId,
    variants,
  };
}

/**
 * Save variants for a page
 */
export async function saveVariants(variants: PageVariants): Promise<void> {
  ensureDirectories();
  
  await Bun.write(
    `${VARIANTS_DIR}/${variants.pageId}.json`,
    JSON.stringify(variants, null, 2)
  );
}

/**
 * Create a new variant for a page
 */
export async function createVariant(
  request: CreateVariantRequest,
  baseContent: string
): Promise<PageVariant> {
  let variants = await loadVariants(request.pageId);
  
  if (!variants) {
    variants = {
      pageId: request.pageId,
      variants: [],
    };
  }
  
  // Check if variant ID already exists
  if (variants.variants.some(v => v.id === request.id)) {
    throw new Error(`Variant "${request.id}" already exists for page "${request.pageId}"`);
  }
  
  // Determine content to copy
  let content = baseContent;
  if (request.copyFrom) {
    const sourceVariant = variants.variants.find(v => v.id === request.copyFrom);
    if (sourceVariant) {
      content = sourceVariant.content;
    }
  }
  
  const variant: PageVariant = {
    id: request.id,
    label: request.label,
    description: request.description,
    content,
    createdAt: now(),
    updatedAt: now(),
  };
  
  variants.variants.push(variant);
  await saveVariants(variants);
  
  return variant;
}

/**
 * Update a variant's content
 */
export async function updateVariant(
  pageId: string,
  variantId: string,
  content: string
): Promise<PageVariant | null> {
  const variants = await loadVariants(pageId);
  
  if (!variants) {
    return null;
  }
  
  const variant = variants.variants.find(v => v.id === variantId);
  if (!variant) {
    return null;
  }
  
  variant.content = content;
  variant.updatedAt = now();
  
  await saveVariants(variants);
  return variant;
}

/**
 * Delete a variant
 */
export async function deleteVariant(pageId: string, variantId: string): Promise<boolean> {
  const variants = await loadVariants(pageId);
  
  if (!variants) {
    return false;
  }
  
  const index = variants.variants.findIndex(v => v.id === variantId);
  if (index === -1) {
    return false;
  }
  
  variants.variants.splice(index, 1);
  await saveVariants(variants);
  
  return true;
}

/**
 * Get the full editorial state (for API consumption)
 */
export async function getEditorialState(): Promise<EditorialState> {
  ensureDirectories();
  
  const notes = await loadNotes();
  const variants: Record<string, PageVariants> = {};
  
  // Load all variant files
  if (existsSync(VARIANTS_DIR)) {
    const files = readdirSync(VARIANTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const pageId = file.replace('.json', '');
        const pageVariants = await loadVariants(pageId);
        if (pageVariants) {
          variants[pageId] = pageVariants;
        }
      }
    }
  }
  
  return { notes, variants };
}

/**
 * Get summary of notes for AI consumption
 * Returns notes in a format optimized for AI to act on
 */
export async function getNotesForAI(
  pageId?: string,
  includeAddressed: boolean = false
): Promise<string> {
  const notes = await loadNotes();
  
  const filtered = notes.filter(n => {
    if (pageId && n.pageId !== pageId) return false;
    if (!includeAddressed && n.status === 'addressed') return false;
    return true;
  });
  
  if (filtered.length === 0) {
    return pageId 
      ? `No open editorial notes for page "${pageId}".`
      : 'No open editorial notes.';
  }
  
  const lines: string[] = [
    `# Editorial Notes${pageId ? ` for "${pageId}"` : ''}`,
    '',
  ];
  
  // Group by page
  const byPage = new Map<string, EditorialNote[]>();
  for (const note of filtered) {
    const list = byPage.get(note.pageId) || [];
    list.push(note);
    byPage.set(note.pageId, list);
  }
  
  for (const [page, pageNotes] of byPage) {
    lines.push(`## Page: ${page}`);
    lines.push('');
    
    // Sort by priority, then by orphaned status
    const sorted = [...pageNotes].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (!a.anchorValid && b.anchorValid) return -1; // Orphaned first
      if (a.anchorValid && !b.anchorValid) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    for (const note of sorted) {
      const orphanTag = note.anchorValid ? '' : ' [ORPHANED]';
      const variantTag = note.variantId ? ` (variant: ${note.variantId})` : '';
      
      lines.push(`### Note: ${note.id}${orphanTag}${variantTag}`);
      lines.push(`- **Status**: ${note.status}`);
      lines.push(`- **Priority**: ${note.priority}`);
      
      if (note.title) {
        lines.push(`- **Title**: ${note.title}`);
      }
      
      if (note.tags && note.tags.length > 0) {
        lines.push(`- **Tags**: ${note.tags.join(', ')}`);
      }
      
      // Describe anchor
      if (note.anchor.type === 'text-selection') {
        lines.push(`- **Anchored to text**: "${note.anchor.selectedText}"`);
      } else if (note.anchor.type === 'element') {
        lines.push(`- **Anchored to element**: ${note.anchor.anchorId}`);
      } else if (note.anchor.type === 'line') {
        const lineRange = note.anchor.endLine 
          ? `lines ${note.anchor.startLine}-${note.anchor.endLine}`
          : `line ${note.anchor.startLine}`;
        lines.push(`- **Anchored to**: ${lineRange} in source MDX`);
      } else {
        lines.push(`- **Anchored to**: entire page`);
      }
      
      lines.push('');
      lines.push('**Content:**');
      lines.push(note.content);
      lines.push('');
      
      if (note.responses.length > 0) {
        lines.push('**Responses:**');
        for (const response of note.responses) {
          lines.push(`- [${response.author}] ${response.content}`);
          if (response.actionTaken) {
            lines.push(`  Action taken: ${response.actionTaken}`);
          }
        }
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    }
  }
  
  lines.push('');
  lines.push('To mark a note as addressed, update its status to "addressed" and add a response describing what was done.');
  
  return lines.join('\n');
}

