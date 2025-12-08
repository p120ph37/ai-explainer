/**
 * Term component
 * 
 * Renders a link to another concept with a tooltip preview.
 * Used for the "optionally opaque" unexplained terms.
 */

import { useState } from 'preact/hooks';
import { navigateTo } from '../../router.ts';
import { getNodeMeta } from '../../../content/_registry.ts';
import type { TermProps } from '../../../content/_types.ts';

export function Term({ id, children }: TermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const meta = getNodeMeta(id);
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    navigateTo(id, { addToPath: true });
  };
  
  return (
    <span 
      className="term-link"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <a 
        href={`#/${id}`}
        onClick={handleClick}
        tabIndex={0}
      >
        {children}
      </a>
      {showTooltip && meta && (
        <span className="term-link__tooltip" role="tooltip">
          {meta.summary}
        </span>
      )}
    </span>
  );
}

