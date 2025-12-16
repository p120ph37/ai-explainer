/**
 * Metaphor component
 * 
 * Margin note for metaphorical/visual explanations.
 * Lives in the right margin on desktop, expands into main flow.
 * 
 * Content is always rendered for SSR, hidden/shown via CSS.
 */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStylesBase = makeStyles({
  metaphor: {
    position: 'relative',
    marginBlockStart: 'var(--space-md)',
    marginBlockEnd: 'var(--space-md)',
  },
  
  metaphorOpen: {
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-metaphor-subtle)',
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
    backgroundColor: 'var(--color-metaphor-subtle)',
    border: '1px dashed var(--color-metaphor)',
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
      borderColor: 'var(--color-metaphor)',
      color: 'var(--color-metaphor)',
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
    backgroundColor: 'var(--color-metaphor-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-metaphor)',
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
    color: 'var(--color-text-muted)',
  },
});

// ============================================
// COMPONENT
// ============================================

interface MetaphorProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export function Metaphor({ title, children }: MetaphorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const styles = useStylesBase();
  
  return (
    <aside className={mergeClasses(
      'metaphor', // BEM class for margin de-overlap system + enhance
      styles.metaphor,
      isOpen && styles.metaphorOpen,
      isOpen && 'metaphor--open'
    )}>
      <button
        type="button"
        className={mergeClasses(
          'metaphor__trigger',
          styles.trigger,
          isOpen && styles.triggerOpen
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close metaphor' : title}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <span className={mergeClasses('metaphor__title', styles.title)}>{title}</span>
        <span className={mergeClasses(
          'metaphor__chevron',
          styles.chevron,
          isOpen && styles.chevronOpen,
          isOpen && 'metaphor__chevron--open'
        )} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {/* Always render content for SSR, hide via CSS */}
      <div className={mergeClasses(
        'metaphor__content',
        styles.content,
        !isOpen && styles.contentHidden,
        !isOpen && 'metaphor__content--hidden'
      )}>
        <div className={mergeClasses('metaphor__body', styles.body)}>
          {children}
        </div>
      </div>
    </aside>
  );
}
