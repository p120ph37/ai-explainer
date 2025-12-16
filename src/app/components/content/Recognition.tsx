/**
 * Recognition component
 * 
 * Margin aside for "you've seen this" experience connections.
 * Dynamically chooses left or right margin based on available space.
 * 
 * Content is always rendered for SSR, hidden/shown via CSS.
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStylesBase = makeStyles({
  recognition: {
    position: 'relative',
    marginBlockStart: 'var(--space-md)',
    marginBlockEnd: 'var(--space-md)',
  },
  
  recognitionOpen: {
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-highlight-subtle)',
    overflow: 'hidden',
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
  
  body: {},
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
  
  const questions = contentBody.querySelectorAll('.question:not(.question--open)');
  const metaphors = contentBody.querySelectorAll('.metaphor:not(.metaphor--open)');
  const recognitions = contentBody.querySelectorAll('.recognition--aside:not(.recognition--open)');
  
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
  
  questions.forEach(q => {
    if (q !== element) minLeftDistance = Math.min(minLeftDistance, getVerticalGap(q));
  });
  
  metaphors.forEach(m => {
    if (m !== element) minRightDistance = Math.min(minRightDistance, getVerticalGap(m));
  });
  
  recognitions.forEach(r => {
    if (r !== element) {
      const gap = getVerticalGap(r);
      if (r.classList.contains('recognition--left')) {
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
  const [isOpen, setIsOpen] = useState(false);
  const [margin, setMargin] = useState<'left' | 'right'>('right');
  const ref = useRef<HTMLElement>(null);
  const styles = useStylesBase();
  
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
  
  // Keep BEM classes for margin positioning (handled by global CSS)
  const bemClasses = [
    'recognition--aside',
    isOpen && 'recognition--open',
    `recognition--${margin}`,
  ].filter(Boolean).join(' ');
  
  return (
    <aside ref={ref} className={mergeClasses(
      bemClasses,
      styles.recognition,
      isOpen && styles.recognitionOpen
    )}>
      <button
        type="button"
        className={mergeClasses(
          'recognition__trigger',
          styles.trigger,
          isOpen && styles.triggerOpen
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close recognition' : title}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className={mergeClasses('recognition__title', styles.title)}>{title}</span>
        <span className={mergeClasses(
          'recognition__chevron',
          styles.chevron,
          isOpen && styles.chevronOpen,
          isOpen && 'recognition__chevron--open'
        )} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {/* Always render content for SSR, hide via CSS */}
      <div className={mergeClasses(
        'recognition__content',
        styles.content,
        !isOpen && styles.contentHidden,
        !isOpen && 'recognition__content--hidden'
      )}>
        <div className={mergeClasses('recognition__body', styles.body)}>
          {children}
        </div>
      </div>
    </aside>
  );
}
