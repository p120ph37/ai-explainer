/**
 * Interactive Tokenizer Demo
 * 
 * Real-time tokenization visualization using gpt-tokenizer.
 * Shows how text is split into tokens as the user types.
 */

import { useState, useCallback, useMemo } from 'preact/hooks';
import type { JSX } from 'preact';

// Import the o200k_base encoding (used by GPT-5, GPT-4o, o1, o3, and other modern OpenAI models)
import { encode, decode } from 'gpt-tokenizer';

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
    <div className="tokenizer-demo">
      {title && <div className="tokenizer-demo__title">{title}</div>}
      
      <div className="tokenizer-demo__input-section">
        <label className="tokenizer-demo__label" htmlFor="tokenizer-input">
          Type or paste text to tokenize:
        </label>
        <textarea
          id="tokenizer-input"
          className="tokenizer-demo__textarea"
          value={inputText}
          onInput={handleInputChange}
          placeholder="Enter text to see how it gets tokenized..."
          rows={3}
          maxLength={maxLength}
        />
        <div className="tokenizer-demo__char-count">
          {charCount} / {maxLength} characters
        </div>
      </div>
      
      <div className="tokenizer-demo__output-section">
        <div className="tokenizer-demo__output-label">Tokens:</div>
        <div className="tokenizer-demo__tokens">
          {tokens.length === 0 ? (
            <span className="tokenizer-demo__empty">Enter text above to see tokens</span>
          ) : (
            tokens.map((token, i) => (
              <span
                key={`${i}-${token.id}`}
                className="tokenizer-demo__token"
                style={{
                  backgroundColor: tokenColors[i % tokenColors.length],
                }}
                title={`Token ID: ${token.id}`}
              >
                <span className="tokenizer-demo__token-text">
                  {token.text.replace(/ /g, '␣').replace(/\n/g, '↵').replace(/\t/g, '⇥')}
                </span>
                {showIds && (
                  <span className="tokenizer-demo__token-id">{token.id}</span>
                )}
              </span>
            ))
          )}
        </div>
      </div>
      
      <div className="tokenizer-demo__stats">
        <div className="tokenizer-demo__stat">
          <span className="tokenizer-demo__stat-value">{tokenCount}</span>
          <span className="tokenizer-demo__stat-label">tokens</span>
        </div>
        <div className="tokenizer-demo__stat">
          <span className="tokenizer-demo__stat-value">{charCount}</span>
          <span className="tokenizer-demo__stat-label">characters</span>
        </div>
        <div className="tokenizer-demo__stat">
          <span className="tokenizer-demo__stat-value">~{ratio}</span>
          <span className="tokenizer-demo__stat-label">chars/token</span>
        </div>
      </div>
      
      <div className="tokenizer-demo__hint">
        <strong>Try it:</strong> Paste common words vs. technical jargon. Notice how frequently-used words become single tokens while rare words get split into pieces.
      </div>
    </div>
  );
}
