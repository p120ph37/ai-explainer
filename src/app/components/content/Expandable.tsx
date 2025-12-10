/**
 * Expandable section component
 * 
 * Used for progressive disclosure of deeper detail.
 */

import { useState } from 'preact/hooks';
import type { ExpandableProps } from '../../../content/_types.ts';

export function Expandable({ 
  title, 
  level = 'standard', 
  defaultOpen = false,
  children 
}: ExpandableProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const className = [
    'expandable',
    level === 'advanced' && 'expandable--advanced',
  ].filter(Boolean).join(' ');
  
  return (
    <details 
      className={className}
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="expandable__trigger">
        <span>{title}</span>
        <svg 
          className="expandable__icon" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </summary>
      <div className="expandable__content">
        {children}
      </div>
    </details>
  );
}



