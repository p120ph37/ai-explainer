/**
 * Tests for link extraction from MDX content
 */

import { test, expect, describe } from 'bun:test';
import { extractInternalLinks } from '@/lib/link-extraction.ts';

describe('extractInternalLinks', () => {
  const validPageIds = new Set(['intro', 'tokens', 'scale', 'emergence', 'context-window']);
  
  test('extracts markdown links with leading slash', () => {
    const content = `
# Test Content

Here is a link to [tokens](/tokens) and [scale](/scale).
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['scale', 'tokens']);
  });
  
  test('extracts markdown links with ./ prefix', () => {
    const content = `
Check out [tokens](./tokens) for more info.
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['tokens']);
  });
  
  test('extracts markdown links without prefix', () => {
    const content = `
See [tokens](tokens) and [scale](scale).
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['scale', 'tokens']);
  });
  
  test('ignores external links', () => {
    const content = `
External: [Google](https://google.com)
Internal: [tokens](/tokens)
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['tokens']);
  });
  
  test('ignores anchor links', () => {
    const content = `
Same page: [section](#section-id)
Other page: [tokens](/tokens)
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['tokens']);
  });
  
  test('strips anchor fragments from links', () => {
    const content = `
Link with anchor: [tokens](/tokens#section)
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['tokens']);
  });
  
  test('extracts Term component links', () => {
    const content = `
<Term id="tokens">tokens</Term> and <Term id="scale" />
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['scale', 'tokens']);
  });
  
  test('only includes valid page IDs', () => {
    const content = `
Valid: [tokens](/tokens)
Invalid: [nonexistent](/nonexistent)
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['tokens']);
  });
  
  test('returns unique sorted links', () => {
    const content = `
[tokens](/tokens) and [tokens](/tokens) and [scale](/scale)
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['scale', 'tokens']);
  });
  
  test('handles complex MDX with multiple link types', () => {
    const content = `
---
id: test
---

import { Term } from '@/components'

# Test Page

Check out [tokens](/tokens) for basics.

→ [What is Scale?](/scale)

<Term id="emergence">Emergence</Term> is interesting.

[External link](https://example.com) should be ignored.
[Same page](#anchor) should be ignored.
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual(['emergence', 'scale', 'tokens']);
  });
  
  test('handles empty content', () => {
    const links = extractInternalLinks('', validPageIds);
    expect(links).toEqual([]);
  });
  
  test('handles content with no links', () => {
    const content = `
# Page Title

Just some text with no links.
    `;
    
    const links = extractInternalLinks(content, validPageIds);
    expect(links).toEqual([]);
  });
});



