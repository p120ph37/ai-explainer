/**
 * Tests for link extraction from MDX content
 */

import { test, expect, describe } from 'bun:test';
import { extractInternalLinks, extractInternalLinksWithValidation } from '@/lib/link-extraction.ts';

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

describe('extractInternalLinksWithValidation', () => {
  const validPageIds = new Set(['intro', 'tokens', 'scale']);
  
  test('returns both valid and invalid links', () => {
    const content = `
Valid: [tokens](/tokens)
Invalid: [nonexistent](/nonexistent)
Also invalid: <Term id="missing" />
    `;
    
    const result = extractInternalLinksWithValidation(content, validPageIds);
    expect(result.links).toEqual(['tokens']);
    expect(result.invalidLinks).toEqual(['missing', 'nonexistent']);
  });
  
  test('returns empty invalidLinks when all links are valid', () => {
    const content = `[tokens](/tokens) and [scale](/scale)`;
    
    const result = extractInternalLinksWithValidation(content, validPageIds);
    expect(result.links).toEqual(['scale', 'tokens']);
    expect(result.invalidLinks).toEqual([]);
  });
  
  test('detects invalid Term component references', () => {
    const content = `<Term id="nonexistent">text</Term>`;
    
    const result = extractInternalLinksWithValidation(content, validPageIds);
    expect(result.links).toEqual([]);
    expect(result.invalidLinks).toEqual(['nonexistent']);
  });
});

describe('Content link integrity', () => {
  test('all internal links in non-draft pages point to valid pages', async () => {
    const CONTENT_DIR = './src/content';
    
    // Parse frontmatter to check draft status
    function parseFrontmatter(content: string): Record<string, any> {
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match || !match[1]) return {};
      
      const yaml = match[1];
      const result: Record<string, any> = {};
      
      for (const line of yaml.split('\n')) {
        const kvMatch = line.match(/^(\w+):\s*(.*)$/);
        if (kvMatch && kvMatch[1] && kvMatch[2] !== undefined) {
          const value = kvMatch[2].trim();
          if (value === 'true') result[kvMatch[1]] = true;
          else if (value === 'false') result[kvMatch[1]] = false;
          else if (value && value !== '[]') result[kvMatch[1]] = value.replace(/^["']|["']$/g, '');
        }
      }
      
      return result;
    }
    
    // Discover all MDX files
    const glob = new Bun.Glob('**/*.mdx');
    const files: Array<{ id: string; path: string; isDraft: boolean }> = [];
    
    for await (const filename of glob.scan(CONTENT_DIR)) {
      const id = filename.replace('.mdx', '');
      const path = `${CONTENT_DIR}/${filename}`;
      const text = await Bun.file(path).text();
      const frontmatter = parseFrontmatter(text);
      const isDraft = frontmatter.draft === true;
      
      files.push({ id, path, isDraft });
    }
    
    // Get valid page IDs (non-draft, non-variant)
    const validPageIds = new Set(
      files
        .filter(f => !f.isDraft && !f.id.includes('/'))
        .map(f => f.id)
    );
    
    const brokenLinks: Array<{ page: string; invalidLinks: string[] }> = [];
    
    // Check each non-draft, non-variant page for broken links
    for (const file of files) {
      // Skip drafts and variants
      if (file.isDraft || file.id.includes('/')) continue;
      
      const text = await Bun.file(file.path).text();
      const result = extractInternalLinksWithValidation(text, validPageIds);
      
      if (result.invalidLinks.length > 0) {
        brokenLinks.push({
          page: file.id,
          invalidLinks: result.invalidLinks,
        });
      }
    }
    
    // Format error message if there are broken links
    if (brokenLinks.length > 0) {
      const errorMessages = brokenLinks.map(
        ({ page, invalidLinks }) => `  ${page}: ${invalidLinks.join(', ')}`
      ).join('\n');
      
      throw new Error(
        `Found broken internal links in non-draft pages:\n${errorMessages}`
      );
    }
    
    expect(brokenLinks).toEqual([]);
  });
});

