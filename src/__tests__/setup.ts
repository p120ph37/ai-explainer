/**
 * Test setup using happy-dom for full DOM support
 * 
 * This provides a real DOM environment for testing components,
 * hooks, and DOM manipulation without needing a browser.
 * 
 * Note: Plugins are registered in preload-plugins.ts which runs first.
 */

import { Window } from 'happy-dom';

// Create a happy-dom window instance
const window = new Window({
  url: 'http://localhost:3000',
  width: 1024,
  height: 768,
});

// Get document from window
const document = window.document;

// Set up globals
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = document as unknown as Document;
globalThis.navigator = window.navigator as unknown as Navigator;
globalThis.location = window.location as unknown as Location;
globalThis.history = window.history as unknown as History;
globalThis.localStorage = window.localStorage as unknown as Storage;
globalThis.sessionStorage = window.sessionStorage as unknown as Storage;
globalThis.HTMLElement = window.HTMLElement as unknown as typeof HTMLElement;
globalThis.Element = window.Element as unknown as typeof Element;
globalThis.Node = window.Node as unknown as typeof Node;
globalThis.Event = window.Event as unknown as typeof Event;
globalThis.CustomEvent = window.CustomEvent as unknown as typeof CustomEvent;
globalThis.MouseEvent = window.MouseEvent as unknown as typeof MouseEvent;
globalThis.KeyboardEvent = window.KeyboardEvent as unknown as typeof KeyboardEvent;
globalThis.MutationObserver = window.MutationObserver as unknown as typeof MutationObserver;
globalThis.IntersectionObserver = window.IntersectionObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = window.ResizeObserver as unknown as typeof ResizeObserver;
globalThis.DOMRect = window.DOMRect as unknown as typeof DOMRect;
globalThis.getComputedStyle = window.getComputedStyle.bind(window) as typeof getComputedStyle;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Reset state between tests
beforeEach(() => {
  // Clear localStorage
  localStorage.clear();
  
  // Reset location hash
  window.location.hash = '';
  
  // Clear document body
  document.body.innerHTML = '';
});

// Export for tests that need direct access
export { window, document };

// Helper to set up a basic DOM structure for component tests
export function setupTestDOM(): HTMLElement {
  document.body.innerHTML = `
    <div id="root">
      <main class="content-node__body"></main>
    </div>
  `;
  return document.getElementById('root') as HTMLElement;
}

// Helper to create a mock internal link
export function createMockInternalLink(nodeId: string, text: string = 'Test Link'): HTMLAnchorElement {
  const anchor = document.createElement('a') as HTMLAnchorElement;
  anchor.href = `/${nodeId}`;
  anchor.textContent = text;
  return anchor;
}

// Helper to create a mock element and attach to DOM
export function createMockElement(tag: string = 'div'): HTMLElement {
  const el = document.createElement(tag) as HTMLElement;
  document.body.appendChild(el);
  return el;
}

// Helper to wait for DOM updates
export function waitForDOM(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Helper to simulate scrolling
export function simulateScroll(scrollY: number): void {
  Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });
  window.dispatchEvent(new Event('scroll'));
}
