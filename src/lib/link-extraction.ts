/**
 * Link extraction from MDX content
 * 
 * Parses MDX files to extract internal page links automatically.
 * Validates that all internal links point to valid pages.
 */

export interface LinkExtractionResult {
  links: string[];
  invalidLinks: string[];
}

/**
 * Extract internal page links from MDX content
 * 
 * Finds markdown links like [text](/page-id) and <Term id="page-id">
 * Returns unique list of valid page IDs and any invalid links found.
 */
export function extractInternalLinksWithValidation(
  mdxContent: string, 
  validPageIds: Set<string>
): LinkExtractionResult {
  const links = new Set<string>();
  const invalidLinks = new Set<string>();
  
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
    
    // Skip empty after processing
    if (!pageId) continue;
    
    // Check if it's a valid page ID
    if (validPageIds.has(pageId)) {
      links.add(pageId);
    } else {
      invalidLinks.add(pageId);
    }
  }
  
  // Pattern 2: Term component <Term id="page-id">
  const termRegex = /<Term\s+id=["']([^"']+)["']/g;
  
  while ((match = termRegex.exec(mdxContent)) !== null) {
    const pageId = match[1];
    if (!pageId) continue;
    
    if (validPageIds.has(pageId)) {
      links.add(pageId);
    } else {
      invalidLinks.add(pageId);
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
    
    if (!pageId) continue;
    
    if (validPageIds.has(pageId)) {
      links.add(pageId);
    } else {
      invalidLinks.add(pageId);
    }
  }
  
  return {
    links: Array.from(links).sort(),
    invalidLinks: Array.from(invalidLinks).sort(),
  };
}

/**
 * Extract internal page links from MDX content (simple version)
 * 
 * Finds markdown links like [text](/page-id) and <Term id="page-id">
 * Returns unique list of page IDs that are linked from this content.
 * Logs warnings for invalid links.
 */
export function extractInternalLinks(
  mdxContent: string, 
  validPageIds: Set<string>,
  sourceFile?: string
): string[] {
  const result = extractInternalLinksWithValidation(mdxContent, validPageIds);
  
  // Warn about invalid links
  if (result.invalidLinks.length > 0 && sourceFile) {
    console.warn(
      `⚠️  Invalid internal links in ${sourceFile}: ${result.invalidLinks.join(', ')}`
    );
  }
  
  return result.links;
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
    return extractInternalLinks(content, validPageIds, filePath);
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
