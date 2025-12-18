/**
 * Tests for SitemapDiagram component
 */

import { test, expect, describe } from 'bun:test';
import { render } from 'preact-render-to-string';
import { SitemapDiagram } from '@/app/components/diagrams/SitemapDiagram.tsx';
import type { ContentMeta } from '@/lib/content.ts';

describe('SitemapDiagram', () => {
  test('renders without errors for valid graph', () => {
    const allMeta: Record<string, ContentMeta> = {
      'intro': { 
        id: 'intro', 
        title: 'Introduction', 
        summary: 'Getting started', 
        children: ['tokens'], 
        related: [] 
      },
      'tokens': { 
        id: 'tokens', 
        title: 'Tokens', 
        summary: 'About tokens', 
        children: [], 
        related: [] 
      },
    };
    
    // Should not throw
    expect(() => {
      render(<SitemapDiagram allMeta={allMeta} />);
    }).not.toThrow();
  });
  
  test('shows error for broken links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'intro': { 
        id: 'intro', 
        title: 'Introduction', 
        summary: 'Getting started', 
        children: ['nonexistent'], 
        related: [] 
      },
    };
    
    const html = render(<SitemapDiagram allMeta={allMeta} />);
    
    // Should contain error message
    expect(html).toContain('Content Graph Validation Error');
    expect(html).toContain('nonexistent');
  });
  
  test('shows error for circular ancestry', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['b'], related: [] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['a'], related: [] },
    };
    
    const html = render(<SitemapDiagram allMeta={allMeta} />);
    
    // Should contain error message
    expect(html).toContain('Content Graph Validation Error');
    expect(html).toContain('Circular ancestry');
  });
  
  test('renders SVG for valid graph', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root': { 
        id: 'root', 
        title: 'Root', 
        summary: 'Summary', 
        children: ['child1', 'child2'], 
        related: [] 
      },
      'child1': { 
        id: 'child1', 
        title: 'Child 1', 
        summary: 'Summary', 
        children: [], 
        related: ['child2'] 
      },
      'child2': { 
        id: 'child2', 
        title: 'Child 2', 
        summary: 'Summary', 
        children: [], 
        related: [] 
      },
    };
    
    const html = render(<SitemapDiagram allMeta={allMeta} />);
    
    // Should contain SVG element
    expect(html).toContain('<svg');
    expect(html).toContain('</svg>');
  });
});



