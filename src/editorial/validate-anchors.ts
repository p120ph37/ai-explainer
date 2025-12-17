/**
 * Anchor validation utility
 * 
 * Validates that editorial note anchors still match the content.
 * Marks notes as orphaned if their anchor text can no longer be found.
 * 
 * Run with: bun src/editorial/validate-anchors.ts
 */

import { readFileSync, existsSync } from 'fs';
import { loadNotes, saveNotes, markAnchorInvalid } from '@/editorial/persistence.ts';
import type { EditorialNote, TextSelectionAnchor } from '@/editorial/_types.ts';

const CONTENT_DIR = 'src/content';

/**
 * Get the content file path for a page ID
 * Files are directly at src/content/{id}.mdx
 */
function getContentFilePath(pageId: string): string {
  return `${CONTENT_DIR}/${pageId}.mdx`;
}

/**
 * Get the raw text content from an MDX file (stripping MDX/JSX elements)
 */
function getMdxTextContent(mdxPath: string): string {
  if (!existsSync(mdxPath)) {
    return '';
  }
  
  const content = readFileSync(mdxPath, 'utf-8');
  
  // Remove frontmatter
  let text = content.replace(/^---[\s\S]*?---\n/, '');
  
  // Remove import statements
  text = text.replace(/^import .+$/gm, '');
  
  // Remove JSX tags (simplified - keeps text content)
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Check if a text selection anchor is still valid
 */
function validateTextSelectionAnchor(
  anchor: TextSelectionAnchor,
  content: string
): { valid: boolean; reason?: string } {
  const { selectedText, contextBefore, contextAfter } = anchor;
  
  // Try exact match first
  if (content.includes(selectedText)) {
    return { valid: true };
  }
  
  // Try fuzzy match with context
  if (contextBefore && contextAfter) {
    const contextPattern = `${contextBefore}${selectedText}${contextAfter}`;
    // Normalize both for comparison
    const normalizedContent = content.replace(/\s+/g, ' ');
    const normalizedPattern = contextPattern.replace(/\s+/g, ' ');
    
    if (normalizedContent.includes(normalizedPattern)) {
      return { valid: true };
    }
  }
  
  // Try just the selected text with normalized whitespace
  const normalizedContent = content.replace(/\s+/g, ' ');
  const normalizedText = selectedText.replace(/\s+/g, ' ');
  
  if (normalizedContent.includes(normalizedText)) {
    return { valid: true };
  }
  
  return { 
    valid: false, 
    reason: `Text "${selectedText.slice(0, 50)}..." not found in content` 
  };
}

/**
 * Validate all notes and mark orphaned ones
 */
export async function validateAllAnchors(): Promise<{
  total: number;
  valid: number;
  orphaned: number;
  orphanedNotes: Array<{ id: string; pageId: string; reason: string }>;
}> {
  const notes = await loadNotes();
  const orphanedNotes: Array<{ id: string; pageId: string; reason: string }> = [];
  let updated = false;
  
  for (const note of notes) {
    // Skip already orphaned notes
    if (!note.anchorValid) {
      continue;
    }
    
    // Skip page-level notes (always valid)
    if (note.anchor.type === 'page') {
      continue;
    }
    
    // Get the content file path (direct: src/content/{id}.mdx)
    const fullPath = getContentFilePath(note.pageId);
    
    if (!existsSync(fullPath)) {
      note.anchorValid = false;
      orphanedNotes.push({ 
        id: note.id, 
        pageId: note.pageId, 
        reason: `Content file not found: ${fullPath}` 
      });
      updated = true;
      continue;
    }
    
    const content = getMdxTextContent(fullPath);
    
    if (!content) {
      note.anchorValid = false;
      orphanedNotes.push({ 
        id: note.id, 
        pageId: note.pageId, 
        reason: `Content file empty: ${fullPath}` 
      });
      updated = true;
      continue;
    }
    
    // Validate based on anchor type
    if (note.anchor.type === 'text-selection') {
      const result = validateTextSelectionAnchor(note.anchor, content);
      if (!result.valid) {
        note.anchorValid = false;
        orphanedNotes.push({ 
          id: note.id, 
          pageId: note.pageId, 
          reason: result.reason || 'Anchor text not found' 
        });
        updated = true;
      }
    } else if (note.anchor.type === 'line') {
      // For line anchors, just check if the file exists and has enough lines
      const lines = readFileSync(fullPath, 'utf-8').split('\n');
      if (note.anchor.startLine > lines.length) {
        note.anchorValid = false;
        orphanedNotes.push({ 
          id: note.id, 
          pageId: note.pageId, 
          reason: `Line ${note.anchor.startLine} exceeds file length (${lines.length} lines)` 
        });
        updated = true;
      }
    }
  }
  
  // Save if any notes were updated
  if (updated) {
    await saveNotes(notes);
  }
  
  const validCount = notes.filter(n => n.anchorValid).length;
  
  return {
    total: notes.length,
    valid: validCount,
    orphaned: orphanedNotes.length,
    orphanedNotes,
  };
}

// Run if called directly
if (import.meta.main) {
  console.log('Validating editorial note anchors...\n');
  
  validateAllAnchors().then(result => {
    console.log(`Total notes: ${result.total}`);
    console.log(`Valid anchors: ${result.valid}`);
    console.log(`Orphaned: ${result.orphaned}`);
    
    if (result.orphanedNotes.length > 0) {
      console.log('\nOrphaned notes:');
      for (const note of result.orphanedNotes) {
        console.log(`  - [${note.pageId}] ${note.id}: ${note.reason}`);
      }
    } else {
      console.log('\nAll anchors are valid! ✓');
    }
  });
}
