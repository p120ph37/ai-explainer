/**
 * HTML Template Generator
 * 
 * Generates HTML pages with proper SEO metadata and pre-rendered content.
 * Used by both dev server and build script to ensure consistency.
 */

import type { NodeMeta } from './node-metadata.ts';

export interface HtmlTemplateOptions {
  /** Node metadata */
  meta: NodeMeta;
  /** Pre-rendered HTML content (SSR) */
  contentHtml?: string;
  /** Base URL for canonical links */
  baseUrl?: string;
  /** Path to the main JS bundle (for production) */
  jsPath?: string;
  /** Path to CSS files */
  cssPath?: string;
  /** Whether this is a dev build */
  isDev?: boolean;
}

const defaultMeta: NodeMeta = {
  id: 'intro',
  title: 'Understanding Frontier AI',
  summary: 'An interactive guide to understanding how frontier AI actually works—the mechanics, the architecture, and the why behind the what.',
};

/**
 * Generate an HTML page for a node
 */
export function generateHtml(options: HtmlTemplateOptions): string {
  const {
    meta = defaultMeta,
    contentHtml = '',
    baseUrl = 'https://ai.ameriwether.com',
    jsPath,
    cssPath = '/styles',
    isDev = false,
  } = options;
  
  const title = meta.title || defaultMeta.title;
  const description = meta.summary || defaultMeta.summary;
  const nodeId = meta.id || 'intro';
  const path = meta.id ? `/${meta.id}` : '/';
  const canonicalUrl = `${baseUrl}${path}`;
  
  // Full title includes site name for SEO
  const fullTitle = meta.id && meta.id !== 'intro'
    ? `${title} | Understanding Frontier AI`
    : 'Understanding Frontier AI';
  
  // JS path: /main.[hash].js (cache-busted via content hash)
  // Both dev and prod use the same hashed path format for parity
  const scriptSrc = jsPath || '/main.js';
  
  // Loading state - shown until JS hydrates
  const loadingState = `
    <div class="loading-state" aria-hidden="true">
      <div class="loading-spinner"></div>
      <p>Loading interactive features...</p>
    </div>`;
  
  // Pre-rendered content wrapper
  const ssrContent = contentHtml ? `
    <article class="content-node content-node--ssr" data-node-id="${escapeHtml(nodeId)}">
      <header class="content-node__header">
        <h1 class="content-node__title">${escapeHtml(title)}</h1>
        ${description ? `<p class="content-node__summary">${escapeHtml(description)}</p>` : ''}
      </header>
      <div class="content-node__body">
        ${contentHtml}
      </div>
    </article>` : loadingState;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Social -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Understanding Frontier AI">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <title>${escapeHtml(fullTitle)}</title>
  
  <!-- Preload fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="${cssPath}/base.css">
  <link rel="stylesheet" href="${cssPath}/components.css">
  <link rel="stylesheet" href="${cssPath}/themes.css">
  <link rel="stylesheet" href="${cssPath}/theme-main.css">
</head>
<body>
  <div id="app" data-initial-node="${escapeHtml(nodeId)}">
    <!-- Pre-rendered content for SEO -->
    <noscript>
      <div class="no-js-content">
        <header class="app-header">
          <div class="app-header__inner">
            <span class="app-logo">Understanding Frontier AI</span>
          </div>
        </header>
        <main class="app-main">
          <div class="content-width">
            <article class="content-node">
              <header class="content-node__header">
                <h1 class="content-node__title">${escapeHtml(title)}</h1>
                ${description ? `<p class="content-node__summary">${escapeHtml(description)}</p>` : ''}
              </header>
              <div class="content-node__body">
                ${contentHtml || '<p>This interactive explainer requires JavaScript for full functionality.</p>'}
              </div>
            </article>
          </div>
        </main>
      </div>
    </noscript>
    
    <!-- SSR content - will be hydrated by JS -->
    <div class="ssr-shell" data-ssr="true">
      <header class="app-header">
        <div class="app-header__inner">
          <a href="/" class="app-logo">Understanding Frontier AI</a>
        </div>
      </header>
      <main class="app-main">
        <div class="content-width">
          ${ssrContent}
        </div>
      </main>
    </div>
  </div>
  
  <script type="module" src="${scriptSrc}"></script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML for the index page
 */
export function generateIndexHtml(options: Omit<HtmlTemplateOptions, 'meta'> & { nodes?: NodeMeta[] }): string {
  const { nodes = [], ...rest } = options;
  
  // Group nodes by category
  const categories = new Map<string, NodeMeta[]>();
  for (const node of nodes) {
    const cat = node.category || 'Other';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(node);
  }
  
  // Sort nodes within each category by order
  for (const nodeList of categories.values()) {
    nodeList.sort((a, b) => (a.order || 999) - (b.order || 999));
  }
  
  // Generate the index content
  let indexContent = '<div class="index-page">';
  
  const categoryOrder = ['Getting Started', 'Foundations', 'Ecosystem', 'Safety & Alignment', 'Other'];
  for (const catName of categoryOrder) {
    const catNodes = categories.get(catName);
    if (!catNodes || catNodes.length === 0) continue;
    
    indexContent += `
      <section class="index-category">
        <h2 class="index-category__title">${escapeHtml(catName)}</h2>
        <ul class="index-list">
          ${catNodes.map(n => `
            <li class="index-list-item">
              <a href="/${n.id}">${escapeHtml(n.title)}</a>
              ${n.summary ? `<p>${escapeHtml(n.summary)}</p>` : ''}
            </li>
          `).join('')}
        </ul>
      </section>`;
  }
  
  indexContent += '</div>';
  
  return generateHtml({
    ...rest,
    meta: {
      id: 'index',
      title: 'Content Index',
      summary: 'A complete listing of all topics in this AI explainer, organized by category.',
    },
    contentHtml: indexContent,
  });
}
