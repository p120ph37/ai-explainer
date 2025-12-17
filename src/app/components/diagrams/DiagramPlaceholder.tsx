/**
 * Placeholder for planned interactive toys/diagrams
 * 
 * Shows a visual indicator that an interactive element is planned here.
 */

import { makeStyles } from '@griffel/react';

const useStyles = makeStyles({
  placeholder: {
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    paddingTop: 'var(--space-lg)',
    paddingBottom: 'var(--space-lg)',
    paddingLeft: 'var(--space-lg)',
    paddingRight: 'var(--space-lg)',
    backgroundColor: 'var(--color-surface)',
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2rem',
    marginBottom: 'var(--space-sm)',
    opacity: 0.6,
  },
  title: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-2xs)',
  },
  description: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-subtle)',
  },
});

interface DiagramPlaceholderProps {
  /** ID of the planned toy from the backlog */
  toyId: string;
  /** Human-readable title */
  title: string;
  /** Brief description of what will go here */
  description?: string;
  /** Icon to display */
  icon?: string;
}

export function DiagramPlaceholder({
  toyId,
  title,
  description,
  icon = '🔧',
}: DiagramPlaceholderProps) {
  const styles = useStyles();
  
  return (
    <div className={styles.placeholder} data-toy-id={toyId}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      {description && (
        <div className={styles.description}>{description}</div>
      )}
    </div>
  );
}

