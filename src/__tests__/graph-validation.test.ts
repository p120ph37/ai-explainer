/**
 * Tests for content graph validation
 */

import { test, expect, describe } from 'bun:test';
import {
  buildGraph,
  validateNobrokenLinks,
  detectCycles,
  validateContentGraph,
  getRootNodes,
  buildTreeStructure,
  getCrossLinks,
  type GraphNode,
} from '@/lib/graph-validation.ts';
import type { ContentMeta } from '@/lib/content.ts';

describe('buildGraph', () => {
  test('excludes draft pages', () => {
    const allMeta: Record<string, ContentMeta> = {
      'page1': { id: 'page1', title: 'Page 1', summary: 'Summary 1', children: [], related: [] },
      'page2': { id: 'page2', title: 'Page 2', summary: 'Summary 2', draft: true, children: [], related: [] },
      'page3': { id: 'page3', title: 'Page 3', summary: 'Summary 3', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    
    expect(graph.size).toBe(2);
    expect(graph.has('page1')).toBe(true);
    expect(graph.has('page2')).toBe(false);
    expect(graph.has('page3')).toBe(true);
  });
  
  test('includes children and related arrays', () => {
    const allMeta: Record<string, ContentMeta> = {
      'parent': { 
        id: 'parent', 
        title: 'Parent', 
        summary: 'Summary', 
        children: ['child1', 'child2'], 
        related: ['related1'] 
      },
    };
    
    const graph = buildGraph(allMeta);
    const node = graph.get('parent');
    
    expect(node).toBeDefined();
    expect(node?.children).toEqual(['child1', 'child2']);
    expect(node?.related).toEqual(['related1']);
  });
});

describe('validateNobrokenLinks', () => {
  test('detects broken children links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'parent': { 
        id: 'parent', 
        title: 'Parent', 
        summary: 'Summary', 
        children: ['nonexistent'], 
        related: [] 
      },
    };
    
    const graph = buildGraph(allMeta);
    const errors = validateNobrokenLinks(graph);
    
    expect(errors.length).toBe(1);
    expect(errors[0]?.type).toBe('broken-link');
    expect(errors[0]?.nodeId).toBe('parent');
    expect(errors[0]?.targetId).toBe('nonexistent');
    expect(errors[0]?.message).toContain('child');
  });
  
  test('detects broken related links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'page': { 
        id: 'page', 
        title: 'Page', 
        summary: 'Summary', 
        children: [], 
        related: ['missing'] 
      },
    };
    
    const graph = buildGraph(allMeta);
    const errors = validateNobrokenLinks(graph);
    
    expect(errors.length).toBe(1);
    expect(errors[0]?.type).toBe('broken-link');
    expect(errors[0]?.nodeId).toBe('page');
    expect(errors[0]?.targetId).toBe('missing');
    expect(errors[0]?.message).toContain('related');
  });
  
  test('passes with valid links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'parent': { 
        id: 'parent', 
        title: 'Parent', 
        summary: 'Summary', 
        children: ['child'], 
        related: ['related'] 
      },
      'child': { 
        id: 'child', 
        title: 'Child', 
        summary: 'Summary', 
        children: [], 
        related: [] 
      },
      'related': { 
        id: 'related', 
        title: 'Related', 
        summary: 'Summary', 
        children: [], 
        related: [] 
      },
    };
    
    const graph = buildGraph(allMeta);
    const errors = validateNobrokenLinks(graph);
    
    expect(errors.length).toBe(0);
  });
});

describe('detectCycles', () => {
  test('detects simple cycle', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['b'], related: [] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['a'], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const errors = detectCycles(graph);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.type).toBe('circular-ancestry');
    expect(errors[0]?.cycle).toBeDefined();
  });
  
  test('detects longer cycle', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['b'], related: [] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['c'], related: [] },
      'c': { id: 'c', title: 'C', summary: 'Summary', children: ['a'], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const errors = detectCycles(graph);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.type).toBe('circular-ancestry');
  });
  
  test('allows DAG structure', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root': { id: 'root', title: 'Root', summary: 'Summary', children: ['a', 'b'], related: [] },
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['c'], related: [] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['c'], related: [] },
      'c': { id: 'c', title: 'C', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const errors = detectCycles(graph);
    
    expect(errors.length).toBe(0);
  });
  
  test('ignores related links for cycle detection', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['b'], related: ['c'] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['c'], related: [] },
      'c': { id: 'c', title: 'C', summary: 'Summary', children: [], related: ['a'] },
    };
    
    const graph = buildGraph(allMeta);
    const errors = detectCycles(graph);
    
    // No cycle because related links don't count as ancestry
    expect(errors.length).toBe(0);
  });
});

describe('validateContentGraph', () => {
  test('throws on broken links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'page': { 
        id: 'page', 
        title: 'Page', 
        summary: 'Summary', 
        children: ['missing'], 
        related: [] 
      },
    };
    
    expect(() => validateContentGraph(allMeta)).toThrow();
  });
  
  test('throws on cycles', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: ['b'], related: [] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: ['a'], related: [] },
    };
    
    expect(() => validateContentGraph(allMeta)).toThrow();
  });
  
  test('passes valid graph', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root': { id: 'root', title: 'Root', summary: 'Summary', children: ['child'], related: [] },
      'child': { id: 'child', title: 'Child', summary: 'Summary', children: [], related: ['root'] },
    };
    
    expect(() => validateContentGraph(allMeta)).not.toThrow();
  });
});

