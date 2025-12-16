/**
 * Prerequisites block component
 * 
 * Shows "This concept builds on:" section with links to prerequisite nodes.
 * Displays status indicators for each prerequisite.
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { 
  getQuestStatus, 
  questStatusInfo, 
  progressState,
  type QuestStatus 
} from '../progress.ts';
import { getNodeMeta } from '../../lib/content.ts';

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
  
  // Load prerequisite titles and status
  useEffect(() => {
    async function loadPrereqs() {
      const info: PrerequisiteInfo[] = [];
      
      for (const prereqId of prerequisites) {
        const meta = getNodeMeta(prereqId);
        const totalTopics = [
          ...(meta?.children || []),
          ...(meta?.related || []),
        ].length;
        
        info.push({
          id: prereqId,
          title: meta?.title || prereqId,
          status: getQuestStatus(prereqId, totalTopics),
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
      status: getQuestStatus(prereq.id, 0), // Simplified - just check basic status
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
  
  return (
    <aside className="prerequisites-block" aria-label="Prerequisites">
      <div className="prerequisites-header">
        <span className="prerequisites-icon">🔗</span>
        <span className="prerequisites-title">This concept builds on:</span>
        {allComplete && (
          <span className="prerequisites-badge prerequisites-badge--complete" title="All prerequisites complete">
            ✓ Ready
          </span>
        )}
        {anyUnvisited && (
          <span className="prerequisites-badge prerequisites-badge--warning" title="Some prerequisites not yet explored">
            Some unexplored
          </span>
        )}
      </div>
      
      <ul className="prerequisites-list">
        {prereqInfo.value.map(prereq => {
          const info = questStatusInfo[prereq.status];
          return (
            <li key={prereq.id} className={`prerequisites-item ${info.className}`}>
              <a href={`/${prereq.id}`} className="prerequisites-link">
                <span 
                  className="prerequisites-status" 
                  title={info.label}
                  aria-label={info.label}
                >
                  {info.icon}
                </span>
                <span className="prerequisites-name">{prereq.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
      
      {anyUnvisited && (
        <p className="prerequisites-hint">
          Topics marked with ○ or ? haven't been fully explored yet. 
          Consider reviewing them first for full context.
        </p>
      )}
    </aside>
  );
}
