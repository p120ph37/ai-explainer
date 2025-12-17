/**
 * CreateNotePopover component
 * 
 * A popover form for creating a new editorial note attached to a text selection.
 * Fixed position and draggable.
 */

import { useState, useRef, useEffect } from 'preact/hooks';
import {
  isCreatingNote,
  pendingSelection,
  createPopoverPosition,
  cancelNoteCreation,
  createNote,
} from '@/editorial/client/state.ts';
import type { NotePriority } from '@/editorial/_types.ts';

const PRIORITY_OPTIONS: { value: NotePriority; label: string }[] = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

export function CreateNotePopover() {
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<NotePriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const initialPosition = createPopoverPosition.value;
  const selection = pendingSelection.value;
  
  // Reset position when popover opens with new initial position
  useEffect(() => {
    if (initialPosition && isCreatingNote.value) {
      // Center horizontally in viewport, position near top
      const x = Math.max(20, Math.min(initialPosition.x - 150, window.innerWidth - 340));
      const y = Math.max(80, Math.min(initialPosition.y, window.innerHeight - 350));
      setCurrentPosition({ x, y });
    }
  }, [initialPosition?.x, initialPosition?.y, isCreatingNote.value]);
  
  // Handle drag
  useEffect(() => {
    if (!dragOffset) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 320));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
      setCurrentPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setDragOffset(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragOffset]);
  
  if (!isCreatingNote.value || !initialPosition || !selection || !currentPosition) return null;
  
  const handleCreate = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createNote({
        content: content.trim(),
        priority,
      });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    cancelNoteCreation();
    setContent('');
  };
  
  const handleDragStart = (e: MouseEvent) => {
    if (!popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };
  
  const style: Record<string, string> = {
    left: `${currentPosition.x}px`,
    top: `${currentPosition.y}px`,
  };
  
  return (
    <div 
      ref={popoverRef}
      className="editorial-create-popover"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="editorial-create-popover__header"
        onMouseDown={handleDragStart}
        style={{ cursor: dragOffset ? 'grabbing' : 'grab' }}
      >
        <span className="editorial-create-popover__drag-hint">⋮⋮</span>
        Add Editorial Note
      </div>
      
      <div className="editorial-create-popover__selection">
        "{selection.selectedText.length > 100 
          ? selection.selectedText.slice(0, 100) + '...' 
          : selection.selectedText}"
      </div>
      
      <textarea
        className="editorial-create-popover__textarea"
        value={content}
        onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
        placeholder="What should be changed, added, or explored here?"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleCreate();
          }
          if (e.key === 'Escape') {
            handleCancel();
          }
        }}
      />
      
      <div className="editorial-create-popover__options">
        <select
          className="editorial-create-popover__select"
          value={priority}
          onChange={(e) => setPriority((e.target as HTMLSelectElement).value as NotePriority)}
        >
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      <div className="editorial-create-popover__actions">
        <button 
          className="editorial-create-popover__btn editorial-create-popover__btn--cancel"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          className="editorial-create-popover__btn editorial-create-popover__btn--create"
          onClick={handleCreate}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Creating...' : 'Create Note'}
        </button>
      </div>
    </div>
  );
}

