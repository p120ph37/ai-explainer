/**
 * Production build script
 * 
 * Uses Bun.build() with the MDX plugin to properly compile .mdx files.
 * The CLI `bun build` command doesn't use bunfig.toml plugins, so we need this.
 */

import mdxPlugin from '../src/plugins/mdx-plugin.ts';

console.log('🔨 Building Frontier AI Explainer...\n');

const result = await Bun.build({
  entrypoints: ['./src/index.html'],
  outdir: './dist',
  minify: true,
  splitting: true,
  plugins: [mdxPlugin],
  // Ensure proper module resolution
  target: 'browser',
  // Alias React to Preact for visx compatibility
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

if (!result.success) {
  console.error('❌ Build failed:\n');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`✅ Build complete!`);
console.log(`   ${result.outputs.length} files written to ./dist\n`);

// List output files
for (const output of result.outputs) {
  const size = output.size;
  const sizeStr = size > 1024 
    ? `${(size / 1024).toFixed(1)} KB` 
    : `${size} B`;
  console.log(`   ${output.path.replace(process.cwd() + '/', '')} (${sizeStr})`);
}

