/**
 * Test setup and common mocks
 * 
 * This file is automatically loaded before tests run.
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Mock window object for non-browser environment
const windowMock = {
  location: {
    hash: '',
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
  },
  history: {
    pushState: () => {},
    replaceState: () => {},
    back: () => {},
    forward: () => {},
    go: () => {},
    length: 1,
    state: null,
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  innerWidth: 1024,
  innerHeight: 768,
  getComputedStyle: () => ({
    getPropertyValue: () => '',
  }),
  localStorage: localStorageMock,
  requestAnimationFrame: (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id: number) => clearTimeout(id),
};

// Set up globals
if (typeof globalThis.localStorage === 'undefined') {
  // @ts-ignore
  globalThis.localStorage = localStorageMock;
}

if (typeof globalThis.window === 'undefined') {
  // @ts-ignore
  globalThis.window = windowMock;
}

// Mock document for DOM operations
const documentMock = {
  createElement: (tag: string) => ({
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => false,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }),
    setAttribute: () => {},
    getAttribute: () => null,
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: {
    appendChild: () => {},
    removeChild: () => {},
    classList: {
      add: () => {},
      remove: () => {},
    },
  },
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => null,
    style: {},
  },
  head: {
    appendChild: () => {},
  },
};

if (typeof globalThis.document === 'undefined') {
  // @ts-ignore
  globalThis.document = documentMock;
}

// Export mocks for use in tests
export { localStorageMock, windowMock, documentMock };

