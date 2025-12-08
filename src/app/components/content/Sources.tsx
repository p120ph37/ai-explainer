/**
 * Sources and Citation components
 * 
 * Renders citations with type indicators.
 */

import type { SourcesProps, CitationProps, CitationType } from '../../../content/_types.ts';

const typeLabels: Record<CitationType, { emoji: string; label: string }> = {
  paper: { emoji: '📄', label: 'Paper' },
  video: { emoji: '🎬', label: 'Video' },
  docs: { emoji: '📖', label: 'Docs' },
  article: { emoji: '🔗', label: 'Article' },
};

export function Sources({ children }: SourcesProps) {
  return (
    <section className="sources">
      <h4 className="sources__title">Sources & Further Reading</h4>
      <div className="sources__list">
        {children}
      </div>
    </section>
  );
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

