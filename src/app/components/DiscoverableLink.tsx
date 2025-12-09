/**
 * Discoverable link wrapper
 * 
 * Wraps links to content nodes and triggers discovery when they become visible.
 * Uses IntersectionObserver to detect visibility.
 * 
 * Note: Links on the IndexPage should NOT use this - that's a cheat/shortcut.
 */

import { useEffect, useRef } from 'preact/hooks';
import { markTopicDiscovered, isTopicDiscovered } from '../progress.ts';
import type { ComponentChildren } from 'preact';

interface DiscoverableLinkProps {
  /** The node ID this link points to */
  nodeId: string;
  /** The link element to wrap */
  children: ComponentChildren;
  /** Additional class name */
  className?: string;
}

export function DiscoverableLink({ nodeId, children, className }: DiscoverableLinkProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const hasDiscovered = useRef(false);
  
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    
    // Reset discovery state when nodeId changes
    hasDiscovered.current = isTopicDiscovered(nodeId);
    
    // Skip if already discovered globally
    if (hasDiscovered.current) {
      return;
    }
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasDiscovered.current) {
          hasDiscovered.current = true;
          
          // Find the actual link element inside
          const linkElement = element.querySelector('a') || element;
          
          // Trigger discovery with animation
          const wasNew = markTopicDiscovered(nodeId, linkElement as HTMLElement);
          
          if (wasNew) {
            // Add a brief highlight class to the link
            element.classList.add('discoverable-link--discovered');
            setTimeout(() => {
              element.classList.remove('discoverable-link--discovered');
            }, 1000);
          }
          
          // Stop observing once discovered
          observer.disconnect();
        }
      }
    };
    
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Trigger when 50% visible
    });
    
    observer.observe(element);
    
    // Check if already visible (for elements visible on initial render)
    // Use setTimeout to ensure the observer is fully set up
    setTimeout(() => {
      if (!hasDiscovered.current) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isVisible = rect.top < viewportHeight && rect.bottom > 0;
        const visibleRatio = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const elementHeight = rect.height;
        
        if (isVisible && elementHeight > 0 && (visibleRatio / elementHeight) >= 0.5) {
          handleIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);
        }
      }
    }, 100);
    
    return () => observer.disconnect();
  }, [nodeId]);
  
  return (
    <span 
      ref={wrapperRef} 
      className={`discoverable-link ${className || ''}`}
      data-node-id={nodeId}
    >
      {children}
    </span>
  );
}
