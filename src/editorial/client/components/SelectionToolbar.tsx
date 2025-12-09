/**
 * SelectionToolbar component
 * 
 * A floating toolbar that appears when text is selected in the content.
 * Allows the user to create a note anchored to the selection.
 */

import { selectionToolbarPosition, hideSelectionToolbar, startNoteCreation, pendingSelection } from '../state.ts';
import type { TextSelectionAnchor } from '../../_types.ts';

export function SelectionToolbar() {
  const position = selectionToolbarPosition.value;
  
  if (!position) return null;
  
  const handleAddNote = () => {
    const selection = pendingSelection.value;
    if (selection) {
      startNoteCreation(selection, {
        x: position.x,
        y: position.y + 40, // Below the toolbar
      });
    }
  };
  
  return (
    <div 
      className="editorial-selection-toolbar"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <button 
        className="editorial-selection-toolbar__btn"
        onClick={handleAddNote}
      >
        📝 Add Note
      </button>
      <button 
        className="editorial-selection-toolbar__btn"
        onClick={hideSelectionToolbar}
      >
        ✕
      </button>
    </div>
  );
}

