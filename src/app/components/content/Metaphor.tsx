/**
 * Metaphor component
 * 
 * Margin note for metaphorical/visual explanations.
 * Lives in the right margin on desktop, expands into main flow.
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
  
  // Desktop: Position in RIGHT margin when collapsed
  rootDesktop: {
    '@media (min-width: 1200px)': {
      position: 'absolute',
      left: 'calc(100% + var(--space-lg))',
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
    backgroundColor: 'var(--color-metaphor-subtle)',
    overflow: 'hidden',
    
    '@media (min-width: 1200px)': {
      position: 'relative',
      left: 'auto',
      width: '100%',
      marginBlock: 'var(--space-md)',
      animationName: {
        from: { 
          opacity: 0.8,
          transform: 'translateX(20px)',
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

interface MetaphorProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export function Metaphor({ title, children }: MetaphorProps) {
  const { isOpen, triggerProps, rootProps } = useCollapsible({
    type: 'metaphor',
  });
  const styles = useStyles();
  
  return (
    <aside 
      {...rootProps}
      className={mergeClasses(
        'metaphor', // Keep base class for parent CSS Grid positioning reference
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
        aria-label={isOpen ? 'Close metaphor' : title}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <span className={styles.title}>{title}</span>
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
