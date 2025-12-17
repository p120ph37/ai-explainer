/**
 * Question component
 * 
 * Left-margin aside for deeper questions and philosophical tangents.
 * Lives in the left margin on desktop, expands into main flow.
 * 
 * Content is always rendered for SSR, hidden/shown via CSS.
 */

import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useCollapsible } from '@/app/hooks/useCollapsible.ts';

// ============================================
// STYLES (Griffel - all styles in one place)
// ============================================

const useStyles = makeStyles({
  // Base aside - mobile first (in-flow)
  root: {
    position: 'relative',
    marginBlockStart: 'var(--space-md)',
    marginBlockEnd: 'var(--space-md)',
  },
  
  // Desktop: Position in LEFT margin when collapsed
  rootDesktop: {
    '@media (min-width: 1200px)': {
      position: 'absolute',
      right: 'calc(100% + var(--space-lg))',
      width: '280px',
      marginBlock: 0,
      // Deoverlap offset set by MarginDeoverlap.tsx
      transform: 'translateY(var(--deoverlap-offset, 0))',
      transitionProperty: 'transform',
      transitionDuration: 'var(--duration-normal, 200ms)',
      transitionTimingFunction: 'var(--ease-out)',
    },
  },
  
  // Open state - always in main flow
  rootOpen: {
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-question-subtle)',
    overflow: 'hidden',
    
    '@media (min-width: 1200px)': {
      position: 'relative',
      right: 'auto',
      width: '100%',
      marginBlock: 'var(--space-md)',
      animationName: {
        from: { 
          opacity: 0.8,
          transform: 'translateX(-20px)',
        },
        to: { 
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
      animationDuration: 'var(--duration-normal, 200ms)',
      animationTimingFunction: 'var(--ease-out)',
    },
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
    // Paragraph margins
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
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
  const { isOpen, triggerProps, rootProps } = useCollapsible({
    type: 'question',
  });
  const styles = useStyles();
  
  return (
    <aside 
      {...rootProps}
      className={mergeClasses(
        'question', // Keep base class for parent CSS Grid positioning reference
        styles.root,
        !isOpen && styles.rootDesktop,
        isOpen && styles.rootOpen
      )}
    >
      <button
        type="button"
        className={mergeClasses(
          styles.trigger,
          isOpen && styles.triggerOpen
        )}
        {...triggerProps}
        aria-label={isOpen ? 'Close question' : titleText}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9a3 3 0 1 1 4 2.83c-.5.29-1 .84-1 1.42V14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className={styles.title}>{titleText}</span>
        <span className={mergeClasses(
          styles.chevron,
          isOpen && styles.chevronOpen
        )} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {/* Always render content for SSR, hide via CSS */}
      <div className={mergeClasses(
        styles.content,
        !isOpen && styles.contentHidden
      )}>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </aside>
  );
}
