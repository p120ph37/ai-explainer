/**
 * Metaphor component
 * 
 * Margin note for metaphorical/visual explanations.
 * Lives in the right margin on desktop, expands into main flow.
 * On mobile, shows as a compact icon that expands.
 */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

interface MetaphorProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export function Metaphor({ title, children }: MetaphorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <aside className={`metaphor ${isOpen ? 'metaphor--open' : ''}`}>
      <button
        type="button"
        className="metaphor__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close metaphor' : title}
      >
        <span className="metaphor__icon" aria-hidden="true">
          {/* Eye/vision icon - suggests visual thinking */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <span className="metaphor__title">{title}</span>
        <span className="metaphor__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="metaphor__content">
          <div className="metaphor__body">
            {children}
          </div>
        </div>
      )}
    </aside>
  );
}

