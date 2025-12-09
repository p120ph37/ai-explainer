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
import { navigateTo } from '../router.ts';
import { getNodeMeta } from '../../content/_registry.ts';
import { 
  markTopicDiscovered, 
  isTopicDiscovered, 
  getNodeProgress,
  getQuestStatus,
  questStatusInfo,
  progressState,
} from '../progress.ts';
import type { ComponentChildren, JSX } from 'preact';

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
      className: statusData.className,
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
            element.classList.add('internal-link--discovered');
            setTimeout(() => {
              element.classList.remove('internal-link--discovered');
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
  }, [nodeId]);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    navigateTo(nodeId, { addToPath: true });
  };
  
  // Build tooltip - show actual title
  const tooltipTitle = meta?.title || nodeId;
  
  return (
    <span 
      ref={wrapperRef}
      className={`internal-link ${progressInfo.value.className} ${className || ''}`}
      data-node-id={nodeId}
      onMouseEnter={() => showTooltip.value = true}
      onMouseLeave={() => showTooltip.value = false}
    >
      <a 
        href={`#/${nodeId}`}
        onClick={handleClick}
        title={tooltipTitle}
        {...props}
      >
        {children}
      </a>
      <span 
        className="internal-link__status"
        aria-label={progressInfo.value.label}
      >
        {progressInfo.value.icon}
      </span>
      {showTooltip.value && meta && (
        <span className="internal-link__tooltip" role="tooltip">
          <strong>{meta.title}</strong>
          {progressInfo.value.exploredPercent > 0 && (
            <span className="internal-link__progress">
              {progressInfo.value.exploredPercent}% explored
            </span>
          )}
        </span>
      )}
    </span>
  );
}