describe('getRootNodes', () => {
  test('identifies nodes with no parents', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root1': { id: 'root1', title: 'Root 1', summary: 'Summary', children: ['child1'], related: [] },
      'root2': { id: 'root2', title: 'Root 2', summary: 'Summary', children: ['child2'], related: [] },
      'child1': { id: 'child1', title: 'Child 1', summary: 'Summary', children: [], related: [] },
      'child2': { id: 'child2', title: 'Child 2', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const roots = getRootNodes(graph);
    
    expect(roots.length).toBe(2);
    expect(roots).toContain('root1');
    expect(roots).toContain('root2');
  });
  
  test('handles isolated nodes', () => {
    const allMeta: Record<string, ContentMeta> = {
      'isolated': { id: 'isolated', title: 'Isolated', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const roots = getRootNodes(graph);
    
    expect(roots.length).toBe(1);
    expect(roots[0]).toBe('isolated');
  });
});

describe('buildTreeStructure', () => {
  test('builds tree from single root', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root': { id: 'root', title: 'Root', summary: 'Summary', children: ['child1', 'child2'], related: [] },
      'child1': { id: 'child1', title: 'Child 1', summary: 'Summary', children: [], related: [] },
      'child2': { id: 'child2', title: 'Child 2', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const tree = buildTreeStructure(graph, 'root');
    
    expect(tree.id).toBe('root');
    expect(tree.name).toBe('Root');
    expect(tree.children?.length).toBe(2);
    expect(tree.children?.[0]?.id).toBe('child1');
    expect(tree.children?.[1]?.id).toBe('child2');
  });
  
  test('builds virtual root for multiple roots', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root1': { id: 'root1', title: 'Root 1', summary: 'Summary', children: [], related: [] },
      'root2': { id: 'root2', title: 'Root 2', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const tree = buildTreeStructure(graph);
    
    expect(tree.id).toBe('__root__');
    expect(tree.children?.length).toBe(2);
  });
  
  test('handles nested hierarchy', () => {
    const allMeta: Record<string, ContentMeta> = {
      'root': { id: 'root', title: 'Root', summary: 'Summary', children: ['child'], related: [] },
      'child': { id: 'child', title: 'Child', summary: 'Summary', children: ['grandchild'], related: [] },
      'grandchild': { id: 'grandchild', title: 'Grandchild', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const tree = buildTreeStructure(graph, 'root');
    
    expect(tree.children?.[0]?.id).toBe('child');
    expect(tree.children?.[0]?.children?.[0]?.id).toBe('grandchild');
  });
});

describe('getCrossLinks', () => {
  test('extracts related links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: [], related: ['b', 'c'] },
      'b': { id: 'b', title: 'B', summary: 'Summary', children: [], related: ['a'] },
      'c': { id: 'c', title: 'C', summary: 'Summary', children: [], related: [] },
    };
    
    const graph = buildGraph(allMeta);
    const links = getCrossLinks(graph);
    
    expect(links.length).toBe(3);
    expect(links.some(l => l.source === 'a' && l.target === 'b')).toBe(true);
    expect(links.some(l => l.source === 'a' && l.target === 'c')).toBe(true);
    expect(links.some(l => l.source === 'b' && l.target === 'a')).toBe(true);
  });
  
  test('ignores broken related links', () => {
    const allMeta: Record<string, ContentMeta> = {
      'a': { id: 'a', title: 'A', summary: 'Summary', children: [], related: ['nonexistent'] },
    };
    
    const graph = buildGraph(allMeta);
    const links = getCrossLinks(graph);
    
    expect(links.length).toBe(0);
  });
});

describe('integration test with real-world structure', () => {
  test('validates typical content structure', () => {
    const allMeta: Record<string, ContentMeta> = {
      'intro': { 
        id: 'intro', 
        title: 'Introduction', 
        summary: 'Getting started', 
        children: ['tokens', 'scale'], 
        related: [] 
      },
      'tokens': { 
        id: 'tokens', 
        title: 'Tokens', 
        summary: 'About tokens', 
        children: ['context-window'], 
        related: ['embeddings'] 
      },
      'scale': { 
        id: 'scale', 
        title: 'Scale', 
        summary: 'Why scale matters', 
        children: [], 
        related: ['emergence'] 
      },
      'context-window': { 
        id: 'context-window', 
        title: 'Context Window', 
        summary: 'Memory limits', 
        children: [], 
        related: [] 
      },
      'embeddings': { 
        id: 'embeddings', 
        title: 'Embeddings', 
        summary: 'Vector representations', 
        children: [], 
        related: ['tokens'] 
      },
      'emergence': { 
        id: 'emergence', 
        title: 'Emergence', 
        summary: 'Emergent behavior', 
        children: [], 
        related: ['scale'] 
      },
    };
    
    // Should not throw
    expect(() => validateContentGraph(allMeta)).not.toThrow();
    
    const graph = buildGraph(allMeta);
    const roots = getRootNodes(graph);
    // intro, embeddings, and emergence are roots (not children of anything)
    expect(roots.length).toBe(3);
    expect(roots).toContain('intro');
    expect(roots).toContain('embeddings');
    expect(roots).toContain('emergence');
    
    const tree = buildTreeStructure(graph, 'intro');
    expect(tree.children?.length).toBe(2);
    
    const crossLinks = getCrossLinks(graph);
    expect(crossLinks.length).toBeGreaterThan(0);
  });
});

