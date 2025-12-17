/**
 * Interactive Tokenizer Demo
 * 
 * Real-time tokenization visualization using gpt-tokenizer.
 * Shows how text is split into tokens as the user types.
 */

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles } from '@griffel/react';

// Import the o200k_base encoding (used by GPT-5, GPT-4o, o1, o3, and other modern OpenAI models)
import { encode, decode } from 'gpt-tokenizer';

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
    color: 'var(--color-text)',
    marginBottom: 'var(--space-md)',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 'var(--space-md)',
  },
  label: {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-xs)',
  },
  textarea: {
    width: '100%',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-normal)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    resize: 'vertical',
    minHeight: '80px',
    color: 'var(--color-text)',
    ':focus': {
      outline: 'none',
      borderColor: 'var(--color-accent)',
      boxShadow: '0 0 0 2px var(--color-accent-subtle)',
    },
  },
  charCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'right',
    marginTop: 'var(--space-2xs)',
  },
  outputSection: {
    marginBottom: 'var(--space-md)',
  },
  outputLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-xs)',
  },
  tokens: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-base)',
    lineHeight: 1.6,
    minHeight: '60px',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  empty: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
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
    cursor: 'default',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-sm)',
    },
  },
  tokenText: {
    whiteSpace: 'pre',
  },
  tokenId: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-3xs)',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-lg)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-md)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3xs)',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  statLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  hint: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-md)',
    borderLeft: '3px solid var(--color-accent)',
  },
});

export interface TokenizerDemoProps {
  /** Default text to show */
  defaultText?: string;
  /** Title for the demo */
  title?: string;
  /** Show token IDs */
  showIds?: boolean;
  /** Maximum character limit for input */
  maxLength?: number;
}

interface TokenInfo {
  text: string;
  id: number;
  bytes: number[];
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

export function TokenizerDemo({
  defaultText = 'Hello, how are you?',
  title = 'Interactive Tokenizer',
  showIds = true,
  maxLength = 500,
}: TokenizerDemoProps) {
  const styles = useStyles();
  const [inputText, setInputText] = useState(defaultText);
  
  // Tokenize the input text
  const tokens = useMemo((): TokenInfo[] => {
    if (!inputText) return [];
    
    try {
      const tokenIds = encode(inputText);
      
      // Decode each token individually to get its text
      return tokenIds.map((id) => {
        const text = decode([id]);
        return {
          text,
          id,
          bytes: [], // Could add byte representation if needed
        };
      });
    } catch (error) {
      console.error('Tokenization error:', error);
      return [];
    }
  }, [inputText]);
  
  const handleInputChange = useCallback((e: JSX.TargetedEvent<HTMLTextAreaElement>) => {
    const value = (e.target as HTMLTextAreaElement).value;
    if (value.length <= maxLength) {
      setInputText(value);
    }
  }, [maxLength]);
  
  // Calculate stats
  const charCount = inputText.length;
  const tokenCount = tokens.length;
  const ratio = charCount > 0 ? (charCount / tokenCount).toFixed(1) : '0';
  
  return (
    <div className={styles.container}>
      {title && <div className={styles.title}>{title}</div>}
      
      <div className={styles.inputSection}>
        <label className={styles.label} htmlFor="tokenizer-input">
          Type or paste text to tokenize:
        </label>
        <textarea
          id="tokenizer-input"
          className={styles.textarea}
          value={inputText}
          onInput={handleInputChange}
          placeholder="Enter text to see how it gets tokenized..."
          rows={3}
          maxLength={maxLength}
        />
        <div className={styles.charCount}>
          {charCount} / {maxLength} characters
        </div>
      </div>
      
      <div className={styles.outputSection}>
        <div className={styles.outputLabel}>Tokens:</div>
        <div className={styles.tokens}>
          {tokens.length === 0 ? (
            <span className={styles.empty}>Enter text above to see tokens</span>
          ) : (
            tokens.map((token, i) => (
              <span
                key={`${i}-${token.id}`}
                className={styles.token}
                style={{
                  backgroundColor: tokenColors[i % tokenColors.length],
                }}
                title={`Token ID: ${token.id}`}
              >
                <span className={styles.tokenText}>
                  {token.text.replace(/ /g, '␣').replace(/\n/g, '↵').replace(/\t/g, '⇥')}
                </span>
                {showIds && (
                  <span className={styles.tokenId}>{token.id}</span>
                )}
              </span>
            ))
          )}
        </div>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{tokenCount}</span>
          <span className={styles.statLabel}>tokens</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{charCount}</span>
          <span className={styles.statLabel}>characters</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>~{ratio}</span>
          <span className={styles.statLabel}>chars/token</span>
        </div>
      </div>
      
      <div className={styles.hint}>
        <strong>Try it:</strong> Paste common words vs. technical jargon. Notice how frequently-used words become single tokens while rare words get split into pieces.
      </div>
    </div>
  );
}
