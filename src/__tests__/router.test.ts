/**
 * Tests for the client-side router
 */

import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { currentRoute, navigateTo, navigateUp, initRouter, type RouteState } from '../app/router.ts';

// Mock window.location and history
const mockHistory: { state: RouteState | null }[] = [];
let mockHash = '';

const windowMock = {
  location: {
    get hash() { return mockHash; },
    set hash(value: string) { mockHash = value; },
  },
  history: {
    pushState: (state: RouteState, _: string, url: string) => {
      mockHistory.push({ state });
      mockHash = url;
    },
    replaceState: (state: RouteState, _: string, url: string) => {
      if (mockHistory.length > 0) {
        mockHistory[mockHistory.length - 1] = { state };
      } else {
        mockHistory.push({ state });
      }
      mockHash = url;
    },
  },
  addEventListener: mock(() => {}),
  removeEventListener: mock(() => {}),
};

// @ts-ignore
globalThis.window = windowMock;

describe('Router', () => {
  beforeEach(() => {
    // Reset router state
    mockHash = '';
    mockHistory.length = 0;
    currentRoute.value = { nodeId: 'intro', path: ['intro'] };
  });

  describe('navigateTo', () => {
    test('updates currentRoute', () => {
      navigateTo('tokens');
      expect(currentRoute.value.nodeId).toBe('tokens');
    });

    test('updates URL hash', () => {
      navigateTo('tokens');
      expect(mockHash).toBe('#/tokens');
    });

    test('adds to history by default', () => {
      navigateTo('tokens');
      expect(mockHistory.length).toBe(1);
    });

    test('replaces history when replace option is true', () => {
      navigateTo('tokens');
      navigateTo('embeddings', { replace: true });
      // History should still have only one entry since we replaced
      expect(mockHistory.length).toBe(1);
      expect(currentRoute.value.nodeId).toBe('embeddings');
    });

    test('builds path for lateral navigation', () => {
      currentRoute.value = { nodeId: 'tokens', path: ['intro', 'tokens'] };
      navigateTo('embeddings');
      expect(currentRoute.value.path).toEqual(['intro', 'embeddings']);
    });

    test('builds path for drill-down navigation', () => {
      currentRoute.value = { nodeId: 'tokens', path: ['intro', 'tokens'] };
      navigateTo('context-window', { addToPath: true });
      expect(currentRoute.value.path).toEqual(['intro', 'tokens', 'context-window']);
    });
  });

  describe('navigateUp', () => {
    test('navigates to parent in path', () => {
      currentRoute.value = { nodeId: 'context-window', path: ['intro', 'tokens', 'context-window'] };
      navigateUp();
      expect(currentRoute.value.nodeId).toBe('tokens');
      expect(currentRoute.value.path).toEqual(['intro', 'tokens']);
    });

    test('does nothing when at root', () => {
      currentRoute.value = { nodeId: 'intro', path: ['intro'] };
      navigateUp();
      expect(currentRoute.value.nodeId).toBe('intro');
      expect(currentRoute.value.path).toEqual(['intro']);
    });
  });

  describe('path handling', () => {
    test('handles deep paths', () => {
      navigateTo('tokens', { addToPath: true });
      navigateTo('context-window', { addToPath: true });
      navigateTo('hardware', { addToPath: true });
      
      expect(currentRoute.value.path.length).toBe(4);
      expect(currentRoute.value.path).toEqual(['intro', 'tokens', 'context-window', 'hardware']);
    });

    test('maintains path integrity during lateral navigation', () => {
      currentRoute.value = { nodeId: 'tokens', path: ['intro', 'tokens'] };
      navigateTo('embeddings');
      navigateTo('attention');
      
      expect(currentRoute.value.path).toEqual(['intro', 'attention']);
    });
  });
});

describe('URL Format', () => {
  test('generates correct hash format', () => {
    navigateTo('tokens');
    expect(mockHash).toMatch(/^#\//);
  });

  test('handles multiple path segments', () => {
    currentRoute.value = { nodeId: 'intro', path: ['intro'] };
    navigateTo('tokens', { addToPath: true });
    navigateTo('context-window', { addToPath: true });
    
    expect(mockHash).toBe('#/intro/tokens/context-window');
  });
});

