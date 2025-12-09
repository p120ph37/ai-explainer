/**
 * Tests for the theme management system
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
  getEffectiveTheme,
  getThemePreference,
  setTheme,
  toggleTheme,
} from '../app/theme.ts';

// Mock matchMedia
const createMatchMedia = (matches: boolean) => ({
  matches,
  addEventListener: mock(() => {}),
  removeEventListener: mock(() => {}),
});

// @ts-ignore - mock matchMedia
globalThis.window.matchMedia = mock((query: string) => {
  if (query === '(prefers-color-scheme: dark)') {
    return createMatchMedia(false); // Default to light system preference
  }
  return createMatchMedia(false);
});

describe('Theme Management', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset matchMedia to default light preference
    // @ts-ignore
    globalThis.window.matchMedia = mock((query: string) => {
      if (query === '(prefers-color-scheme: dark)') {
        return createMatchMedia(false);
      }
      return createMatchMedia(false);
    });
  });

  describe('getEffectiveTheme', () => {
    test('returns light when localStorage says light', () => {
      localStorage.setItem('ai-explainer-theme', 'light');
      expect(getEffectiveTheme()).toBe('light');
    });

    test('returns dark when localStorage says dark', () => {
      localStorage.setItem('ai-explainer-theme', 'dark');
      expect(getEffectiveTheme()).toBe('dark');
    });

    test('falls back to system preference when no localStorage', () => {
      // Default system preference is light (set in mock)
      expect(getEffectiveTheme()).toBe('light');
    });

    test('respects dark system preference', () => {
      // @ts-ignore - mock dark system preference
      globalThis.window.matchMedia = mock(() => createMatchMedia(true));
      
      expect(getEffectiveTheme()).toBe('dark');
    });
  });

  describe('getThemePreference', () => {
    test('returns system when no preference stored', () => {
      expect(getThemePreference()).toBe('system');
    });

    test('returns stored preference', () => {
      localStorage.setItem('ai-explainer-theme', 'dark');
      expect(getThemePreference()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    test('stores light theme in localStorage', () => {
      setTheme('light');
      expect(localStorage.getItem('ai-explainer-theme')).toBe('light');
    });

    test('stores dark theme in localStorage', () => {
      setTheme('dark');
      expect(localStorage.getItem('ai-explainer-theme')).toBe('dark');
    });

    test('removes localStorage entry for system theme', () => {
      localStorage.setItem('ai-explainer-theme', 'dark');
      setTheme('system');
      expect(localStorage.getItem('ai-explainer-theme')).toBeNull();
    });
  });

  describe('toggleTheme', () => {
    test('toggles from light to dark', () => {
      localStorage.setItem('ai-explainer-theme', 'light');
      toggleTheme();
      expect(localStorage.getItem('ai-explainer-theme')).toBe('dark');
    });

    test('toggles from dark to light', () => {
      localStorage.setItem('ai-explainer-theme', 'dark');
      toggleTheme();
      expect(localStorage.getItem('ai-explainer-theme')).toBe('light');
    });

    test('toggles based on effective theme when system is set', () => {
      // System preference is light (default mock)
      // So toggling should go to dark
      toggleTheme();
      expect(localStorage.getItem('ai-explainer-theme')).toBe('dark');
    });
  });
});

