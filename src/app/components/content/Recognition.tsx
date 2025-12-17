/**
 * Recognition component
 * 
 * Margin aside for "you've seen this" experience connections.
 * Dynamically chooses left or right margin based on available space.
 * 
 * Content is always rendered for SSR, hidden/shown via CSS.
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useCollapsible } from '@/app/hooks/useCollapsible.ts';

// ============================================
// STYLES (Griffel - all styles in one place)
// ============================================

const useStyles = makeStyles({
  // Base aside - mobile first (in-flow)
  root: {
    position: 'relative',
    marginBlockStart: 'var(--space-md)',
    marginBlockEnd: 'var(--space-md)',
  },
  
  // Desktop: Position in LEFT margin when collapsed
  rootLeftDesktop: {
    '@media (min-width: 1200px)': {
      position: 'absolute',
      right: 'calc(100% + var(--space-lg))',
      width: '280px',
      marginBlock: 0,
      transform: 'translateY(var(--deoverlap-offset, 0))',
      transitionProperty: 'transform',
      transitionDuration: 'var(--duration-normal, 200ms)',
      transitionTimingFunction: 'var(--ease-out)',
    },
  },
  
  // Desktop: Position in RIGHT margin when collapsed
  rootRightDesktop: {
    '@media (min-width: 1200px)': {
      position: 'absolute',
      left: 'calc(100% + var(--space-lg))',
      width: '280px',
      marginBlock: 0,
      transform: 'translateY(var(--deoverlap-offset, 0))',
      transitionProperty: 'transform',
      transitionDuration: 'var(--duration-normal, 200ms)',
      transitionTimingFunction: 'var(--ease-out)',
    },
  },
  
  // Open state - always in main flow
  rootOpen: {
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-highlight-subtle)',
    overflow: 'hidden',
    
    '@media (min-width: 1200px)': {
      position: 'relative',
      left: 'auto',
      right: 'auto',
      width: '100%',
      marginBlock: 'var(--space-md)',
      animationName: {
        from: { 
          opacity: 0.8,
        },
        to: { 
          opacity: 1,
        },
      },
      animationDuration: 'var(--duration-normal, 200ms)',
      animationTimingFunction: 'var(--ease-out)',
    },
  },
  
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    paddingTop: 'var(--space-xs)',
    paddingBottom: 'var(--space-xs)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-highlight-subtle)',
    border: '1px dashed var(--color-highlight)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      borderColor: 'var(--color-highlight)',
      color: 'var(--color-highlight)',
    },
  },
  
  triggerOpen: {
    borderTopLeftRadius: 'var(--radius-md)',
    borderTopRightRadius: 'var(--radius-md)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'transparent',
  },
  
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'var(--color-highlight-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-highlight)',
  },
  
  title: {
    flexGrow: 1,
    fontWeight: 500,
  },
  
  chevron: {
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  
  content: {
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
  },
  
  contentHidden: {
    display: 'none',
  },
  
  body: {
    // Paragraph margins
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
});

// ============================================
// MARGIN CALCULATION
// ============================================

function calculatePreferredMargin(element: HTMLElement): 'left' | 'right' {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top + window.scrollY;
  const elementHeight = rect.height;
  const contentBody = element.closest('.content-node__body');
  
  if (!contentBody) return 'right';
  
  // Query for closed collapsibles using data attributes
  const questions = contentBody.querySelectorAll('[data-collapsible="question"]:not([data-open="true"])');
  const metaphors = contentBody.querySelectorAll('[data-collapsible="metaphor"]:not([data-open="true"])');
  const recognitions = contentBody.querySelectorAll('[data-collapsible="recognition"]:not([data-open="true"])');
  
  const getVerticalGap = (otherElement: Element): number => {
    const otherRect = otherElement.getBoundingClientRect();
    const otherTop = otherRect.top + window.scrollY;
    const otherBottom = otherTop + otherRect.height;
    const thisBottom = elementTop + elementHeight;
    
    if (elementTop < otherBottom && thisBottom > otherTop) return 0;
    if (elementTop >= otherBottom) return elementTop - otherBottom;
    return otherTop - thisBottom;
  };
  
  let minLeftDistance = Infinity;
  let minRightDistance = Infinity;
  
  // Questions go in left margin
  questions.forEach(q => {
    if (q !== element) minLeftDistance = Math.min(minLeftDistance, getVerticalGap(q));
  });
  
  // Metaphors go in right margin
  metaphors.forEach(m => {
    if (m !== element) minRightDistance = Math.min(minRightDistance, getVerticalGap(m));
  });
  
  // Recognition can be in either margin
  recognitions.forEach(r => {
    if (r !== element) {
      const gap = getVerticalGap(r);
      const rMargin = r.getAttribute('data-margin');
      if (rMargin === 'left') {
        minLeftDistance = Math.min(minLeftDistance, gap);
      } else {
        minRightDistance = Math.min(minRightDistance, gap);
      }
    }
  });
  
  return minLeftDistance > minRightDistance ? 'left' : 'right';
}

// ============================================
// COMPONENT
// ============================================

interface RecognitionProps {
  title?: string;
  children: JSX.Element | JSX.Element[];
}

export function Recognition({ title = "You've seen this", children }: RecognitionProps) {
  const { isOpen, triggerProps, rootProps } = useCollapsible({
    type: 'recognition',
  });
  const [margin, setMargin] = useState<'left' | 'right'>('right');
  const ref = useRef<HTMLElement>(null);
  const styles = useStyles();
  
  useEffect(() => {
    if (ref.current) {
      const updateMargin = () => {
        if (ref.current) setMargin(calculatePreferredMargin(ref.current));
      };
      
      const timeout = setTimeout(updateMargin, 100);
      window.addEventListener('resize', updateMargin);
      
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateMargin);
      };
    }
  }, []);
  
  return (
    <aside 
      ref={ref}
      {...rootProps}
      data-margin={margin}
      className={mergeClasses(
        'recognition', // Keep base class for parent CSS Grid positioning reference
        styles.root,
        !isOpen && margin === 'left' && styles.rootLeftDesktop,
        !isOpen && margin === 'right' && styles.rootRightDesktop,
        isOpen && styles.rootOpen
      )}
    >
      <button
        type="button"
        className={mergeClasses(
          styles.trigger,
          isOpen && styles.triggerOpen
        )}
        {...triggerProps}
        aria-label={isOpen ? 'Close recognition' : title}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className={styles.title}>{title}</span>
        <span className={mergeClasses(
          styles.chevron,
          isOpen && styles.chevronOpen
        )} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {/* Always render content for SSR, hide via CSS */}
      <div className={mergeClasses(
        styles.content,
        !isOpen && styles.contentHidden
      )}>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </aside>
  );
}
