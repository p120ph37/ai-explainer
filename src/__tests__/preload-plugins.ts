/**
 * Plugin preload for tests
 * 
 * Sets up the test environment with content metadata.
 * No virtual modules needed - we just mock the window globals
 * that the registry reads from.
 */

import { Glob } from "bun";
import { readFileSync } from 'fs';

const CONTENT_DIR = './src/content';

/**
 * Parse YAML frontmatter from MDX content
 */
function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const yaml = match[1];
  const result: Record<string, any> = {};
  
  const lines = yaml.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;
  
  for (const line of lines) {
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      if (currentArray && currentKey) {
        currentArray.push(value);
      }
      continue;
    }
    
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
      }
      
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      
      if (value === '' || value === '[]') {
        currentArray = [];
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, '');
        currentKey = null;
        currentArray = null;
      }
    }
  }
  
  if (currentKey && currentArray) {
    result[currentKey] = currentArray;
  }
  
  return result;
}

/**
 * Scan content directory for MDX files
 */
function scanContent(): Array<{ id: string; meta: any }> {
  const glob = new Glob("*.mdx");
  const contents: Array<{ id: string; meta: any }> = [];
  
  for (const filename of glob.scanSync(CONTENT_DIR)) {
    const id = filename.replace('.mdx', '');
    const path = `${CONTENT_DIR}/${filename}`;
    const content = readFileSync(path, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    
    const meta = {
      id,
      title: frontmatter.title || id,
      summary: frontmatter.summary || '',
      order: frontmatter.order ? parseInt(frontmatter.order, 10) : undefined,
      prerequisites: frontmatter.prerequisites,
      keywords: frontmatter.keywords,
    };
    
    contents.push({ id, meta });
  }
  
  // Sort by order, then by id
  contents.sort((a, b) => {
    const orderA = a.meta.order ?? 999;
    const orderB = b.meta.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
  
  return contents;
}

// Scan content at preload time
const scannedContents = scanContent();

// Build the globals that the registry expects
const contentMeta: Record<string, any> = {};
const contentIds: string[] = [];

for (const c of scannedContents) {
  contentMeta[c.id] = c.meta;
  contentIds.push(c.id);
}

// Set up global mocks for browser environment
// @ts-expect-error - mocking global for tests
globalThis.window = globalThis.window || {};
// @ts-expect-error - mocking global for tests  
globalThis.window.__CONTENT_META__ = contentMeta;
// @ts-expect-error - mocking global for tests
globalThis.window.__CONTENT_IDS__ = contentIds;
