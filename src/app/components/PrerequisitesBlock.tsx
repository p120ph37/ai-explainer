/**
 * Prerequisites block component
 * 
 * Shows "This concept builds on:" section with links to prerequisite nodes.
 * Displays status indicators for each prerequisite.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { makeStyles, mergeClasses } from '@griffel/react';
import { 
  getQuestStatus, 
  questStatusInfo, 
  progressState,
  type QuestStatus 
} from '@/app/progress.ts';
import { getNodeMeta } from '@/lib/content.ts';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  block: {
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    borderLeft: '3px solid var(--color-primary)',
  },
  
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-sm)',
    flexWrap: 'wrap',
  },
  
  icon: {
    fontSize: 'var(--font-size-lg)',
  },
  
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  badge: {
    fontSize: 'var(--font-size-xs)',
    paddingTop: 'var(--space-2xs)',
    paddingBottom: 'var(--space-2xs)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 500,
  },
  
  badgeComplete: {
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success)',
  },
  
  badgeWarning: {
    backgroundColor: 'var(--color-warning-bg)',
    color: 'var(--color-warning)',
  },
  
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
  },
  
  item: {
    marginTop: 0,
    marginBottom: 0,
  },
  
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-sm)',
    textDecorationLine: 'none',
    fontSize: 'var(--font-size-sm)',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--color-primary)',
      backgroundColor: 'var(--color-bg-subtle)',
    },
  },
  
  status: {
    fontSize: 'var(--font-size-md)',
    lineHeight: 1,
  },
  
  statusUndiscovered: {
    color: 'var(--color-text-muted)',
  },
  
  statusDiscovered: {
    color: 'var(--color-warning)',
  },
  
  statusInProgress: {
    color: 'var(--color-primary)',
  },
  
  statusComplete: {
    color: 'var(--color-success)',
  },
  
  name: {
    color: 'var(--color-text)',
  },
  
  hint: {
    marginTop: 'var(--space-sm)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
});

// ============================================
// COMPONENT
// ============================================

interface PrerequisiteInfo {
  id: string;
  title: string;
  status: QuestStatus;
}

interface PrerequisitesBlockProps {
  prerequisites: string[];
}

export function PrerequisitesBlock({ prerequisites }: PrerequisitesBlockProps) {
  const prereqInfo = useSignal<PrerequisiteInfo[]>([]);
  const loading = useSignal(true);
  const styles = useStyles();
  
  // Load prerequisite titles and status
  useEffect(() => {
    async function loadPrereqs() {
      const info: PrerequisiteInfo[] = [];
      
      for (const prereqId of prerequisites) {
        const meta = getNodeMeta(prereqId);
        const linkedTopics = meta?.links || [];
        
        info.push({
          id: prereqId,
          title: meta?.title || prereqId,
          status: getQuestStatus(prereqId, linkedTopics),
        });
      }
      
      prereqInfo.value = info;
      loading.value = false;
    }
    
    loadPrereqs();
  }, [prerequisites]);
  
  // Re-check status when progress changes
  useEffect(() => {
    // Subscribe to progress state changes
    const _ = progressState.value;
    
    // Update statuses
    prereqInfo.value = prereqInfo.value.map(prereq => ({
      ...prereq,
      status: getQuestStatus(prereq.id), // Simplified - just check basic status
    }));
  }, [progressState.value]);
  
  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }
  
  if (loading.value) {
    return null; // Don't show loading state, just render when ready
  }
  
  const allComplete = prereqInfo.value.every(p => p.status === 'complete');
  const anyUnvisited = prereqInfo.value.some(
    p => p.status === 'undiscovered' || p.status === 'discovered'
  );
  
  const getStatusStyle = (status: QuestStatus) => {
    switch (status) {
      case 'undiscovered': return styles.statusUndiscovered;
      case 'discovered': return styles.statusDiscovered;
      case 'in_progress': return styles.statusInProgress;
      case 'complete': return styles.statusComplete;
      default: return '';
    }
  };
  
  return (
    <aside className={styles.block} aria-label="Prerequisites">
      <div className={styles.header}>
        <span className={styles.icon}>🔗</span>
        <span className={styles.title}>This concept builds on:</span>
        {allComplete && (
          <span className={mergeClasses(styles.badge, styles.badgeComplete)} title="All prerequisites complete">
            ✓ Ready
          </span>
        )}
        {anyUnvisited && (
          <span className={mergeClasses(styles.badge, styles.badgeWarning)} title="Some prerequisites not yet explored">
            Some unexplored
          </span>
        )}
      </div>
      
      <ul className={styles.list}>
        {prereqInfo.value.map(prereq => {
          const info = questStatusInfo[prereq.status];
          return (
            <li key={prereq.id} className={styles.item}>
              <a href={`/${prereq.id}`} className={styles.link}>
                <span 
                  className={mergeClasses(styles.status, getStatusStyle(prereq.status))} 
                  title={info.label}
                  aria-label={info.label}
                >
                  {info.icon}
                </span>
                <span className={styles.name}>{prereq.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
      
      {anyUnvisited && (
        <p className={styles.hint}>
          Topics marked with ○ or ? haven't been fully explored yet. 
          Consider reviewing them first for full context.
        </p>
      )}
    </aside>
  );
}
