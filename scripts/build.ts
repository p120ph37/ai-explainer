/**
 * Production build script
 * 
 * Generates individual HTML pages for each content node with:
 * - Server-side rendered (SSR) content for SEO
 * - Proper meta tags (og:, twitter:, canonical)
 * - Shared JS bundle that hydrates and enables SPA-like navigation
 * 
 * Output is identical to what the dev server produces.
 */

import mdxPlugin from '../src/plugins/mdx-plugin.ts';
import { mkdir } from 'fs/promises';
import { renderMdxContent, getNodeMeta } from '../src/lib/ssr.tsx';
import { generateHtml, generateIndexHtml } from '../src/lib/html-template.ts';
import { getAllNodeIds, type NodeMeta } from '../src/lib/node-metadata.ts';

console.log('🔨 Building Frontier AI Explainer...\n');

// ============================================
// Step 1: Build the JavaScript bundle
// ============================================

console.log('📦 Building JavaScript bundle...');

const jsResult = await Bun.build({
  entrypoints: ['./src/app/main.tsx'],
  outdir: './dist',
  minify: true,
  splitting: true,
  plugins: [mdxPlugin],
  target: 'browser',
  naming: {
    entry: '[name].[hash].js',
    chunk: '[name].[hash].js',
    asset: '[name].[hash].[ext]',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

if (!jsResult.success) {
  console.error('❌ JS build failed:\n');
  for (const log of jsResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Find the main entry point
const mainJsFile = jsResult.outputs.find(o => o.path.includes('main.') && o.path.endsWith('.js'));
if (!mainJsFile) {
  console.error('❌ Could not find main JS output');
  process.exit(1);
}
const mainJsPath = '/' + mainJsFile.path.replace(process.cwd() + '/dist/', '');

console.log(`   ✓ ${jsResult.outputs.length} JS files`);

// ============================================
// Step 2: Copy CSS files
// ============================================

console.log('🎨 Copying CSS files...');

const cssFiles = [
  'src/styles/base.css',
  'src/styles/components.css',
  'src/styles/themes.css',
  'src/styles/theme-main.css',
];

await mkdir('./dist/styles', { recursive: true });

for (const cssFile of cssFiles) {
  const content = await Bun.file(cssFile).text();
  const outPath = cssFile.replace('src/', 'dist/');
  await Bun.write(outPath, content);
}

console.log(`   ✓ ${cssFiles.length} CSS files`);

// ============================================
// Step 3: Render and generate HTML pages
// ============================================

console.log('📄 Generating HTML pages with SSR...');

const nodeIds = getAllNodeIds();
const allMetas: NodeMeta[] = [];
let pagesGenerated = 0;

// Generate page for each content node
for (const nodeId of nodeIds) {
  const rendered = await renderMdxContent(nodeId);
  
  if (rendered) {
    allMetas.push(rendered.meta);
    
    const html = generateHtml({
      meta: rendered.meta,
      contentHtml: rendered.html,
      jsPath: mainJsPath,
      cssPath: '/styles',
      isDev: false,
    });
    
    await mkdir(`./dist/${nodeId}`, { recursive: true });
    await Bun.write(`./dist/${nodeId}/index.html`, html);
    pagesGenerated++;
  } else {
    console.warn(`   ⚠ Failed to render: ${nodeId}`);
  }
}

// Generate root index.html (serves intro)
const introRendered = await renderMdxContent('intro');
if (introRendered) {
  const rootHtml = generateHtml({
    meta: { ...introRendered.meta, id: '' },
    contentHtml: introRendered.html,
    jsPath: mainJsPath,
    cssPath: '/styles',
    isDev: false,
  });
  await Bun.write('./dist/index.html', rootHtml);
  pagesGenerated++;
}

// Generate index page
const indexHtml = generateIndexHtml({
  nodes: allMetas,
  jsPath: mainJsPath,
  cssPath: '/styles',
  isDev: false,
});
await mkdir('./dist/index', { recursive: true });
await Bun.write('./dist/index/index.html', indexHtml);
pagesGenerated++;

console.log(`   ✓ ${pagesGenerated} HTML pages`);

// ============================================
// Step 4: Generate sitemap.xml
// ============================================

console.log('🗺️  Generating sitemap...');

const sitemapEntries = [
  '<url><loc>https://ai.ameriwether.com/</loc><priority>1.0</priority></url>',
  '<url><loc>https://ai.ameriwether.com/index</loc><priority>0.9</priority></url>',
  ...allMetas.map(n => `<url><loc>https://ai.ameriwether.com/${n.id}</loc><priority>0.8</priority></url>`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>`;

await Bun.write('./dist/sitemap.xml', sitemap);

console.log('   ✓ sitemap.xml');

// ============================================
// Step 5: Generate robots.txt
// ============================================

const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://ai.ameriwether.com/sitemap.xml
`;

await Bun.write('./dist/robots.txt', robotsTxt);

console.log('   ✓ robots.txt');

// ============================================
// Summary
// ============================================

console.log('\n✅ Build complete!\n');

const totalFiles = jsResult.outputs.length + cssFiles.length + pagesGenerated + 2; // +2 for sitemap, robots
console.log(`   ${totalFiles} total files written to ./dist\n`);
