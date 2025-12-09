/**
 * Simple responsive wrapper for diagrams
 * 
 * Pure CSS implementation without visx dependencies.
 */

import type { JSX } from 'preact';

interface ResponsiveDiagramProps {
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  ariaLabel?: string;
  children: JSX.Element | JSX.Element[];
}

export function ResponsiveDiagram({
  minHeight = 200,
  maxHeight = 500,
  className = '',
  ariaLabel,
  children,
}: ResponsiveDiagramProps) {
  return (
    <div 
      className={`diagram-container ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
      }}
    >
      {children}
    </div>
  );
}
