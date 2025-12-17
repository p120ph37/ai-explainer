/**
 * Sources, Citations, and Footnotes
 * 
 * Two-part sources section:
 * 1. FurtherReading: approachable, general resources
 * 2. References: numbered footnotes linked from specific points in text
 * 
 * Footnotes link to citations via id prop. When clicked:
 * - Smoothly scrolls to the citation
 * - Highlights/flashes the citation
 * - Shows tooltip with citation title on hover
 */

import { useState, useEffect } from 'preact/hooks';
import { makeStyles, mergeClasses } from '@griffel/react';
import type { ComponentChildren } from 'preact';

// ============================================
// STYLES (Griffel - AOT compiled)
// ============================================

const useStyles = makeStyles({
  // Sources section container
  sources: {
    marginTop: 'var(--space-xl)',
    paddingTop: 'var(--space-lg)',
    borderTop: '1px solid var(--color-border-subtle)',
  },
  
  sourcesReferences: {
    borderTop: '1px dashed var(--color-border-subtle)',
  },
  
  sourcesTitle: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-sm)',
  },
  
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  
  // Citation styles
  citation: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    fontSize: 'var(--font-size-sm)',
  },
  
  citationType: {
    flexShrink: 0,
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 500,
  },
  
  citationTypePaper: {
    backgroundColor: 'color-mix(in srgb, var(--color-cite-paper) 15%, transparent)',
    color: 'var(--color-cite-paper)',
  },
  
  citationTypeVideo: {
    backgroundColor: 'color-mix(in srgb, var(--color-cite-video) 15%, transparent)',
    color: 'var(--color-cite-video)',
  },
  
  citationTypeDocs: {
    backgroundColor: 'color-mix(in srgb, var(--color-cite-docs) 15%, transparent)',
    color: 'var(--color-cite-docs)',
  },
  
  citationTypeArticle: {
    backgroundColor: 'color-mix(in srgb, var(--color-cite-article) 15%, transparent)',
    color: 'var(--color-cite-article)',
  },
  
  citationInfo: {
    flex: 1,
  },
  
  citationTitle: {
    color: 'var(--color-link)',
  },
  
  citationRefNumber: {
    color: 'var(--color-accent)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    marginLeft: 'var(--space-2xs)',
    opacity: 0.8,
  },
  
  citationMeta: {
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-3xs)',
  },
  
  // Highlight animation for citations
  citationHighlighted: {
    borderRadius: 'var(--radius-sm)',
    animationName: {
      '0%, 20%': { 
        backgroundColor: 'var(--color-accent-subtle)',
        boxShadow: '0 0 0 4px var(--color-accent-subtle)',
      },
      '100%': { 
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    animationDuration: '2s',
    animationTimingFunction: 'ease-out',
  },
  
  // Reference styles
  referencesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  
  reference: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-xs)',
    fontSize: 'var(--font-size-sm)',
  },
  
  referenceNumber: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-text-subtle)',
    minWidth: '1.5em',
    flexShrink: 0,
  },
  
  referenceBacklink: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-subtle)',
    textDecorationLine: 'none',
    opacity: 0.6,
    transitionProperty: 'opacity',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover': {
      opacity: 1,
    },
  },
  
  referenceType: {
    fontSize: 'var(--font-size-xs)',
  },
  
  referenceInfo: {
    flex: 1,
  },
  
  referenceTitle: {
    color: 'var(--color-link)',
  },
  
  referenceMeta: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-xs)',
  },
  
  // Footnote styles
  footnote: {
    position: 'relative',
    fontSize: '0.75em',
    lineHeight: 1,
    verticalAlign: 'super',
  },
  
  footnoteLink: {
    color: 'var(--color-accent)',
    textDecorationLine: 'none',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    paddingLeft: '0.1em',
    paddingRight: '0.1em',
    borderRadius: 'var(--radius-sm)',
    transitionProperty: 'background',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover': {
      backgroundColor: 'var(--color-accent-subtle)',
    },
  },
  
  footnoteTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    paddingTop: 'var(--space-2xs)',
    paddingBottom: 'var(--space-2xs)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'normal',
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 100,
    boxShadow: 'var(--shadow-md)',
    pointerEvents: 'none',
    animationName: {
      from: {
        opacity: 0,
        transform: 'translateX(-50%) translateY(4px)',
      },
      to: {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0)',
      },
    },
    animationDuration: '0.15s',
    animationTimingFunction: 'ease-out',
  },
});

type CitationType = 'paper' | 'video' | 'docs' | 'article';

// Registry to store citation titles for footnote tooltips
const citationRegistry: Map<number, string> = new Map();

export function getCitationTitle(id: number): string | undefined {
  return citationRegistry.get(id);
}

export function registerCitation(id: number, title: string): void {
  citationRegistry.set(id, title);
}

// Type labels for citations
const typeLabels: Record<CitationType, { emoji: string; label: string }> = {
  paper: { emoji: '📄', label: 'Paper' },
  video: { emoji: '🎬', label: 'Video' },
  docs: { emoji: '📖', label: 'Docs' },
  article: { emoji: '🔗', label: 'Article' },
};

// ============================================
// Further Reading Section (standalone, not nested)
// ============================================

