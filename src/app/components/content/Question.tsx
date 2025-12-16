/**
 * Question component
 * 
 * Left-margin aside for deeper questions and philosophical tangents.
 * Lives in the left margin on desktop, expands into main flow.
 * 
 * Content is always rendered for SSR, hidden/shown via CSS.
 */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';

// ============================================
// STYLES (Griffel - zero runtime after AOT)
// ============================================

const useStylesBase = makeStyles({
  question: {
    position: 'relative',
    marginBlockStart: 'var(--space-md)',
    marginBlockEnd: 'var(--space-md)',
  },
  
  questionOpen: {
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-question-subtle)',
    overflow: 'hidden',
  },
  
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-question-subtle)',
    border: '1px dashed var(--color-question)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      borderColor: 'var(--color-question)',
      color: 'var(--color-question)',
    },
  },
  
  triggerOpen: {
    borderTopLeftRadius: 'var(--radius-md)',
    borderTopRightRadius: 'var(--radius-md)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'transparent',
  },
  
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'var(--color-question-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-question)',
  },
  
  title: {
    flexGrow: 1,
    fontWeight: 500,
  },
  
  chevron: {
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  
  content: {
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
  },
  
  contentHidden: {
    display: 'none',
  },
  
  body: {
    // First/last paragraph margins handled via global CSS
  },
});

// ============================================
// COMPONENT
// ============================================

interface QuestionProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export function Question({ title: titleText, children }: QuestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const styles = useStylesBase();
  
  return (
    <aside className={mergeClasses(
      'question', // BEM class for margin de-overlap system + enhance
      styles.question,
      isOpen && styles.questionOpen,
      isOpen && 'question--open'
    )}>
      <button
        type="button"
        className={mergeClasses(
          'question__trigger',
          styles.trigger,
          isOpen && styles.triggerOpen
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close question' : titleText}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9a3 3 0 1 1 4 2.83c-.5.29-1 .84-1 1.42V14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className={mergeClasses('question__title', styles.title)}>{titleText}</span>
        <span className={mergeClasses(
          'question__chevron',
          styles.chevron,
          isOpen && styles.chevronOpen,
          isOpen && 'question__chevron--open'
        )} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {/* Always render content for SSR, hide via CSS */}
      <div className={mergeClasses(
        'question__content',
        styles.content,
        !isOpen && styles.contentHidden,
        !isOpen && 'question__content--hidden'
      )}>
        <div className={mergeClasses('question__body', styles.body)}>
          {children}
        </div>
      </div>
    </aside>
  );
}
