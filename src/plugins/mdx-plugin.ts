/**
 * MDX Plugin for Bun
 * 
 * Uses @mdx-js/esbuild with remark plugins for frontmatter.
 * Configured via bunfig.toml [serve.static] plugins.
 */

import mdx from '@mdx-js/esbuild';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

// Configure MDX with Preact and frontmatter support
const mdxPlugin = mdx({
  jsxImportSource: 'preact',
  remarkPlugins: [
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: 'meta' }],  // Exports frontmatter as `meta`
  ],
  development: process.env.NODE_ENV !== 'production',
});

export default mdxPlugin;
