/**
 * CreateNotePopover component
 * 
 * A popover form for creating a new editorial note attached to a text selection.
 */

import { useState } from 'preact/hooks';
import {
  isCreatingNote,
  pendingSelection,
  createPopoverPosition,
  cancelNoteCreation,
  createNote,
} from '../state.ts';
import type { NotePriority } from '../../_types.ts';

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
  
  const position = createPopoverPosition.value;
  const selection = pendingSelection.value;
  
  if (!isCreatingNote.value || !position || !selection) return null;
  
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
  
  // Calculate position, ensuring it stays within viewport
  const style: Record<string, string> = {
    left: `${Math.min(position.x, window.innerWidth - 320)}px`,
    top: `${Math.min(position.y, window.innerHeight - 300)}px`,
  };
  
  return (
    <div 
      className="editorial-create-popover"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="editorial-create-popover__header">
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

