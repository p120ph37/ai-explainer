/**
 * MarginDeoverlap
 * 
 * Detects and fixes overlapping margin asides (Questions on left, Metaphors on right).
 * Runs on mount and when asides open/close.
 */

import { useEffect } from 'preact/hooks';

const MARGIN_GAP = 12; // Minimum gap between collapsed asides in pixels

function deoverlapSide(selector: string) {
  const asides = Array.from(
    document.querySelectorAll(selector)
  ) as HTMLElement[];
  
  if (asides.length < 2) return;
  
  // Sort by their natural vertical position (top of bounding rect)
  const sorted = asides
    .map(el => ({
      el,
      rect: el.getBoundingClientRect(),
      originalTop: el.offsetTop
    }))
    .sort((a, b) => a.originalTop - b.originalTop);
  
  // Reset any previous adjustments
  sorted.forEach(({ el }) => {
    el.style.removeProperty('--deoverlap-offset');
  });
  
  // Calculate and apply offsets to prevent overlap
  let lastBottom = -Infinity;
  
  sorted.forEach(({ el, rect }) => {
    const currentTop = rect.top;
    
    if (currentTop < lastBottom + MARGIN_GAP) {
      // This aside overlaps with the previous one
      const offset = lastBottom + MARGIN_GAP - currentTop;
      el.style.setProperty('--deoverlap-offset', `${offset}px`);
      lastBottom = rect.bottom + offset;
    } else {
      lastBottom = rect.bottom;
    }
  });
}

function deoverlapAll() {
  // Small delay to let layout settle after open/close animations
  requestAnimationFrame(() => {
    // Left margin: Questions
    deoverlapSide('.question-aside:not(.question-aside--open)');
    // Right margin: Metaphors
    deoverlapSide('.metaphor:not(.metaphor--open)');
  });
}

export function MarginDeoverlap() {
  useEffect(() => {
    // Initial deoverlap
    deoverlapAll();
    
    // Re-run when window resizes
    window.addEventListener('resize', deoverlapAll);
    
    // Re-run when any aside opens/closes (listen for class changes)
    const observer = new MutationObserver((mutations) => {
      const relevantChange = mutations.some(m => 
        m.type === 'attributes' && 
        m.attributeName === 'class' &&
        (m.target as Element).matches?.('.metaphor, .question-aside')
      );
      if (relevantChange) {
        deoverlapAll();
      }
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
    
    return () => {
      window.removeEventListener('resize', deoverlapAll);
      observer.disconnect();
    };
  }, []);
  
  // This component renders nothing, it just runs the effect
  return null;
}

