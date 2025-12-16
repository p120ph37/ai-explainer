/**
 * Preact Alias Plugin for Bun
 * 
 * Aliases React → preact/compat so React-based libraries work with Preact.
 * 
 * This is useful for:
 * - @griffel/react (CSS-in-JS)
 * - visx (data visualization)
 * - Any other React library you want to use with Preact
 * 
 * Important: Paths must be absolute for Bun's bundler.
 */

import type { BunPlugin } from 'bun';

// Resolve paths once at startup for performance
const preactCompatPath = require.resolve('preact/compat');
const preactJsxRuntimePath = require.resolve('preact/jsx-runtime');

export const preactAliasPlugin: BunPlugin = {
  name: 'preact-alias',
  
  setup(build) {
    // react → preact/compat
    build.onResolve({ filter: /^react$/ }, () => ({
      path: preactCompatPath,
    }));
    
    // react-dom → preact/compat
    build.onResolve({ filter: /^react-dom$/ }, () => ({
      path: preactCompatPath,
    }));
    
    // react-dom/client → preact/compat
    build.onResolve({ filter: /^react-dom\/client$/ }, () => ({
      path: preactCompatPath,
    }));
    
    // react/jsx-runtime → preact/jsx-runtime
    build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
      path: preactJsxRuntimePath,
    }));
  },
};

export default preactAliasPlugin;

