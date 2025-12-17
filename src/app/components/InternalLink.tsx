/**
 * Internal Link component
 * 
 * Renders links to internal content nodes with:
 * - Progress indicator showing exploration status
 * - Title tooltip on hover
 * - Discovery animation when link becomes visible
 * 
 * Used both directly and via MDX provider for markdown links.
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
import type { ComponentChildren, JSX } from 'preact';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  internalLink: {
    position: 'relative',
    display: 'inline',
  },
  
  link: {
    color: 'var(--color-accent)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '0.2em',
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
    fontStyle: 'normal', // Don't inherit italics from container
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
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    fontSize: 'var(--font-size-sm)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
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
  },
  
  tooltipProgress: {
    display: 'block',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
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

interface InternalLinkProps extends Omit<JSX.HTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** The node ID this link points to */
  nodeId: string;
  /** Link text */
  children: ComponentChildren;
}

export function InternalLink({ nodeId, children, className, ...props }: InternalLinkProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const hasDiscovered = useRef(false);
  const showTooltip = useSignal(false);
  const styles = useStyles();
  
  // Get metadata for the linked node
  const meta = getNodeMeta(nodeId);
  
  // Reactively compute progress info (re-renders when progressState changes)
  const progressInfo = useComputed(() => {
    // Access progressState to create reactivity
    const _ = progressState.value;
    const progress = getNodeProgress(nodeId);
    const status = getQuestStatus(nodeId);
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
    hasDiscovered.current = isTopicDiscovered(nodeId);
    
    // Skip if already discovered
    if (hasDiscovered.current) return;
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasDiscovered.current) {
          hasDiscovered.current = true;
          
          // Get the actual link element
          const linkElement = element.querySelector('a') || element;
          
          // Trigger discovery with animation
          const wasNew = markTopicDiscovered(nodeId, linkElement as HTMLElement);
          
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
    
    // Listen for parent <details> toggle events
    const checkVisibilityOnDetailsToggle = () => {
      if (hasDiscovered.current) return;
      
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isInViewport = rect.top < viewportHeight && rect.bottom > 0 && rect.height > 0;
      
      if (isInViewport) {
        observer.disconnect();
        observer.observe(element);
      }
    };
    
    const parentDetails = element.closest('details');
    if (parentDetails) {
      parentDetails.addEventListener('toggle', checkVisibilityOnDetailsToggle);
    }
    
    // Initial visibility check
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
  }, [nodeId, styles.discovered]);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from hitting other elements during render
    navigateTo(nodeId, { addToPath: true });
  };
  
  // Build tooltip - show actual title
  const tooltipTitle = meta?.title || nodeId;
  
  return (
    <span 
      ref={wrapperRef}
      className={mergeClasses(styles.internalLink, className)}
      data-node-id={nodeId}
      onMouseEnter={() => showTooltip.value = true}
      onMouseLeave={() => showTooltip.value = false}
    >
      <a 
        href={`/${nodeId}`}
        onClick={handleClick}
        title={tooltipTitle}
        className={styles.link}
        {...props}
      >
        {children}
      </a>
      {!PROGRESS_TRACKING_DISABLED && (
        <span 
          className={mergeClasses(styles.status, progressInfo.value.statusStyle)}
          aria-label={progressInfo.value.label}
        >
          {progressInfo.value.icon}
        </span>
      )}
      {showTooltip.value && meta && (
        <span className={styles.tooltip} role="tooltip">
          <strong className={styles.tooltipTitle}>{meta.title}</strong>
          {progressInfo.value.exploredPercent > 0 && (
            <span className={styles.tooltipProgress}>
              {progressInfo.value.exploredPercent}% explored
            </span>
          )}
        </span>
      )}
    </span>
  );
}

