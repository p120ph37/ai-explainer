/**
 * Tests for the content registry
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
  registerMeta,
  getNodeMeta,
  getAllNodeIds,
  getRelatedNodes,
  contentRegistry,
} from '@/lib/content.ts';
import type { ContentMeta } from '@/lib/content.ts';

describe('Content Registry', () => {
  describe('registerMeta', () => {
    test('registers node metadata', () => {
      const meta: ContentMeta = {
        id: 'test-node',
        title: 'Test Node',
        summary: 'A test node',
      };
      
      registerMeta(meta);
      
      const retrieved = getNodeMeta('test-node');
      expect(retrieved).toEqual(meta);
    });

    test('allows updating metadata', () => {
      const meta1: ContentMeta = {
        id: 'test-node-update',
        title: 'Original Title',
        summary: 'Original summary',
      };
      
      const meta2: ContentMeta = {
        id: 'test-node-update',
        title: 'Updated Title',
        summary: 'Updated summary',
      };
      
      registerMeta(meta1);
      registerMeta(meta2);
      
      const retrieved = getNodeMeta('test-node-update');
      expect(retrieved?.title).toBe('Updated Title');
    });
  });

  describe('getNodeMeta', () => {
    test('returns undefined for unregistered node', () => {
      const meta = getNodeMeta('nonexistent-node-12345');
      expect(meta).toBeUndefined();
    });

    test('returns metadata for registered node', () => {
      const meta: ContentMeta = {
        id: 'get-test-node',
        title: 'Get Test Node',
        summary: 'Testing getNodeMeta',
      };
      
      registerMeta(meta);
      
      const retrieved = getNodeMeta('get-test-node');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('get-test-node');
    });
  });

  describe('getAllNodeIds', () => {
    test('returns array of registered node IDs', () => {
      // Register a few test nodes
      registerMeta({ id: 'all-test-1', title: 'Test 1', summary: 'S1' });
      registerMeta({ id: 'all-test-2', title: 'Test 2', summary: 'S2' });
      
      const ids = getAllNodeIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids).toContain('all-test-1');
      expect(ids).toContain('all-test-2');
    });
  });

  describe('getRelatedNodes', () => {
    test('returns empty array for node with no relations', () => {
      registerMeta({
        id: 'isolated-node',
        title: 'Isolated',
        summary: 'No relations',
      });
      
      const related = getRelatedNodes('isolated-node');
      expect(related).toEqual([]);
    });

    test('returns linked nodes', () => {
      registerMeta({
        id: 'linked-node',
        title: 'Linked',
        summary: 'Has links',
        links: ['link-1', 'link-2', 'link-3'],
      });
      
      const related = getRelatedNodes('linked-node');
      expect(related).toContain('link-1');
      expect(related).toContain('link-2');
      expect(related).toContain('link-3');
    });
  });

  describe('contentRegistry object', () => {
    test('exposes expected methods', () => {
      expect(contentRegistry.getNode).toBeDefined();
      expect(contentRegistry.getMeta).toBeDefined();
      expect(contentRegistry.getAllIds).toBeDefined();
      expect(contentRegistry.getRelated).toBeDefined();
      expect(contentRegistry.prefetch).toBeDefined();
    });

    test('getMeta is alias for getNodeMeta', () => {
      const meta: ContentMeta = {
        id: 'alias-test',
        title: 'Alias Test',
        summary: 'Testing alias',
      };
      
      registerMeta(meta);
      
      expect(contentRegistry.getMeta('alias-test')).toEqual(getNodeMeta('alias-test'));
    });
  });
});

describe('ContentMeta validation', () => {
  test('preserves all metadata fields', () => {
    const fullMeta: ContentMeta = {
      id: 'full-meta-test',
      title: 'Full Metadata',
      summary: 'Testing all fields',
      links: ['link-1'],
      prerequisites: ['prereq-1'],
      order: 10,
    };
    
    registerMeta(fullMeta);
    const retrieved = getNodeMeta('full-meta-test');
    
    expect(retrieved?.links).toEqual(['link-1']);
    expect(retrieved?.prerequisites).toEqual(['prereq-1']);
    expect(retrieved?.order).toBe(10);
  });
});

