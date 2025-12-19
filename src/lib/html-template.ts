/**
 * HTML Template Generator
 * 
 * Generates HTML pages with proper SEO metadata and pre-rendered content.
 * Used by both dev server and build script to ensure consistency.
 */

import type { ContentMeta } from '@/lib/content.ts';
import { getLocalBeaconScript } from '@/lib/local-beacon.ts';

// Alias for backwards compatibility
type NodeMeta = ContentMeta;

/**
 * Generate a short hash from content (for cache busting)
 */
export function contentHash(content: string): string {
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(content);
  return hasher.digest('hex').slice(0, 8);
}

export interface HtmlTemplateOptions {
  /** Node metadata */
  meta: NodeMeta;
  /** Pre-rendered HTML content (SSR) */
  contentHtml?: string;
  /** SSR-generated Griffel style elements (HTML string with data attributes for rehydration) */
  ssrStyleElements?: string;
  /** Base URL for canonical links */
  baseUrl?: string;
  /** Path to the main JS bundle (for production) */
  jsPath?: string;
  /** Path to CSS files */
  cssPath?: string;
  /** Whether this is a dev build */
  isDev?: boolean;
  /** All content metadata (injected for client-side navigation) */
  allContentMeta?: Record<string, ContentMeta>;
  /** All content IDs in order */
  allContentIds?: string[];
  /** Cloudflare Web Analytics beacon token */
  cfBeaconToken?: string;
  /** 
   * Local beacon mode (only used when cfBeaconToken is not set and isDev is true)
   * - "eager": Send beacon immediately on navigation (default, good for dev feedback)
   * - "lazy": Match CF behavior - send when leaving page (good for testing production behavior)
   */
  beaconMode?: 'eager' | 'lazy';
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
    ssrStyleElements = '',
    baseUrl = 'https://ai.ameriwether.com',
    jsPath,
    cssPath = '/styles',
    isDev = false,
    allContentMeta = {},
    allContentIds = [],
    cfBeaconToken,
    beaconMode = 'eager', // Default to eager for dev feedback
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
  
  // contentHtml is now the full pre-rendered App component
  // It includes the shell, header, main content, footer, etc.
  
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
  ${cfBeaconToken ? `
  <!-- Cloudflare Web Analytics -->
  <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${cfBeaconToken}", "spa": true}'></script>` : (isDev ? `
  <!-- Local Development Beacon (mimics Cloudflare beacon, sends to /__analytics) -->
  <script>${getLocalBeaconScript({ mode: beaconMode })}</script>` : '')}
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="${cssPath}/base.css">
  <link rel="stylesheet" href="${cssPath}/components.css">
  <link rel="stylesheet" href="${cssPath}/themes.css">
  <link rel="stylesheet" href="${cssPath}/theme-main.css">
  ${ssrStyleElements ? `
  <!-- SSR-generated Griffel styles (with data attributes for rehydration) -->
  ${ssrStyleElements}` : ''}
</head>
<body>
  <!-- Noscript fallback -->
  <noscript>
    <div class="no-js-content">
      <header class="app-header">
        <div class="app-header__inner">
          <span class="app-logo">Understanding Frontier AI</span>
        </div>
      </header>
      <main class="app-main">
        <p>This interactive explainer requires JavaScript for full functionality.</p>
      </main>
    </div>
  </noscript>
  
  <!-- SSR-rendered App - hydrated by client JS -->
  <div id="app" data-initial-node="${escapeHtml(nodeId)}">
    ${contentHtml}
  </div>
  
  <!-- Inject content metadata for client-side navigation -->
  <script>
    window.__CONTENT_META__ = ${JSON.stringify(allContentMeta)};
    window.__CONTENT_IDS__ = ${JSON.stringify(allContentIds)};
  </script>
  
  <script type="module" src="${scriptSrc}"></script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
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
  const { nodes = [], allContentMeta, allContentIds, ...rest } = options;
  
  // Sort nodes by order, then by id
  const sortedNodes = [...nodes].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
  
  // Generate the index content
  let indexContent = '<div class="index-page">';
  
  indexContent += `
    <section class="index-topics">
      <h2 class="index-topics__title">All Topics</h2>
      <ul class="index-list">
        ${sortedNodes.map(n => `
          <li class="index-list-item">
            <a href="/${n.id}">${escapeHtml(n.title)}</a>
            ${n.summary ? `<p>${escapeHtml(n.summary)}</p>` : ''}
          </li>
        `).join('')}
      </ul>
    </section>`;
  
  indexContent += '</div>';
  
  return generateHtml({
    ...rest,
    meta: {
      id: 'index',
      title: 'Content Index',
      summary: 'A complete listing of all topics in this AI explainer, organized by category.',
    },
    contentHtml: indexContent,
    allContentMeta,
    allContentIds,
  });
}
