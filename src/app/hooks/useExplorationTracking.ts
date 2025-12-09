/**
 * Hook to track content exploration progress
 * 
 * Tracks:
 * - Scroll position through visible content
 * - Which expandable sections have been opened
 * - Calculates explored-percent based on actually-seen content
 * 
 * Collapsed asides don't count toward explored-percent until expanded.
 */

import { useEffect, useRef, useCallback } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { updateExploredPercent, markVisited, markTopicDiscovered, getQuestStatus, questStatusInfo, isOnIndexPage } from '../progress.ts';
import { contentRegistry } from '../../content/_registry.ts';

interface ContentSection {
  /** Unique ID for this section */
  id: string;
  /** The DOM element */
  element: HTMLElement;
  /** Height of the content */
  height: number;
  /** Whether this is an expandable section */
  isExpandable: boolean;
  /** Whether the section is currently expanded (for expandables) */
  isExpanded: boolean;
  /** How much of this section has been scrolled into view (0-1) */
  seenRatio: number;
}

interface UseExplorationTrackingOptions {
  /** Node ID to track */
  nodeId: string;
  /** Selector for the main content body */
  contentSelector?: string;
  /** Selector for expandable sections */
  expandableSelector?: string;
}

export function useExplorationTracking({
  nodeId,
  contentSelector = '.content-node__body',
  expandableSelector = '.expandable',
}: UseExplorationTrackingOptions) {
  const sections = useSignal<ContentSection[]>([]);
  const expandedIds = useSignal<Set<string>>(new Set());
  const highWaterMark = useRef<number>(0); // Highest scroll position seen
  
  // Mark as visited immediately
  useEffect(() => {
    markVisited(nodeId);
    highWaterMark.current = 0;
  }, [nodeId]);
  
  // Scan content and build section map
  const scanContent = useCallback(() => {
    const contentBody = document.querySelector(contentSelector);
    if (!contentBody) return;
    
    const newSections: ContentSection[] = [];
    
    // Get all direct children and expandables
    const walkContent = (container: Element, depth: number = 0) => {
      for (const child of container.children) {
        const isExpandable = child.matches(expandableSelector);
        const expandableContent = isExpandable 
          ? child.querySelector('.expandable__content') 
          : null;
        
        if (isExpandable) {
          const isExpanded = child.classList.contains('expandable--open') ||
                            child.hasAttribute('open');
          const id = child.getAttribute('data-section-id') || 
                    `expandable-${newSections.length}`;
          
          // The header is always visible
          const header = child.querySelector('.expandable__header, summary');
          if (header) {
            newSections.push({
              id: `${id}-header`,
              element: header as HTMLElement,
              height: header.getBoundingClientRect().height,
              isExpandable: false,
              isExpanded: true,
              seenRatio: 0,
            });
          }
          
          // The content only counts if expanded
          if (expandableContent) {
            newSections.push({
              id: `${id}-content`,
              element: expandableContent as HTMLElement,
              height: expandableContent.getBoundingClientRect().height,
              isExpandable: true,
              isExpanded,
              seenRatio: 0,
            });
          }
        } else if (child instanceof HTMLElement) {
          // Regular content block
          const rect = child.getBoundingClientRect();
          if (rect.height > 0) {
            newSections.push({
              id: `block-${newSections.length}`,
              element: child,
              height: rect.height,
              isExpandable: false,
              isExpanded: true,
              seenRatio: 0,
            });
          }
        }
      }
    };
    
    walkContent(contentBody);
    sections.value = newSections;
  }, [contentSelector, expandableSelector]);
  
  // Calculate explored percent based on visible content
  const calculateExploredPercent = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const currentSections = sections.value;
    
    if (currentSections.length === 0) return 0;
    
    // Calculate total "countable" height (expanded content only)
    let totalCountableHeight = 0;
    let totalSeenHeight = 0;
    
    for (const section of currentSections) {
      // Skip collapsed expandable content
      if (section.isExpandable && !section.isExpanded) {
        continue;
      }
      
      const rect = section.element.getBoundingClientRect();
      const sectionHeight = rect.height;
      totalCountableHeight += sectionHeight;
      
      // Calculate how much of this section is above the viewport bottom
      // (i.e., has been scrolled into view)
      const sectionTop = rect.top + scrollY;
      const sectionBottom = sectionTop + sectionHeight;
      const viewportBottom = scrollY + viewportHeight;
      
      // How much of this section has been seen?
      if (viewportBottom >= sectionBottom) {
        // Fully seen
        totalSeenHeight += sectionHeight;
      } else if (viewportBottom > sectionTop) {
        // Partially seen
        const seenAmount = viewportBottom - sectionTop;
        totalSeenHeight += Math.max(0, seenAmount);
      }
      // else: not yet seen
    }
    
    if (totalCountableHeight === 0) return 100;
    
    const percent = Math.round((totalSeenHeight / totalCountableHeight) * 100);
    return Math.min(100, percent);
  }, [sections.value]);
  
  // Handle scroll events
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        const percent = calculateExploredPercent();
        
        // Only update if we've scrolled further than before
        if (percent > highWaterMark.current) {
          highWaterMark.current = percent;
          updateExploredPercent(nodeId, percent);
        }
        
        ticking = false;
      });
    };
    
    // Initial scan and calculation
    scanContent();
    setTimeout(() => {
      const initialPercent = calculateExploredPercent();
      if (initialPercent > highWaterMark.current) {
        highWaterMark.current = initialPercent;
        updateExploredPercent(nodeId, initialPercent);
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [nodeId, scanContent, calculateExploredPercent]);
  
  // Watch for expandable sections being opened
  useEffect(() => {
    const contentBody = document.querySelector(contentSelector);
    if (!contentBody) return;
    
    const handleToggle = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Check if this is an expandable toggle
      if (target.closest(expandableSelector)) {
        // Re-scan content to update expanded states
        setTimeout(() => {
          scanContent();
          
          // Recalculate after expansion
          const percent = calculateExploredPercent();
          if (percent > highWaterMark.current) {
            highWaterMark.current = percent;
            updateExploredPercent(nodeId, percent);
          }
        }, 50); // Small delay for DOM to update
      }
    };
    
    // Listen for clicks on expandables and details toggle
    contentBody.addEventListener('click', handleToggle);
    contentBody.addEventListener('toggle', handleToggle, true);
    
    return () => {
      contentBody.removeEventListener('click', handleToggle);
      contentBody.removeEventListener('toggle', handleToggle, true);
    };
  }, [nodeId, contentSelector, expandableSelector, scanContent, calculateExploredPercent]);
  
  // Also watch for mutation (dynamic content)
  useEffect(() => {
    const contentBody = document.querySelector(contentSelector);
    if (!contentBody) return;
    
    const observer = new MutationObserver(() => {
      // Re-scan if DOM changes significantly
      scanContent();
    });
    
    observer.observe(contentBody, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'open'],
    });
    
    return () => observer.disconnect();
  }, [contentSelector, scanContent]);
  
  // Enhance internal links with progress indicators and discovery tracking
  // This needs to run whenever the DOM changes (e.g., expandables opening)
  const enhanceLinks = useCallback(() => {
    if (isOnIndexPage()) return []; // Don't enhance links on index page
    
    const contentBody = document.querySelector(contentSelector);
    if (!contentBody) return [];
    
    // Find all anchor tags that point to internal topics
    const links = contentBody.querySelectorAll('a[href^="#/"]');
    const observers: IntersectionObserver[] = [];
    
    links.forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (!href || anchor.dataset.enhanced === 'true') return;
      
      // Skip if already wrapped in an internal-link (e.g., by React component)
      if (anchor.closest('.internal-link')) return;
      
      const linkNodeId = href.replace(/^#\//, '');
      const meta = contentRegistry.getMeta(linkNodeId);
      if (!meta) return; // Not a valid internal link
      
      // Mark as enhanced to avoid duplicate processing
      anchor.dataset.enhanced = 'true';
      
      // Create wrapper span
      const wrapper = document.createElement('span');
      const status = getQuestStatus(linkNodeId);
      const statusData = questStatusInfo[status];
      wrapper.className = `internal-link internal-link--${status}`;
      wrapper.dataset.nodeId = linkNodeId;
      
      // Move the anchor into the wrapper
      anchor.parentNode?.insertBefore(wrapper, anchor);
      wrapper.appendChild(anchor);
      
      // Add status indicator after the link (single icon, no title to avoid double tooltip)
      const indicator = document.createElement('span');
      indicator.className = 'internal-link__status';
      indicator.textContent = statusData.icon;
      indicator.setAttribute('aria-label', statusData.label);
      wrapper.appendChild(indicator);
      
      // Add title tooltip to the anchor only
      anchor.title = meta.title;
      
      // Set up IntersectionObserver for discovery
      if (status === 'undiscovered') {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              markTopicDiscovered(linkNodeId, anchor);
              // Update the wrapper class and indicator
              wrapper.className = `internal-link internal-link--discovered`;
              indicator.textContent = questStatusInfo.discovered.icon;
              indicator.title = questStatusInfo.discovered.label;
              observer.disconnect();
            }
          },
          { threshold: 0.5 }
        );
        observer.observe(anchor);
        observers.push(observer);
      }
    });
    
    return observers;
  }, [contentSelector]);
  
  // Initial link enhancement on mount
  useEffect(() => {
    const observers = enhanceLinks();
    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [nodeId, enhanceLinks]);
  
  // Re-enhance links when expandables are toggled
  useEffect(() => {
    const contentBody = document.querySelector(contentSelector);
    if (!contentBody) return;
    
    // When an expandable is toggled, new links may appear - enhance them
    const handleToggle = () => {
      setTimeout(() => enhanceLinks(), 50); // Small delay for DOM to update
    };
    
    contentBody.addEventListener('click', handleToggle);
    contentBody.addEventListener('toggle', handleToggle, true);
    
    return () => {
      contentBody.removeEventListener('click', handleToggle);
      contentBody.removeEventListener('toggle', handleToggle, true);
    };
  }, [contentSelector, enhanceLinks]);
  
  return {
    sections,
    expandedIds,
    rescan: scanContent,
  };
}

