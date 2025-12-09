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
import type { CitationType } from '../../../content/_types.ts';
import type { ComponentChildren } from 'preact';

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
  return (
    <section className="sources">
      <h4 className="sources__title">Further Reading</h4>
      <div className="sources__list">
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
  return (
    <section className="sources sources--references">
      <h4 className="sources__title">References</h4>
      <div className="references__list">
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
  
  return (
    <div 
      className="citation"
      id={id !== undefined ? `ref-${id}` : undefined}
      data-ref-id={id}
    >
      <span className={`citation__type citation__type--${type}`}>
        {emoji} {label}
      </span>
      <div className="citation__info">
        <a href={url} target="_blank" rel="noopener noreferrer" className="citation__title">
          {title}
        </a>
        {id !== undefined && (
          <span className="citation__ref-number">[{id}]</span>
        )}
        {metaParts.length > 0 && (
          <div className="citation__meta">
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
  
  const metaParts = [
    authors,
    source,
    year?.toString(),
  ].filter(Boolean);
  
  return (
    <div className="reference" id={`ref-${id}`} data-ref-id={id}>
      <span className="reference__number">{id}.</span>
      <a href={`#fn-${id}`} className="reference__backlink" aria-label="Back to text">
        ↩
      </a>
      <span className="reference__type">{emoji}</span>
      <div className="reference__info">
        <a href={url} target="_blank" rel="noopener noreferrer" className="reference__title">
          {title}
        </a>
        {metaParts.length > 0 && (
          <span className="reference__meta"> — {metaParts.join(', ')}</span>
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
      citation.classList.add('citation--highlighted');
      setTimeout(() => {
        citation.classList.remove('citation--highlighted');
      }, 2000);
    }
  };
  
  return (
    <sup 
      className="footnote" 
      id={`fn-${id}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a 
        href={`#ref-${id}`} 
        className="footnote__link" 
        aria-label={tooltipTitle ? `Reference ${id}: ${tooltipTitle}` : `Reference ${id}`}
        onClick={handleClick}
      >
        [{id}]
      </a>
      {showTooltip && tooltipTitle && (
        <span className="footnote__tooltip" role="tooltip">
          {tooltipTitle}
        </span>
      )}
    </sup>
  );
}

// Keep Sources as an alias for backwards compatibility, but it's deprecated
export function Sources({ children }: { children: ComponentChildren }) {
  return (
    <section className="sources">
      <h4 className="sources__title">Sources & Further Reading</h4>
      <div className="sources__list">
        {children}
      </div>
    </section>
  );
}
