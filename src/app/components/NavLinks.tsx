/**
 * Navigation links component
 * 
 * Shows links to related concepts (automatically extracted from content).
 * Uses DiscoverableLink to trigger discovery animation when links become visible.
 */

import { makeStyles } from '@griffel/react';
import { navigateTo } from '@/app/router.ts';
import { getNodeMeta } from '@/lib/content.ts';
import { DiscoverableLink } from '@/app/components/DiscoverableLink.tsx';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-xl)',
    paddingTop: 'var(--space-lg)',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  
  label: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-subtle)',
  },
  
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
    listStyleType: 'none',
    paddingLeft: 0,
  },
  
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
    paddingTop: 'var(--space-2xs)',
    paddingBottom: 'var(--space-2xs)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    textDecorationLine: 'none',
    fontSize: 'var(--font-size-sm)',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover': {
      backgroundColor: 'var(--color-accent-subtle)',
      borderColor: 'var(--color-accent)',
      color: 'var(--color-accent)',
    },
  },
});

// ============================================
// COMPONENT
// ============================================

interface NavLinksProps {
  links?: string[];
}

export function NavLinks({ links }: NavLinksProps) {
  const styles = useStyles();
  
  if (!links || links.length === 0) {
    return null;
  }
  
  return (
    <nav className={styles.navLinks}>
      <div className={styles.section}>
        <span className={styles.label}>↔ Related Topics</span>
        <ul className={styles.list}>
          {links.map((nodeId) => {
            const meta = getNodeMeta(nodeId);
            return (
              <li key={nodeId}>
                <DiscoverableLink nodeId={nodeId}>
                  <a 
                    href={`/${nodeId}`}
                    className={styles.link}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigateTo(nodeId, { addToPath: true });
                    }}
                  >
                    {meta?.title || nodeId}
                  </a>
                </DiscoverableLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
