/**
 * Tests for the progress tracking system
 * 
 * NOTE: These tests are skipped when PROGRESS_TRACKING_DISABLED is true
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
  progressState,
  getNodeProgress,
  getQuestStatus,
  countDiscoveredTopics,
  isTopicDiscovered,
  markTopicDiscovered,
  markVisited,
  updateExploredPercent,
  markQuestComplete,
  resetNodeProgress,
  resetAllProgress,
  questStatusInfo,
  PROGRESS_TRACKING_DISABLED,
} from '@/app/progress.ts';

// Skip all tests in this file if progress tracking is disabled
const describeIfEnabled = PROGRESS_TRACKING_DISABLED ? describe.skip : describe;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// @ts-ignore - mock global localStorage
globalThis.localStorage = localStorageMock;

describeIfEnabled('Progress Tracking', () => {
  beforeEach(() => {
    // Reset all progress before each test
    resetAllProgress();
    localStorageMock.clear();
  });

  describe('getNodeProgress', () => {
    test('returns default progress for unknown node', () => {
      const progress = getNodeProgress('unknown-node');
      expect(progress.exploredPercent).toBe(0);
    });

    test('returns stored progress for known node', () => {
      updateExploredPercent('test-node', 50);
      const progress = getNodeProgress('test-node');
      expect(progress.exploredPercent).toBe(50);
    });
  });

  describe('isTopicDiscovered', () => {
    test('returns false for undiscovered topic', () => {
      expect(isTopicDiscovered('new-topic')).toBe(false);
    });

    test('returns true for discovered topic', () => {
      markTopicDiscovered('new-topic', null);
      expect(isTopicDiscovered('new-topic')).toBe(true);
    });
  });

  describe('markTopicDiscovered', () => {
    test('adds topic to discovered list', () => {
      const wasNew = markTopicDiscovered('topic-1', null);
      expect(wasNew).toBe(true);
      expect(isTopicDiscovered('topic-1')).toBe(true);
    });

    test('returns false for already discovered topic', () => {
      markTopicDiscovered('topic-1', null);
      const wasNew = markTopicDiscovered('topic-1', null);
      expect(wasNew).toBe(false);
    });

    test('sets discoveredAt timestamp', () => {
      const before = Date.now();
      markTopicDiscovered('topic-1', null);
      const after = Date.now();
      
      const progress = getNodeProgress('topic-1');
      expect(progress.discoveredAt).toBeGreaterThanOrEqual(before);
      expect(progress.discoveredAt).toBeLessThanOrEqual(after);
    });
  });

  describe('markVisited', () => {
    test('marks topic as visited', () => {
      markVisited('topic-1');
      const progress = getNodeProgress('topic-1');
      expect(progress.visitedAt).toBeDefined();
    });

    test('also marks topic as discovered if not already', () => {
      markVisited('topic-1');
      expect(isTopicDiscovered('topic-1')).toBe(true);
    });
  });

  describe('updateExploredPercent', () => {
    test('updates explored percent', () => {
      updateExploredPercent('topic-1', 50);
      expect(getNodeProgress('topic-1').exploredPercent).toBe(50);
    });

    test('only increases, never decreases (high water mark)', () => {
      updateExploredPercent('topic-1', 75);
      updateExploredPercent('topic-1', 50);
      expect(getNodeProgress('topic-1').exploredPercent).toBe(75);
    });

    test('caps at 100', () => {
      updateExploredPercent('topic-1', 150);
      expect(getNodeProgress('topic-1').exploredPercent).toBe(100);
    });
  });

  describe('countDiscoveredTopics', () => {
    test('returns 0 for empty array', () => {
      expect(countDiscoveredTopics([])).toBe(0);
    });

    test('returns 0 for null/undefined', () => {
      expect(countDiscoveredTopics(null)).toBe(0);
      expect(countDiscoveredTopics(undefined)).toBe(0);
    });

    test('counts discovered topics correctly', () => {
      markTopicDiscovered('topic-1', null);
      markTopicDiscovered('topic-2', null);
      
      const count = countDiscoveredTopics(['topic-1', 'topic-2', 'topic-3']);
      expect(count).toBe(2);
    });
  });

  describe('getQuestStatus', () => {
    test('returns undiscovered for unknown topic', () => {
      expect(getQuestStatus('unknown')).toBe('undiscovered');
    });

    test('returns discovered for topic with no visit', () => {
      markTopicDiscovered('topic-1', null);
      expect(getQuestStatus('topic-1')).toBe('discovered');
    });

    test('returns in_progress for visited but incomplete topic', () => {
      markVisited('topic-1');
      updateExploredPercent('topic-1', 50);
      expect(getQuestStatus('topic-1')).toBe('in_progress');
    });

    test('returns complete when 100% explored and no linked topics', () => {
      markVisited('topic-1');
      updateExploredPercent('topic-1', 100);
      expect(getQuestStatus('topic-1', [])).toBe('complete');
    });

    test('returns in_progress when 100% explored but linked topics not discovered', () => {
      markVisited('topic-1');
      updateExploredPercent('topic-1', 100);
      expect(getQuestStatus('topic-1', ['topic-2', 'topic-3'])).toBe('in_progress');
    });

    test('returns complete when 100% explored and all linked topics discovered', () => {
      markVisited('topic-1');
      updateExploredPercent('topic-1', 100);
      markTopicDiscovered('topic-2', null);
      markTopicDiscovered('topic-3', null);
      expect(getQuestStatus('topic-1', ['topic-2', 'topic-3'])).toBe('complete');
    });
  });

  describe('markQuestComplete', () => {
    test('sets explored percent to 100', () => {
      markQuestComplete('topic-1');
      expect(getNodeProgress('topic-1').exploredPercent).toBe(100);
    });

    test('marks as discovered and visited', () => {
      markQuestComplete('topic-1');
      expect(isTopicDiscovered('topic-1')).toBe(true);
      expect(getNodeProgress('topic-1').visitedAt).toBeDefined();
    });
  });

  describe('resetNodeProgress', () => {
    test('removes node from progress state', () => {
      markVisited('topic-1');
      updateExploredPercent('topic-1', 75);
      
      resetNodeProgress('topic-1');
      
      expect(isTopicDiscovered('topic-1')).toBe(false);
      expect(getNodeProgress('topic-1').exploredPercent).toBe(0);
    });
  });

  describe('questStatusInfo', () => {
    test('has info for all statuses', () => {
      expect(questStatusInfo.undiscovered).toBeDefined();
      expect(questStatusInfo.discovered).toBeDefined();
      expect(questStatusInfo.in_progress).toBeDefined();
      expect(questStatusInfo.complete).toBeDefined();
    });

    test('each status has icon, label, and className', () => {
      for (const status of Object.values(questStatusInfo)) {
        expect(status.icon).toBeDefined();
        expect(status.label).toBeDefined();
        expect(status.className).toBeDefined();
      }
    });
  });
});

describeIfEnabled('Persistence', () => {
  beforeEach(() => {
    resetAllProgress();
    localStorageMock.clear();
  });

  test('saves progress to localStorage', () => {
    markTopicDiscovered('topic-1', null);
    
    const stored = localStorageMock.getItem('ai-explainer-progress-v4');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.allDiscoveredTopics).toContain('topic-1');
  });

  test('resetAllProgress clears localStorage', () => {
    markTopicDiscovered('topic-1', null);
    resetAllProgress();
    
    const stored = localStorageMock.getItem('ai-explainer-progress-v4');
    expect(stored).toBeNull();
  });
});
