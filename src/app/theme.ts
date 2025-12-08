/**
 * Theme management
 * 
 * Handles light/dark theme switching with system preference detection
 * and localStorage persistence.
 */

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ai-explainer-theme';

/**
 * Get the current effective theme (resolving 'system' to actual value)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // Use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the user's theme preference (may be 'system')
 */
export function getThemePreference(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
}

/**
 * Set the theme preference
 */
export function setTheme(theme: Theme): void {
  if (theme === 'system') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
  }
  
  applyTheme();
}

/**
 * Toggle between light and dark (skipping system)
 */
export function toggleTheme(): void {
  const current = getEffectiveTheme();
  setTheme(current === 'light' ? 'dark' : 'light');
}

/**
 * Apply the current theme to the document
 */
function applyTheme(): void {
  const theme = getEffectiveTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  applyTheme();
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
      applyTheme();
    }
  });
}

