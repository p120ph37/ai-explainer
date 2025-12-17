/**
 * Tests for link enhancement utilities
 */

import { describe, test, expect } from 'bun:test';
import {
  parseInternalLink,
  shouldEnhanceLink,
  getEnhancementConfig,
  calculateExplorationPercent,
  calculateSectionVisibility,
  isElementInViewport,
  extractNodeIdFromHref,
} from '@/app/utils/link-enhancement.ts';
import type { QuestStatus } from '@/app/progress.ts';

describe('parseInternalLink', () => {
  test('returns null for null/empty href', () => {
    expect(parseInternalLink(null)).toBeNull();
    expect(parseInternalLink('')).toBeNull();
  });

  test('returns null for external links', () => {
    expect(parseInternalLink('https://example.com')).toBeNull();
    expect(parseInternalLink('http://example.com')).toBeNull();
    expect(parseInternalLink('//example.com')).toBeNull();
  });

  test('returns null for non-path links', () => {
    expect(parseInternalLink('tokens')).toBeNull();
    expect(parseInternalLink('#tokens')).toBeNull();
    expect(parseInternalLink('#/tokens')).toBeNull(); // Hash-based not supported
  });

  test('returns null for file paths', () => {
    expect(parseInternalLink('/file.html')).toBeNull();
    expect(parseInternalLink('/path/file.js')).toBeNull();
    expect(parseInternalLink('/styles/main.css')).toBeNull();
  });

  test('parses valid internal links', () => {
    const result = parseInternalLink('/tokens');
    expect(result).not.toBeNull();
    expect(result?.nodeId).toBe('tokens');
    expect(result?.isInternal).toBe(true);
    expect(result?.href).toBe('/tokens');
  });

  test('handles hyphenated node IDs', () => {
    const result = parseInternalLink('/context-window');
    expect(result?.nodeId).toBe('context-window');
  });

  test('handles complex node IDs', () => {
    const result = parseInternalLink('/what-is-llm');
    expect(result?.nodeId).toBe('what-is-llm');
  });

  test('extracts first path segment as node ID', () => {
    const result = parseInternalLink('/tokens/details');
    expect(result?.nodeId).toBe('tokens');
  });

  test('returns null for invalid node ID characters', () => {
    expect(parseInternalLink('/node with spaces')).toBeNull();
    expect(parseInternalLink('/node?query=1')).toBeNull();
  });
});

describe('shouldEnhanceLink', () => {
  test('returns true for new unenhanced links', () => {
    const element = {
      dataset: {},
      closest: () => null,
    };
    expect(shouldEnhanceLink(element)).toBe(true);
  });

  test('returns false for already enhanced links', () => {
    const element = {
      dataset: { enhanced: 'true' },
      closest: () => null,
    };
    expect(shouldEnhanceLink(element)).toBe(false);
  });

  test('returns false for links already wrapped', () => {
    const mockWrapper = document.createElement('span');
    const element = {
      dataset: {},
      closest: (selector: string) => selector === '.internal-link' ? mockWrapper : null,
    };
    expect(shouldEnhanceLink(element)).toBe(false);
  });

  test('handles missing dataset', () => {
    const element = {
      closest: () => null,
    };
    expect(shouldEnhanceLink(element)).toBe(true);
  });
});

describe('getEnhancementConfig', () => {
  test('generates correct config for discovered status', () => {
    const statusInfo = { icon: '○', label: 'Discovered', className: 'quest-discovered' };
    const config = getEnhancementConfig('tokens', 'discovered', statusInfo, 'What are tokens?');
    
    expect(config.wrapperClass).toBe('internal-link internal-link--discovered');
    expect(config.statusClass).toBe('internal-link__status');
    expect(config.statusIcon).toBe('○');
    expect(config.statusLabel).toBe('Discovered');
    expect(config.titleText).toBe('What are tokens?');
  });

  test('generates correct config for complete status', () => {
    const statusInfo = { icon: '●', label: 'Complete', className: 'quest-complete' };
    const config = getEnhancementConfig('intro', 'complete', statusInfo, 'What is an LLM?');
    
    expect(config.wrapperClass).toBe('internal-link internal-link--complete');
    expect(config.statusIcon).toBe('●');
  });

  test('generates correct config for undiscovered status', () => {
    const statusInfo = { icon: '○', label: 'Undiscovered', className: 'quest-undiscovered' };
    const config = getEnhancementConfig('hardware', 'undiscovered', statusInfo, 'AI Hardware');
    
    expect(config.wrapperClass).toBe('internal-link internal-link--undiscovered');
  });

  test('generates correct config for in_progress status', () => {
    const statusInfo = { icon: '◐', label: 'In Progress', className: 'quest-in-progress' };
    const config = getEnhancementConfig('training', 'in_progress', statusInfo, 'How AI learns');
    
    expect(config.wrapperClass).toBe('internal-link internal-link--in_progress');
    expect(config.statusIcon).toBe('◐');
  });
});

