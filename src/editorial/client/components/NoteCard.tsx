/**
 * NoteCard component
 * 
 * Displays a single editorial note with its metadata, content, and actions.
 */

import { useState } from 'preact/hooks';
import type { EditorialNote, NoteStatus } from '../../_types.ts';
import { 
  selectNote, 
  selectedNoteId, 
  updateNote, 
  deleteNote,
  addNoteResponse,
} from '../state.ts';

interface NoteCardProps {
  note: EditorialNote;
  expanded?: boolean;
}

const STATUS_LABELS: Record<NoteStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'addressed': 'Addressed',
  'wont-fix': "Won't Fix",
  'question': 'Question',
};

export function NoteCard({ note, expanded = false }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const isSelected = selectedNoteId.value === note.id;
  
  const handleClick = () => {
    selectNote(note.id);
    setIsExpanded(!isExpanded);
  };
  
  const handleStatusChange = async (status: NoteStatus) => {
    await updateNote(note.id, { status });
    setShowStatusMenu(false);
  };
  
  const handleSaveEdit = async () => {
    await updateNote(note.id, { content: editContent });
    setIsEditing(false);
  };
  
  const handleDelete = async (e: Event) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      await deleteNote(note.id);
    }
  };
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const getAnchorDescription = () => {
    const { anchor } = note;
    switch (anchor.type) {
      case 'text-selection':
        const text = anchor.selectedText;
        return text.length > 50 ? `"${text.slice(0, 50)}..."` : `"${text}"`;
      case 'element':
        return `Element: ${anchor.anchorId}`;
      case 'line':
        return anchor.endLine 
          ? `Lines ${anchor.startLine}-${anchor.endLine}`
          : `Line ${anchor.startLine}`;
      case 'page':
        return 'Page-level note';
    }
  };
  
  return (
    <div 
      className={`editorial-note ${!note.anchorValid ? 'orphaned' : ''} ${isSelected ? 'selected' : ''}`}
      data-status={note.status}
      data-priority={note.priority}
    >
      <div className="editorial-note__header" onClick={handleClick}>
        <span 
          className="editorial-note__priority" 
          data-priority={note.priority}
          title={`Priority: ${note.priority}`}
        />
        <span className="editorial-note__title">
          {note.title || note.content.slice(0, 60) + (note.content.length > 60 ? '...' : '')}
        </span>
      </div>
      
      <div className="editorial-note__meta" style={{ padding: '0 12px 8px' }}>
        <span>{STATUS_LABELS[note.status]}</span>
        <span>·</span>
        <span>{formatDate(note.updatedAt)}</span>
        {note.variantId && (
          <>
            <span>·</span>
            <span>variant: {note.variantId}</span>
          </>
        )}
      </div>
      
      {isExpanded && (
        <>
          <div className="editorial-note__body">
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent((e.target as HTMLTextAreaElement).value)}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    fontSize: '13px',
                    background: 'var(--editorial-bg)',
                    color: 'var(--editorial-text)',
                    border: '1px solid var(--editorial-accent)',
                    borderRadius: '4px',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    className="editorial-note__btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="editorial-note__btn"
                    onClick={handleSaveEdit}
                    style={{ background: 'var(--editorial-accent)', color: 'white' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{note.content}</p>
            )}
          </div>
          
          <div className={`editorial-note__anchor-info ${!note.anchorValid ? 'invalid' : ''}`}>
            {!note.anchorValid && '⚠️ '}
            {getAnchorDescription()}
          </div>
          
          {/* Responses */}
          {note.responses.length > 0 && (
            <div className="editorial-note__responses">
              {note.responses.map(response => (
                <div key={response.id} className="editorial-response">
                  <div className="editorial-response__header">
                    <span 
                      className="editorial-response__author" 
                      data-author={response.author.toLowerCase()}
                    >
                      {response.author}
                    </span>
                    <span className="editorial-response__time">
                      {formatDate(response.timestamp)}
                    </span>
                  </div>
                  <div className="editorial-response__content">
                    {response.content}
                  </div>
                  {response.actionTaken && (
                    <div className="editorial-response__action">
                      Action: {response.actionTaken}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="editorial-note__actions">
            <button 
              className="editorial-note__btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              Edit
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                className="editorial-note__btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
              >
                Status ▾
              </button>
              
              {showStatusMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  background: 'var(--editorial-bg)',
                  border: '1px solid var(--editorial-surface)',
                  borderRadius: '4px',
                  padding: '4px',
                  zIndex: 10,
                  minWidth: '120px',
                }}>
                  {(Object.keys(STATUS_LABELS) as NoteStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(status);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        fontSize: '12px',
                        background: note.status === status ? 'var(--editorial-surface)' : 'transparent',
                        color: 'var(--editorial-text)',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="editorial-note__btn editorial-note__btn--delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

