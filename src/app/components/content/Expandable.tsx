/**
 * Expandable section component
 * 
 * Used for progressive disclosure of deeper detail.
 */

import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useCollapsible } from '@/app/hooks/useCollapsible.ts';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStylesBase = makeStyles({
  expandable: {
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  
  expandableStacked: {
    marginTop: 'var(--space-sm)',
  },
  
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--color-text)',
    textAlign: 'left',
    listStyleType: 'none',
    transitionProperty: 'background',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover': {
      backgroundColor: 'var(--color-bg-muted)',
    },
    // Hide default marker
    '::-webkit-details-marker': {
      display: 'none',
    },
  },
  
  triggerAdvanced: {
    backgroundColor: 'var(--color-accent-subtle)',
  },
  
  icon: {
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  
  iconOpen: {
    transform: 'rotate(180deg)',
  },
  
  content: {
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  
  contentHidden: {
    display: 'none',
  },
});

// ============================================
// COMPONENT
// ============================================

interface ExpandableProps {
  title: string;
  level?: 'standard' | 'advanced';
  defaultOpen?: boolean;
  children: JSX.Element | JSX.Element[];
}

export function Expandable({ 
  title, 
  level = 'standard', 
  defaultOpen = false,
  children 
}: ExpandableProps) {
  const { isOpen, toggle, rootProps } = useCollapsible({
    type: 'expandable',
    defaultOpen,
  });
  const styles = useStylesBase();
  
  return (
    <details 
      {...rootProps}
      className={mergeClasses(
        'expandable',
        styles.expandable,
        level === 'advanced' && 'expandable--advanced'
      )}
      open={isOpen}
      onToggle={(e) => {
        const newOpen = (e.target as HTMLDetailsElement).open;
        if (newOpen !== isOpen) toggle();
      }}
    >
      <summary className={mergeClasses(
        styles.trigger,
        level === 'advanced' && styles.triggerAdvanced
      )}>
        <span>{level === 'advanced' ? `🔬 ${title}` : title}</span>
        <svg 
          className={mergeClasses(
            styles.icon,
            isOpen && styles.iconOpen
          )}
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </summary>
      <div className={mergeClasses(
        styles.content,
        !isOpen && styles.contentHidden
      )}>
        {children}
      </div>
    </details>
  );
}