describe('calculateExplorationPercent', () => {
  test('returns 100 when total height is 0', () => {
    expect(calculateExplorationPercent(0, 0)).toBe(100);
  });

  test('returns 0 when nothing has been seen', () => {
    expect(calculateExplorationPercent(1000, 0)).toBe(0);
  });

  test('returns 100 when everything has been seen', () => {
    expect(calculateExplorationPercent(1000, 1000)).toBe(100);
  });

  test('calculates correct percentages', () => {
    expect(calculateExplorationPercent(1000, 500)).toBe(50);
    expect(calculateExplorationPercent(1000, 250)).toBe(25);
    expect(calculateExplorationPercent(1000, 750)).toBe(75);
  });

  test('rounds to nearest integer', () => {
    expect(calculateExplorationPercent(1000, 333)).toBe(33);
    expect(calculateExplorationPercent(1000, 666)).toBe(67);
  });

  test('caps at 100', () => {
    expect(calculateExplorationPercent(500, 1000)).toBe(100);
  });

  test('never goes below 0', () => {
    expect(calculateExplorationPercent(1000, -100)).toBe(0);
  });
});

describe('calculateSectionVisibility', () => {
  test('returns full height when section is fully in view', () => {
    // Section from 100-200, viewport bottom at 300
    expect(calculateSectionVisibility(100, 100, 300)).toBe(100);
  });

  test('returns partial height when section is partially visible', () => {
    // Section from 100-200, viewport bottom at 150
    expect(calculateSectionVisibility(100, 100, 150)).toBe(50);
  });

  test('returns 0 when section is not yet visible', () => {
    // Section from 200-300, viewport bottom at 100
    expect(calculateSectionVisibility(200, 100, 100)).toBe(0);
  });

  test('handles section at top of page', () => {
    expect(calculateSectionVisibility(0, 100, 50)).toBe(50);
    expect(calculateSectionVisibility(0, 100, 100)).toBe(100);
    expect(calculateSectionVisibility(0, 100, 200)).toBe(100);
  });

  test('handles edge case at section boundary', () => {
    // Viewport exactly at section top
    expect(calculateSectionVisibility(100, 100, 100)).toBe(0);
    // Viewport exactly at section bottom
    expect(calculateSectionVisibility(100, 100, 200)).toBe(100);
  });
});

describe('isElementInViewport', () => {
  const viewportHeight = 768;

  test('returns true for element fully in viewport', () => {
    const rect = { top: 100, bottom: 200, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(true);
  });

  test('returns true for element at top edge', () => {
    const rect = { top: 0, bottom: 100, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(true);
  });

  test('returns true for element partially visible at bottom', () => {
    const rect = { top: 700, bottom: 800, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(true);
  });

  test('returns true for element partially visible at top', () => {
    const rect = { top: -50, bottom: 50, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(true);
  });

  test('returns false for element above viewport', () => {
    const rect = { top: -200, bottom: -100, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(false);
  });

  test('returns false for element below viewport', () => {
    const rect = { top: 800, bottom: 900, height: 100, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(false);
  });

  test('returns false for zero-height element', () => {
    const rect = { top: 100, bottom: 100, height: 0, width: 100 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(false);
  });

  test('returns false for zero-width element', () => {
    const rect = { top: 100, bottom: 200, height: 100, width: 0 };
    expect(isElementInViewport(rect, viewportHeight)).toBe(false);
  });
});

describe('extractNodeIdFromHref', () => {
  test('extracts from path format', () => {
    expect(extractNodeIdFromHref('/tokens')).toBe('tokens');
    expect(extractNodeIdFromHref('/context-window')).toBe('context-window');
  });

  test('extracts first segment from deep paths', () => {
    expect(extractNodeIdFromHref('/tokens/details')).toBe('tokens');
  });

  test('returns null for empty string', () => {
    expect(extractNodeIdFromHref('')).toBeNull();
  });

  test('returns null for external URLs', () => {
    expect(extractNodeIdFromHref('//cdn.example.com')).toBeNull();
    expect(extractNodeIdFromHref('https://example.com')).toBeNull();
  });

  test('returns null for file paths', () => {
    expect(extractNodeIdFromHref('/file.html')).toBeNull();
    expect(extractNodeIdFromHref('/path/to/file.js')).toBeNull();
  });

  test('returns null for hash-based links', () => {
    expect(extractNodeIdFromHref('#/tokens')).toBeNull();
    expect(extractNodeIdFromHref('#ref-1')).toBeNull();
  });
});
