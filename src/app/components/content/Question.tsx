/**
 * Question component
 * 
 * Left-margin aside for deeper questions and philosophical tangents.
 * Lives in the left margin on desktop, expands into main flow.
 */

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

interface QuestionProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export function Question({ title, children }: QuestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <aside className={`question ${isOpen ? 'question--open' : ''}`}>
      <button
        type="button"
        className="question__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close question' : title}
      >
        <span className="question__icon" aria-hidden="true">
          {/* Question mark icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9a3 3 0 1 1 4 2.83c-.5.29-1 .84-1 1.42V14" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className="question__title">{title}</span>
        <span className="question__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="question__content">
          <div className="question__body">
            {children}
          </div>
        </div>
      )}
    </aside>
  );
}

