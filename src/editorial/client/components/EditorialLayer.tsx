/**
 * EditorialLayer component
 * 
 * The main wrapper component for editorial mode. This component:
 * - Renders the editorial panel, toolbar, and popovers
 * - Listens for text selection events
 * - Manages the floating action button
 * - Initializes editorial state when page changes
 */

import { useEffect } from 'preact/hooks';
import { EditorialPanel } from './EditorialPanel.tsx';
import { SelectionToolbar } from './SelectionToolbar.tsx';
import { CreateNotePopover } from './CreateNotePopover.tsx';
import {
  isEditorialMode,
  loadPageData,
  togglePanel,
  openNotesCount,
  showSelectionToolbar,
  hideSelectionToolbar,
  pendingSelection,
  isCreatingNote,
  cancelNoteCreation,
} from '../state.ts';
import type { TextSelectionAnchor } from '../../_types.ts';

interface EditorialLayerProps {
  pageId: string;
}

/**
 * Get the text offset within the content body
 */
function getTextOffset(container: Element, node: Node, offset: number): number {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let totalOffset = 0;
  let currentNode: Node | null;
  
  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return totalOffset + offset;
    }
    totalOffset += currentNode.textContent?.length || 0;
  }
  
  return totalOffset;
}

/**
 * Get surrounding context for a selection
 */
function getSurroundingContext(text: string, start: number, end: number, contextLength = 50): { before: string; after: string } {
  const before = text.slice(Math.max(0, start - contextLength), start);
  const after = text.slice(end, end + contextLength);
  return { before, after };
}

/**
 * Create a TextSelectionAnchor from a browser Selection
 */
function createSelectionAnchor(selection: Selection, contentBody: Element): TextSelectionAnchor | null {
  if (selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  const selectedText = selection.toString().trim();
  
  if (!selectedText) return null;
  
  // Check if selection is within the content body
  if (!contentBody.contains(range.commonAncestorContainer)) {
    return null;
  }
  
  // Calculate offsets
  const startOffset = getTextOffset(contentBody, range.startContainer, range.startOffset);
  const endOffset = getTextOffset(contentBody, range.endContainer, range.endOffset);
  
  // Get full text content for context
  const fullText = contentBody.textContent || '';
  const { before, after } = getSurroundingContext(fullText, startOffset, endOffset);
  
  // Get CSS selector path to container
  const containerPath = getContainerPath(range.commonAncestorContainer);
  
  return {
    type: 'text-selection',
    selectedText,
    startOffset,
    endOffset,
    containerPath,
    contextBefore: before,
    contextAfter: after,
  };
}

/**
 * Get a CSS selector path to an element
 */
function getContainerPath(node: Node): string {
  const parts: string[] = [];
  let current: Node | null = node;
  
  while (current && current !== document.body) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as Element;
      let selector = el.tagName.toLowerCase();
      
      if (el.id) {
        selector += `#${el.id}`;
      } else if (el.className) {
        const classes = el.className.split(' ').filter(c => c && !c.startsWith('editorial-'));
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      parts.unshift(selector);
    }
    current = current.parentNode;
  }
  
  return parts.join(' > ');
}

export function EditorialLayer({ pageId }: EditorialLayerProps) {
  // Don't render anything if not in editorial mode
  if (!isEditorialMode()) {
    return null;
  }
  
  // Load editorial data when page changes
  useEffect(() => {
    loadPageData(pageId);
  }, [pageId]);
  
  // Handle text selection
  useEffect(() => {
    let selectionTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleSelectionChange = () => {
      // Clear any pending timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      
      // Don't show toolbar if we're creating a note
      if (isCreatingNote.value) {
        return;
      }
      
      // Debounce to avoid flickering
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideSelectionToolbar();
          return;
        }
        
        const contentBody = document.querySelector('.content-node__body');
        if (!contentBody) {
          hideSelectionToolbar();
          return;
        }
        
        const anchor = createSelectionAnchor(selection, contentBody);
        if (!anchor) {
          hideSelectionToolbar();
          return;
        }
        
        // Store the pending selection
        pendingSelection.value = anchor;
        
        // Position toolbar above the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        showSelectionToolbar({
          x: rect.left + rect.width / 2,
          y: rect.top - 10 + window.scrollY,
        });
      }, 200);
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, []);
  
  // Handle click outside to cancel note creation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      
      // Don't cancel if clicking on editorial UI
      if (target.closest('.editorial-create-popover') || 
          target.closest('.editorial-selection-toolbar') ||
          target.closest('.editorial-panel')) {
        return;
      }
      
      // Cancel note creation if we're in that mode
      if (isCreatingNote.value) {
        cancelNoteCreation();
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const noteCount = openNotesCount.value;
  
  return (
    <>
      {/* Editorial Panel (sidebar) */}
      <EditorialPanel />
      
      {/* Selection Toolbar */}
      <SelectionToolbar />
      
      {/* Create Note Popover */}
      <CreateNotePopover />
      
      {/* Floating Action Button */}
      <button 
        className="editorial-fab"
        onClick={togglePanel}
        title="Toggle Editorial Panel"
      >
        📝
        {noteCount > 0 && (
          <span className="editorial-fab__badge">{noteCount}</span>
        )}
      </button>
    </>
  );
}

