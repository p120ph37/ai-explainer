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
import { navigateTo } from '../../router.ts';
import { getNodeMeta } from '../../../content/_registry.ts';
import { 
  markTopicDiscovered, 
  isTopicDiscovered, 
  getNodeProgress,
  getQuestStatus,
  questStatusInfo,
  progressState,
} from '../../progress.ts';
import type { TermProps } from '../../../content/_types.ts';

export function Term({ id, children }: TermProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const hasDiscovered = useRef(false);
  const showTooltip = useSignal(false);
  
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
      className: statusData.className,
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
            element.classList.add('term-link--discovered');
            setTimeout(() => {
              element.classList.remove('term-link--discovered');
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
  }, [id]);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    navigateTo(id, { addToPath: true });
  };
  
  // Build tooltip text - show actual title and progress
  const tooltipTitle = meta?.title || id;
  const tooltipText = `${tooltipTitle}${progressInfo.value.exploredPercent > 0 ? ` (${progressInfo.value.exploredPercent}% explored)` : ''}`;
  
  return (
    <span 
      ref={wrapperRef}
      className={`term-link ${progressInfo.value.className}`}
      data-node-id={id}
      onMouseEnter={() => showTooltip.value = true}
      onMouseLeave={() => showTooltip.value = false}
      onFocus={() => showTooltip.value = true}
      onBlur={() => showTooltip.value = false}
    >
      <a 
        href={`#/${id}`}
        onClick={handleClick}
        tabIndex={0}
        title={tooltipTitle}
      >
        {children}
      </a>
      <span 
        className="term-link__status"
        title={progressInfo.value.label}
        aria-label={progressInfo.value.label}
      >
        {progressInfo.value.icon}
      </span>
      {showTooltip.value && meta && (
        <span className="term-link__tooltip" role="tooltip">
          <strong>{meta.title}</strong>
          <br />
          <span className="term-link__tooltip-summary">{meta.summary}</span>
        </span>
      )}
    </span>
  );
}
