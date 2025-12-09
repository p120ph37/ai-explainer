/**
 * Discoverable link wrapper
 * 
 * Wraps links to content nodes and triggers discovery when they become visible.
 * Uses IntersectionObserver to detect visibility.
 * 
 * Note: Links on the IndexPage should NOT use this - that's a cheat/shortcut.
 */

import { createContext } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { markTopicDiscovered, isTopicDiscovered } from '../progress.ts';
import type { ComponentChildren } from 'preact';

/**
 * Context to provide the current page ID for discovery tracking
 */
export const CurrentPageContext = createContext<string | null>(null);

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
  const currentPageId = useContext(CurrentPageContext);
  
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    
    // Reset discovery state when nodeId changes
    hasDiscovered.current = isTopicDiscovered(nodeId);
    
    // Skip if already discovered globally
    if (hasDiscovered.current) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasDiscovered.current) {
            hasDiscovered.current = true;
            
            // Find the actual link element inside
            const linkElement = element.querySelector('a') || element;
            
            // Trigger discovery with animation and page context
            const wasNew = markTopicDiscovered(
              nodeId, 
              linkElement as HTMLElement,
              currentPageId || undefined
            );
            
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
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Trigger when 50% visible
      }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [nodeId, currentPageId]);
  
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
