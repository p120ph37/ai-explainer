/**
 * Token boundaries visualization
 * 
 * Shows how text is split into tokens with visual boundaries.
 * CSS-based rather than SVG for better text handling.
 */

import type { JSX } from 'preact';

export interface TokenData {
  text: string;
  id?: number;
  highlight?: boolean;
}

interface TokenBoundariesProps {
  tokens: TokenData[];
  /** Show token IDs below each token */
  showIds?: boolean;
  /** Highlight color for special tokens */
  highlightColor?: string;
  /** Title for the visualization */
  title?: string;
  /** Show the original text above */
  originalText?: string;
}

// Color palette for tokens (cycles through)
const tokenColors = [
  'var(--token-color-1, #e8f4f8)',
  'var(--token-color-2, #fef3e2)',
  'var(--token-color-3, #f0e8f8)',
  'var(--token-color-4, #e8f8e8)',
  'var(--token-color-5, #f8e8e8)',
  'var(--token-color-6, #e8e8f8)',
];

export function TokenBoundaries({
  tokens,
  showIds = false,
  highlightColor = 'var(--color-accent-light, #fff3cd)',
  title,
  originalText,
}: TokenBoundariesProps) {
  return (
    <div className="token-boundaries">
      {title && <div className="token-boundaries__title">{title}</div>}
      
      {originalText && (
        <div className="token-boundaries__original">
          <span className="token-boundaries__original-label">Original:</span>
          <code className="token-boundaries__original-text">{originalText}</code>
        </div>
      )}
      
      <div className="token-boundaries__container">
        {tokens.map((token, i) => (
          <span
            key={i}
            className={`token-boundaries__token ${token.highlight ? 'token-boundaries__token--highlight' : ''}`}
            style={{
              backgroundColor: token.highlight 
                ? highlightColor 
                : tokenColors[i % tokenColors.length],
            }}
          >
            <span className="token-boundaries__text">
              {token.text.replace(/ /g, '␣')}
            </span>
            {showIds && token.id !== undefined && (
              <span className="token-boundaries__id">{token.id}</span>
            )}
          </span>
        ))}
      </div>
      
      <div className="token-boundaries__count">
        {tokens.length} token{tokens.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

