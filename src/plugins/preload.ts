/**
 * Bun Preload Plugin
 * 
 * Registers the MDX plugin for runtime imports (SSR).
 * This is separate from Bun.build() which needs plugins passed explicitly.
 * 
 * This preload is configured in bunfig.toml:
 *   preload = ["./src/plugins/preload.ts"]
 * 
 * Note: For Bun.build(), you must still pass mdxPlugin in the plugins array.
 * The preload only affects runtime import() calls, not the bundler.
 */

import { plugin, type BunPlugin } from 'bun';
import mdxPlugin from '@/plugins/mdx-plugin.ts';

// Register MDX plugin for runtime imports (used by SSR)
// The esbuild plugin is compatible with Bun's plugin API
plugin(mdxPlugin as unknown as BunPlugin);
