/**
 * Sources, Citations, and Footnotes
 * 
 * Two-part sources section:
 * 1. FurtherReading: approachable, general resources
 * 2. References: numbered footnotes linked from specific points in text
 */

import type { CitationType } from '../../../content/_types.ts';
import type { ComponentChildren } from 'preact';

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
  type: CitationType;
  title: string;
  url: string;
  authors?: string;
  source?: string;
  year?: number;
}

export function Citation({ type, title, url, authors, source, year }: CitationProps) {
  const { emoji, label } = typeLabels[type];
  
  const metaParts = [
    authors,
    source,
    year?.toString(),
  ].filter(Boolean);
  
  return (
    <div className="citation">
      <span className={`citation__type citation__type--${type}`}>
        {emoji} {label}
      </span>
      <div className="citation__info">
        <a href={url} target="_blank" rel="noopener noreferrer" className="citation__title">
          {title}
        </a>
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
  return (
    <sup className="footnote" id={`fn-${id}`}>
      <a href={`#ref-${id}`} className="footnote__link" aria-label={`Reference ${id}`}>
        [{id}]
      </a>
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
