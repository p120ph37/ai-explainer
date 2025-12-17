/**
 * MDX Plugin Configuration
 * 
 * Single source of truth for MDX compilation settings.
 * Used by both:
 * - preload.ts (runtime imports for SSR)
 * - Bun.build() (client-side bundling)
 */

import mdx from '@mdx-js/esbuild';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

// MDX configuration options
export const mdxConfig = {
  jsxImportSource: 'preact',
  remarkPlugins: [
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: 'meta' }],  // Exports frontmatter as `meta`
  ],
  // Use the provider import source for @mdx-js/preact
  // This tells compiled MDX to use useMDXComponents from @mdx-js/preact
  providerImportSource: '@mdx-js/preact',
  development: process.env.NODE_ENV !== 'production',
};

// Pre-configured plugin instance
const mdxPlugin = mdx(mdxConfig);

export default mdxPlugin;
