/**
 * Tests for content structure validation
 * 
 * These tests verify that all content nodes have proper metadata,
 * valid links, and consistent structure.
 */

import { describe, test, expect } from 'bun:test';
import {
  contentRegistry,
  getAllNodeIds,
  getNodeMeta,
} from '@/lib/content.ts';
import type { ContentMeta } from '@/lib/content.ts';

describe('Content Structure', () => {
  describe('All registered nodes', () => {
    test('have required metadata fields', async () => {
      const allIds = getAllNodeIds();
      
      // Skip if no nodes are loaded yet
      if (allIds.length === 0) {
        console.log('No nodes loaded - skipping metadata validation');
        return;
      }
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        // Skip test-specific nodes (from other test files)
        if (nodeId.startsWith('test-') || 
            nodeId.startsWith('get-test-') || 
            nodeId.startsWith('all-test-') ||
            nodeId.startsWith('full-meta-') ||
            nodeId.startsWith('parent-') ||
            nodeId.startsWith('isolated-') ||
            nodeId.startsWith('alias-')) {
          continue;
        }
        
        expect(meta).toBeDefined();
        expect(meta?.id).toBe(nodeId);
        expect(meta?.title).toBeTruthy();
        expect(meta?.summary).toBeTruthy();
        expect(typeof meta?.title).toBe('string');
        expect(typeof meta?.summary).toBe('string');
      }
    });

    test('have valid category when specified', async () => {
      const validCategories = [
        'Getting Started',
        'Foundations',
        'Ecosystem',
        'Safety & Alignment',
      ];
      
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        // Skip test-specific nodes
        if (nodeId.startsWith('test-') || 
            nodeId.startsWith('get-test-') || 
            nodeId.startsWith('all-test-') ||
            nodeId.startsWith('full-meta-') ||
            nodeId.startsWith('parent-') ||
            nodeId.startsWith('isolated-') ||
            nodeId.startsWith('alias-')) {
          continue;
        }
        
        if (meta?.category) {
          expect(validCategories).toContain(meta.category);
        }
      }
    });

    test('have numeric order when specified', async () => {
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        if (meta?.order !== undefined) {
          expect(typeof meta.order).toBe('number');
          expect(meta.order).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Links validation', () => {
    test('children references are non-empty strings', async () => {
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        if (meta?.children) {
          for (const childId of meta.children) {
            expect(typeof childId).toBe('string');
            expect(childId.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('related references are non-empty strings', async () => {
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        if (meta?.related) {
          for (const relatedId of meta.related) {
            expect(typeof relatedId).toBe('string');
            expect(relatedId.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('prerequisites references are non-empty strings', async () => {
      const allIds = getAllNodeIds();
      
      for (const nodeId of allIds) {
        const meta = getNodeMeta(nodeId);
        
        if (meta?.prerequisites) {
          for (const prereqId of meta.prerequisites) {
            expect(typeof prereqId).toBe('string');
            expect(prereqId.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});

describe('Content Registry API', () => {
  test('exposes expected methods', () => {
    expect(contentRegistry.getNode).toBeDefined();
    expect(contentRegistry.getMeta).toBeDefined();
    expect(contentRegistry.getAllIds).toBeDefined();
    expect(contentRegistry.getRelated).toBeDefined();
    expect(contentRegistry.prefetch).toBeDefined();
  });

  test('getMeta is a function', () => {
    expect(typeof contentRegistry.getMeta).toBe('function');
  });

  test('getNode is a function', () => {
    expect(typeof contentRegistry.getNode).toBe('function');
  });

  test('getAllIds returns an array', () => {
    const result = contentRegistry.getAllIds();
    expect(Array.isArray(result)).toBe(true);
  });
});