interface FurtherReadingProps {
  children: ComponentChildren;
}

export function FurtherReading({ children }: FurtherReadingProps) {
  const styles = useStyles();
  return (
    <section className={styles.sources}>
      <h4 className={styles.sourcesTitle}>Further Reading</h4>
      <div className={styles.sourcesList}>
        {children}
      </div>
    </section>
  );
}

// ============================================
// References Section (standalone, not nested)
// ============================================

interface ReferencesProps {
  children: ComponentChildren;
}

export function References({ children }: ReferencesProps) {
  const styles = useStyles();
  return (
    <section className={mergeClasses(styles.sources, styles.sourcesReferences)}>
      <h4 className={styles.sourcesTitle}>References</h4>
      <div className={styles.referencesList}>
        {children}
      </div>
    </section>
  );
}

// ============================================
// Citation (for Further Reading)
// ============================================

interface CitationProps {
  /** Optional footnote ID - if provided, this citation can be linked from a Footnote */
  id?: number;
  type: CitationType;
  title: string;
  url: string;
  authors?: string;
  source?: string;
  year?: number;
}

export function Citation({ id, type, title, url, authors, source, year }: CitationProps) {
  const { emoji, label } = typeLabels[type];
  const styles = useStyles();
  
  // Register this citation's title for footnote tooltips
  useEffect(() => {
    if (id !== undefined) {
      // Strip the [N] suffix from title if present for cleaner tooltip
      const cleanTitle = title.replace(/\s*\[\d+\]\s*$/, '');
      registerCitation(id, cleanTitle);
    }
  }, [id, title]);
  
  const metaParts = [
    authors,
    source,
    year?.toString(),
  ].filter(Boolean);
  
  const typeStyle = type === 'paper' ? styles.citationTypePaper
    : type === 'video' ? styles.citationTypeVideo
    : type === 'docs' ? styles.citationTypeDocs
    : styles.citationTypeArticle;
  
  return (
    <div 
      className={styles.citation}
      id={id !== undefined ? `ref-${id}` : undefined}
      data-ref-id={id}
    >
      <span className={mergeClasses(styles.citationType, typeStyle)}>
        {emoji} {label}
      </span>
      <div className={styles.citationInfo}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.citationTitle}>
          {title}
        </a>
        {id !== undefined && (
          <span className={styles.citationRefNumber}>[{id}]</span>
        )}
        {metaParts.length > 0 && (
          <div className={styles.citationMeta}>
            {metaParts.join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Reference (Numbered, for footnotes)
// ============================================

interface ReferenceProps {
  id: number;
  type?: CitationType;
  title: string;
  url: string;
  authors?: string;
  source?: string;
  year?: number;
}

export function Reference({ id, type = 'article', title, url, authors, source, year }: ReferenceProps) {
  const { emoji } = typeLabels[type];
  const styles = useStyles();
  
  const metaParts = [
    authors,
    source,
    year?.toString(),
  ].filter(Boolean);
  
  return (
    <div className={styles.reference} id={`ref-${id}`} data-ref-id={id}>
      <span className={styles.referenceNumber}>{id}.</span>
      <a href={`#fn-${id}`} className={styles.referenceBacklink} aria-label="Back to text">
        ↩
      </a>
      <span className={styles.referenceType}>{emoji}</span>
      <div className={styles.referenceInfo}>
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.referenceTitle}>
          {title}
        </a>
        {metaParts.length > 0 && (
          <span className={styles.referenceMeta}> — {metaParts.join(', ')}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Footnote (Inline marker that links to reference)
// ============================================

interface FootnoteProps {
  id: number;
}

export function Footnote({ id }: FootnoteProps) {
  const [tooltipTitle, setTooltipTitle] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const styles = useStyles();
  
  // Get the citation title for tooltip (may not be available immediately)
  useEffect(() => {
    // Small delay to ensure citation has registered
    const timer = setTimeout(() => {
      const title = getCitationTitle(id);
      if (title) {
        setTooltipTitle(title);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [id]);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    
    // Find the citation element and scroll to it
    const citation = document.getElementById(`ref-${id}`);
    if (citation) {
      // Scroll smoothly to the citation
      citation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Trigger highlight animation
      citation.classList.add(styles.citationHighlighted);
      setTimeout(() => {
        citation.classList.remove(styles.citationHighlighted);
      }, 2000);
    }
  };
  
  return (
    <sup 
      className={styles.footnote} 
      id={`fn-${id}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a 
        href={`#ref-${id}`} 
        className={styles.footnoteLink} 
        aria-label={tooltipTitle ? `Reference ${id}: ${tooltipTitle}` : `Reference ${id}`}
        onClick={handleClick}
      >
        [{id}]
      </a>
      {showTooltip && tooltipTitle && (
        <span className={styles.footnoteTooltip} role="tooltip">
          {tooltipTitle}
        </span>
      )}
    </sup>
  );
}

// Keep Sources as an alias for backwards compatibility, but it's deprecated
export function Sources({ children }: { children: ComponentChildren }) {
  const styles = useStyles();
  return (
    <section className={styles.sources}>
      <h4 className={styles.sourcesTitle}>Sources & Further Reading</h4>
      <div className={styles.sourcesList}>
        {children}
      </div>
    </section>
  );
}
