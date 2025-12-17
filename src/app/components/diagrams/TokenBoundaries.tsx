/**
 * Token boundaries visualization
 * 
 * Shows how text is split into tokens with visual boundaries.
 * CSS-based rather than SVG for better text handling.
 */

import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';

const useStyles = makeStyles({
  container: {
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  title: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-sm)',
  },
  original: {
    marginBottom: 'var(--space-md)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-sm)',
  },
  originalLabel: {
    color: 'var(--color-text-muted)',
    marginRight: 'var(--space-xs)',
  },
  originalText: {
    backgroundColor: 'var(--color-bg-subtle)',
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    borderRadius: 'var(--radius-sm)',
  },
  tokensContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-base)',
    lineHeight: 1.6,
  },
  token: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  tokenHighlight: {
    borderColor: 'var(--color-accent)',
    borderWidth: '2px',
  },
  tokenText: {
    whiteSpace: 'pre',
  },
  tokenId: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-3xs)',
  },
  count: {
    marginTop: 'var(--space-sm)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'right',
  },
});

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
  const styles = useStyles();
  
  return (
    <div className={styles.container}>
      {title && <div className={styles.title}>{title}</div>}
      
      {originalText && (
        <div className={styles.original}>
          <span className={styles.originalLabel}>Original:</span>
          <code className={styles.originalText}>{originalText}</code>
        </div>
      )}
      
      <div className={styles.tokensContainer}>
        {tokens.map((token, i) => (
          <span
            key={i}
            className={mergeClasses(styles.token, token.highlight && styles.tokenHighlight)}
            style={{
              backgroundColor: token.highlight 
                ? highlightColor 
                : tokenColors[i % tokenColors.length],
            }}
          >
            <span className={styles.tokenText}>
              {token.text.replace(/ /g, '␣')}
            </span>
            {showIds && token.id !== undefined && (
              <span className={styles.tokenId}>{token.id}</span>
            )}
          </span>
        ))}
      </div>
      
      <div className={styles.count}>
        {tokens.length} token{tokens.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

