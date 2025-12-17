/**
 * EditorialPanel component
 * 
 * The main sidebar panel for editorial mode, containing:
 * - Variant switcher
 * - Note filters
 * - Orphaned notes section
 * - Note list
 */

import { useState } from 'preact/hooks';
import { NoteCard } from '@/editorial/client/components/NoteCard.tsx';
import {
  panelOpen,
  closePanel,
  orphanedNotes,
  anchoredNotes,
  availableVariants,
  currentVariantId,
  switchVariant,
  createVariant,
  statusFilter,
  priorityFilter,
  isLoading,
  errorMessage,
  clearError,
  createPageNote,
} from '@/editorial/client/state.ts';
import type { NoteStatus, NotePriority } from '@/editorial/_types.ts';

const STATUS_OPTIONS: { value: NoteStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'question', label: 'Question' },
  { value: 'addressed', label: 'Addressed' },
  { value: 'wont-fix', label: "Won't Fix" },
];

const PRIORITY_OPTIONS: { value: NotePriority; label: string }[] = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

export function EditorialPanel() {
  const [showNewVariantForm, setShowNewVariantForm] = useState(false);
  const [newVariantId, setNewVariantId] = useState('');
  const [newVariantLabel, setNewVariantLabel] = useState('');
  const [showNewPageNote, setShowNewPageNote] = useState(false);
  const [pageNoteContent, setPageNoteContent] = useState('');
  const [pageNotePriority, setPageNotePriority] = useState<NotePriority>('medium');
  
  const handleCreateVariant = async () => {
    if (!newVariantId || !newVariantLabel) return;
    
    await createVariant(newVariantId, newVariantLabel);
    setNewVariantId('');
    setNewVariantLabel('');
    setShowNewVariantForm(false);
  };
  
  const handleCreatePageNote = async () => {
    if (!pageNoteContent.trim()) return;
    
    await createPageNote({
      content: pageNoteContent,
      priority: pageNotePriority,
    });
    
    setPageNoteContent('');
    setShowNewPageNote(false);
  };
  
  const toggleStatus = (status: NoteStatus) => {
    const current = statusFilter.value;
    if (current.includes(status)) {
      statusFilter.value = current.filter(s => s !== status);
    } else {
      statusFilter.value = [...current, status];
    }
  };
  
  const togglePriority = (priority: NotePriority) => {
    const current = priorityFilter.value;
    if (current.includes(priority)) {
      priorityFilter.value = current.filter(p => p !== priority);
    } else {
      priorityFilter.value = [...current, priority];
    }
  };
  
  const orphaned = orphanedNotes.value;
  const anchored = anchoredNotes.value;
  const variants = availableVariants.value;
  const activeVariant = currentVariantId.value;
  
  return (
    <aside className={`editorial-panel ${panelOpen.value ? 'open' : ''}`}>
      <div className="editorial-panel__header">
        <h2 className="editorial-panel__title">Editorial Notes</h2>
        <button className="editorial-panel__close" onClick={closePanel}>
          ✕
        </button>
      </div>
      
      {/* Variant Switcher */}
      <div className="variant-switcher">
        <div className="variant-switcher__label">Content Variant</div>
        <div className="variant-switcher__tabs">
          {variants.map(v => (
            <button
              key={v.id ?? 'base'}
              className={`variant-tab ${activeVariant === v.id ? 'active' : ''}`}
              onClick={() => switchVariant(v.id)}
            >
              {v.label}
            </button>
          ))}
          <button 
            className="variant-tab variant-tab--add"
            onClick={() => setShowNewVariantForm(true)}
          >
            + Add
          </button>
        </div>
        
        {showNewVariantForm && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Variant ID (e.g., 'b', 'alt-1')"
              value={newVariantId}
              onChange={(e) => setNewVariantId((e.target as HTMLInputElement).value)}
              style={{
                padding: '8px',
                fontSize: '12px',
                background: 'var(--editorial-surface)',
                color: 'var(--editorial-text)',
                border: 'none',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              placeholder="Label (e.g., 'Alternative Approach')"
              value={newVariantLabel}
              onChange={(e) => setNewVariantLabel((e.target as HTMLInputElement).value)}
              style={{
                padding: '8px',
                fontSize: '12px',
                background: 'var(--editorial-surface)',
                color: 'var(--editorial-text)',
                border: 'none',
                borderRadius: '4px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowNewVariantForm(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  background: 'var(--editorial-surface)',
                  color: 'var(--editorial-text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVariant}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '12px',
                  background: 'var(--editorial-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="editorial-filters">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`editorial-filter-chip ${statusFilter.value.includes(opt.value) ? 'active' : ''}`}
            onClick={() => toggleStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      
      {/* Error message */}
      {errorMessage.value && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--editorial-critical)',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{errorMessage.value}</span>
          <button 
            onClick={clearError}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="editorial-panel__content">
        {isLoading.value ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--editorial-text-muted)' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Orphaned Notes */}
            {orphaned.length > 0 && (
              <div className="orphaned-notes">
                <div className="orphaned-notes__header">
                  <span className="orphaned-notes__icon">⚠️</span>
                  <span className="orphaned-notes__title">Orphaned Notes</span>
                  <span className="orphaned-notes__count">{orphaned.length}</span>
                </div>
                <div className="orphaned-notes__list">
                  {orphaned.map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Page Note Button */}
            {!showNewPageNote ? (
              <button
                onClick={() => setShowNewPageNote(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  background: 'transparent',
                  color: 'var(--editorial-text-muted)',
                  border: '1px dashed var(--editorial-text-muted)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                + Add Page-Level Note
              </button>
            ) : (
              <div style={{
                background: 'var(--editorial-surface)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <textarea
                  value={pageNoteContent}
                  onChange={(e) => setPageNoteContent((e.target as HTMLTextAreaElement).value)}
                  placeholder="Enter your editorial note..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    fontSize: '13px',
                    background: 'var(--editorial-bg)',
                    color: 'var(--editorial-text)',
                    border: 'none',
                    borderRadius: '4px',
                    resize: 'vertical',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={pageNotePriority}
                    onChange={(e) => setPageNotePriority((e.target as HTMLSelectElement).value as NotePriority)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '12px',
                      background: 'var(--editorial-bg)',
                      color: 'var(--editorial-text)',
                      border: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => setShowNewPageNote(false)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'var(--editorial-bg)',
                      color: 'var(--editorial-text-muted)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePageNote}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'var(--editorial-accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
            
            {/* Anchored Notes */}
            {anchored.length > 0 ? (
              anchored.map(note => (
                <NoteCard key={note.id} note={note} />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px', 
                color: 'var(--editorial-text-muted)',
                fontSize: '13px',
              }}>
                <p>No notes yet.</p>
                <p style={{ marginTop: '8px', fontSize: '12px' }}>
                  Select text in the content to add a note.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

