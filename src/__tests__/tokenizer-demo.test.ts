/**
 * Tests for the TokenizerDemo widget
 */

import { describe, test, expect } from 'bun:test';
import { encode, decode } from 'gpt-tokenizer';

describe('TokenizerDemo', () => {
  describe('gpt-tokenizer integration', () => {
    test('encodes simple text correctly', () => {
      const tokens = encode('Hello');
      expect(tokens).toBeInstanceOf(Array);
      expect(tokens.length).toBeGreaterThan(0);
    });

    test('decodes tokens back to original text', () => {
      const text = 'Hello, world!';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('common words become single tokens', () => {
      // "Hello" should be a single token in GPT-4o encoding
      const tokens = encode('Hello');
      expect(tokens.length).toBe(1);
    });

    test('longer text produces more tokens', () => {
      const shortText = 'Hi';
      const longText = 'Hello, how are you doing today?';
      
      const shortTokens = encode(shortText);
      const longTokens = encode(longText);
      
      expect(longTokens.length).toBeGreaterThan(shortTokens.length);
    });

    test('handles special characters', () => {
      const text = '!@#$%^&*()';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('handles unicode characters', () => {
      const text = '你好世界';
      const tokens = encode(text);
      expect(tokens.length).toBeGreaterThan(0);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('handles newlines and tabs', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('empty string produces no tokens', () => {
      const tokens = encode('');
      expect(tokens.length).toBe(0);
    });

    test('individual tokens can be decoded', () => {
      const text = 'Hello world';
      const tokens = encode(text);
      
      // Each token should decode to something
      for (const token of tokens) {
        const decoded = decode([token]);
        expect(typeof decoded).toBe('string');
        expect(decoded.length).toBeGreaterThan(0);
      }
    });
  });

  describe('stats calculations', () => {
    test('calculates correct token count', () => {
      const text = 'Hello, how are you?';
      const tokens = encode(text);
      expect(tokens.length).toBe(6); // Based on GPT-4o tokenization
    });

    test('calculates chars per token ratio', () => {
      const text = 'Hello, how are you?';
      const tokens = encode(text);
      const charCount = text.length;
      const tokenCount = tokens.length;
      const ratio = charCount / tokenCount;
      
      // Typical ratio is around 3-4 chars per token
      expect(ratio).toBeGreaterThan(2);
      expect(ratio).toBeLessThan(6);
    });

    test('whitespace is preserved in tokens', () => {
      const text = 'word word';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });
  });

  describe('edge cases', () => {
    test('handles very long text', () => {
      const longText = 'word '.repeat(100);
      const tokens = encode(longText);
      expect(tokens.length).toBeGreaterThan(50);
    });

    test('handles repeated characters', () => {
      const text = 'aaaaaaaaaa';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('handles mixed case', () => {
      const text = 'HeLLo WoRLD';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('handles numbers', () => {
      const text = '12345 67890';
      const tokens = encode(text);
      const decoded = decode(tokens);
      expect(decoded).toBe(text);
    });

    test('technical jargon may split into multiple tokens', () => {
      // Uncommon words often get split
      const tokens = encode('antidisestablishmentarianism');
      expect(tokens.length).toBeGreaterThan(1);
    });
  });
});
