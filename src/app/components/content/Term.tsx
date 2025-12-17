/**
 * Term component
 * 
 * Renders a link to another concept with:
 * - Progress indicator showing exploration status
 * - Tooltip showing actual page title (not just the inline text)
 * - Discovery animation when the link becomes visible
 */

import { useEffect, useRef } from 'preact/hooks';
import { useSignal, useComputed } from '@preact/signals';
import { makeStyles, mergeClasses } from '@griffel/react';
import { navigateTo } from '@/app/router.ts';
import { getNodeMeta } from '@/lib/content.ts';
import { 
  markTopicDiscovered, 
  isTopicDiscovered, 
  getNodeProgress,
  getQuestStatus,
  questStatusInfo,
  progressState,
  PROGRESS_TRACKING_DISABLED,
} from '@/app/progress.ts';
import type { JSX } from 'preact';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  termLink: {
    position: 'relative',
    display: 'inline',
    cursor: 'pointer',
  },
  
  link: {
    color: 'var(--color-accent)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '0.2em',
  },
  
  linkHover: {
    ':hover': {
      textDecorationStyle: 'solid',
    },
  },
  
  status: {
    display: 'inline-block',
    fontSize: '0.7em',
    marginLeft: '0.2em',
    verticalAlign: 'middle',
    opacity: 0.7,
    transitionProperty: 'opacity',
    transitionDuration: 'var(--duration-fast)',
  },
  
  // Status-based colors
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
  
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-normal)',
    maxWidth: '280px',
    minWidth: '180px',
    whiteSpace: 'normal',
    textAlign: 'left',
    zIndex: 50,
    pointerEvents: 'none',
    // Arrow
    '::after': {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '6px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderTopColor: 'var(--color-border)',
    },
  },
  
  tooltipTitle: {
    display: 'block',
    color: 'var(--color-text)',
    fontSize: 'var(--font-size-base)',
    marginBottom: 'var(--space-xs)',
  },
  
  tooltipSummary: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-sm)',
  },
  
  // Discovery animation class - applied via DOM
  discovered: {
    animationName: {
      '0%': { backgroundColor: 'transparent' },
      '20%': { 
        backgroundColor: 'hsla(45, 100%, 60%, 0.3)',
        boxShadow: '0 0 10px hsla(45, 100%, 60%, 0.5)',
      },
      '100%': { 
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    animationDuration: '1.5s',
    animationTimingFunction: 'ease',
  },
});

// ============================================
// COMPONENT
// ============================================

interface TermProps {
  id: string;
  children: JSX.Element | string;
}

export function Term({ id, children }: TermProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const hasDiscovered = useRef(false);
  const showTooltip = useSignal(false);
  const styles = useStyles();
  
  // Get metadata for the linked node
  const meta = getNodeMeta(id);
  
  // Reactively compute progress info (re-renders when progressState changes)
  const progressInfo = useComputed(() => {
    // Access progressState to create reactivity
    const _ = progressState.value;
    const progress = getNodeProgress(id);
    const status = getQuestStatus(id);
    const statusData = questStatusInfo[status];
    return {
      status,
      exploredPercent: progress.exploredPercent,
      icon: statusData.icon,
      label: statusData.label,
      statusStyle: status === 'undiscovered' ? styles.statusUndiscovered
        : status === 'discovered' ? styles.statusDiscovered
        : status === 'in_progress' ? styles.statusInProgress
        : styles.statusComplete,
    };
  });
  
  // Discovery detection with IntersectionObserver
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    
    // Reset discovery state
    hasDiscovered.current = isTopicDiscovered(id);
    
    // Skip if already discovered
    if (hasDiscovered.current) return;
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasDiscovered.current) {
          hasDiscovered.current = true;
          
          // Get the actual link element
          const linkElement = element.querySelector('a') || element;
          
          // Trigger discovery with animation
          const wasNew = markTopicDiscovered(id, linkElement as HTMLElement);
          
          if (wasNew) {
            element.classList.add(styles.discovered);
            setTimeout(() => {
              element.classList.remove(styles.discovered);
            }, 1500);
          }
          
          observer.disconnect();
        }
      }
    };
    
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Lower threshold for better detection
    });
    
    observer.observe(element);
    
    // Also listen for parent <details> toggle events
    // This handles the case where a link is inside an expandable
    const checkVisibilityOnDetailsToggle = () => {
      if (hasDiscovered.current) return;
      
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isInViewport = rect.top < viewportHeight && rect.bottom > 0 && rect.height > 0;
      
      if (isInViewport) {
        // Re-trigger observation
        observer.disconnect();
        observer.observe(element);
      }
    };
    
    // Find parent details element and listen for toggle
    const parentDetails = element.closest('details');
    if (parentDetails) {
      parentDetails.addEventListener('toggle', checkVisibilityOnDetailsToggle);
    }
    
    // Initial visibility check after a short delay
    const timeoutId = setTimeout(() => {
      if (!hasDiscovered.current) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isVisible = rect.top < viewportHeight && rect.bottom > 0 && rect.height > 0;
        
        if (isVisible && rect.width > 0) {
          handleIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);
        }
      }
    }, 200);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      if (parentDetails) {
        parentDetails.removeEventListener('toggle', checkVisibilityOnDetailsToggle);
      }
    };
  }, [id, styles.discovered]);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from hitting other elements during render
    navigateTo(id, { addToPath: true });
  };
  
  // Build tooltip text - show actual title and progress
  const tooltipTitle = meta?.title || id;
  
  return (
    <span 
      ref={wrapperRef}
      className={styles.termLink}
      data-node-id={id}
      onMouseEnter={() => showTooltip.value = true}
      onMouseLeave={() => showTooltip.value = false}
      onFocus={() => showTooltip.value = true}
      onBlur={() => showTooltip.value = false}
    >
      <a 
        href={`/${id}`}
        onClick={handleClick}
        tabIndex={0}
        title={tooltipTitle}
        className={mergeClasses(styles.link, styles.linkHover)}
      >
        {children}
      </a>
      {!PROGRESS_TRACKING_DISABLED && (
        <span 
          className={mergeClasses(styles.status, progressInfo.value.statusStyle)}
          title={progressInfo.value.label}
          aria-label={progressInfo.value.label}
        >
          {progressInfo.value.icon}
        </span>
      )}
      {showTooltip.value && meta && (
        <span className={styles.tooltip} role="tooltip">
          <strong className={styles.tooltipTitle}>{meta.title}</strong>
          <span className={styles.tooltipSummary}>{meta.summary}</span>
        </span>
      )}
    </span>
  );
}
