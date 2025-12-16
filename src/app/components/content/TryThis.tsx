/**
 * Try This block component
 * 
 * Provides actionable experiments for the user.
 */

import type { JSX } from 'preact';
import { makeStyles } from '@griffel/react';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStylesBase = makeStyles({
  tryThis: {
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    borderRadius: 'var(--radius-md)',
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderLeft: '3px solid var(--color-accent)',
  },
  
  label: {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 'var(--space-xs)',
    color: 'var(--color-accent)',
  },
  
  content: {},
});

// ============================================
// COMPONENT
// ============================================

interface TryThisProps {
  children: JSX.Element | JSX.Element[];
}

export function TryThis({ children }: TryThisProps) {
  const styles = useStylesBase();
  
  return (
    <aside className={styles.tryThis}>
      <span className={styles.label}>🧪 Try This</span>
      <div className={styles.content}>
        {children}
      </div>
    </aside>
  );
}
