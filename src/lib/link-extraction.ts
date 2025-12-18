/**
 * Link extraction from MDX content
 * 
 * Parses MDX files to extract internal page links automatically.
 * This replaces manual children/related metadata with dynamic link discovery.
 */

/**
 * Extract internal page links from MDX content
 * 
 * Finds markdown links like [text](/page-id) and <Term id="page-id">
 * Returns unique list of page IDs that are linked from this content.
 */
export function extractInternalLinks(mdxContent: string, validPageIds: Set<string>): string[] {
  const links = new Set<string>();
  
  // Pattern 1: Markdown links [text](/page-id) or [text](./page-id)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(mdxContent)) !== null) {
    const url = match[2];
    if (!url) continue;
    
    // Extract page ID from URL
    let pageId = url;
    
    // Remove leading slash or ./
    if (pageId.startsWith('/')) {
      pageId = pageId.slice(1);
    } else if (pageId.startsWith('./')) {
      pageId = pageId.slice(2);
    }
    
    // Remove trailing slash
    if (pageId.endsWith('/')) {
      pageId = pageId.slice(0, -1);
    }
    
    // Skip external links (http://, https://, mailto:, etc.)
    if (pageId.includes('://') || pageId.startsWith('mailto:')) {
      continue;
    }
    
    // Skip anchors (same-page links)
    if (pageId.startsWith('#')) {
      continue;
    }
    
    // Remove anchor fragments
    const anchorIndex = pageId.indexOf('#');
    if (anchorIndex !== -1) {
      pageId = pageId.slice(0, anchorIndex);
    }
    
    // Only include if it's a valid page ID
    if (pageId && validPageIds.has(pageId)) {
      links.add(pageId);
    }
  }
  
  // Pattern 2: Term component <Term id="page-id">
  const termRegex = /<Term\s+id=["']([^"']+)["']/g;
  
  while ((match = termRegex.exec(mdxContent)) !== null) {
    const pageId = match[1];
    if (pageId && validPageIds.has(pageId)) {
      links.add(pageId);
    }
  }
  
  // Pattern 3: InternalLink component (if used)
  const internalLinkRegex = /<InternalLink\s+(?:to|href)=["']\/([^"']+)["']/g;
  
  while ((match = internalLinkRegex.exec(mdxContent)) !== null) {
    let pageId = match[1];
    
    // Remove trailing slash
    if (pageId?.endsWith('/')) {
      pageId = pageId.slice(0, -1);
    }
    
    if (pageId && validPageIds.has(pageId)) {
      links.add(pageId);
    }
  }
  
  return Array.from(links).sort();
}

/**
 * Extract links from a content file
 */
export async function extractLinksFromFile(
  filePath: string,
  validPageIds: Set<string>
): Promise<string[]> {
  try {
    const content = await Bun.file(filePath).text();
    return extractInternalLinks(content, validPageIds);
  } catch (error) {
    console.error(`Failed to extract links from ${filePath}:`, error);
    return [];
  }
}

/**
 * Build a link graph from all content files
 * Returns a map of pageId -> array of linked page IDs
 */
export async function buildLinkGraph(
  contentFiles: Array<{ id: string; path: string; meta: any }>
): Promise<Map<string, string[]>> {
  const linkGraph = new Map<string, string[]>();
  
  // Get all valid page IDs (excluding drafts)
  const validPageIds = new Set(
    contentFiles
      .filter(f => !f.meta.draft && !f.id.includes('/')) // Exclude drafts and variants
      .map(f => f.id)
  );
  
  // Extract links from each file
  for (const file of contentFiles) {
    // Skip drafts and variants
    if (file.meta.draft || file.id.includes('/')) {
      continue;
    }
    
    const links = await extractLinksFromFile(file.path, validPageIds);
    linkGraph.set(file.id, links);
  }
  
  return linkGraph;
}



