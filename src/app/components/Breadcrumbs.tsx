/**
 * Breadcrumbs component
 * 
 * Shows the path through the concept hierarchy.
 */

import { makeStyles } from '@griffel/react';
import { navigateTo } from '@/app/router.ts';
import { getNodeMeta } from '@/lib/content.ts';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  breadcrumbs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-2xs)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-md)',
  },
  
  separator: {
    color: 'var(--color-text-subtle)',
  },
  
  link: {
    color: 'var(--color-text-muted)',
  },
  
  current: {
    color: 'var(--color-text)',
  },
});

// ============================================
// COMPONENT
// ============================================

interface BreadcrumbsProps {
  path: string[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const styles = useStyles();
  
  if (path.length <= 1) {
    return null;
  }
  
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      {path.map((nodeId, index) => {
        const meta = getNodeMeta(nodeId);
        const isLast = index === path.length - 1;
        const title = meta?.title || nodeId;
        
        return (
          <>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">
                →
              </span>
            )}
            {isLast ? (
              <span className={styles.current} aria-current="page">
                {title}
              </span>
            ) : (
              <a 
                href={`/${nodeId}`}
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Use the router's navigateTo for proper state handling
                  navigateTo(nodeId, { replace: false });
                }}
              >
                {title}
              </a>
            )}
          </>
        );
      })}
    </nav>
  );
}
