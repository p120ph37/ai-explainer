/**
 * Node metadata loader
 * 
 * Loads metadata from MDX frontmatter for use in HTML generation.
 * Used by both dev server and build script.
 */

export interface NodeMeta {
  id: string;
  title: string;
  summary: string;
  category?: string;
  order?: number;
}

// Node IDs mapped to their file paths (relative to src/content/)
export const nodeFiles: Record<string, string> = {
  'intro': 'intro/what-is-llm.mdx',
  'tokens': 'foundations/tokens.mdx',
  'why-large': 'foundations/why-large.mdx',
  'context-window': 'foundations/context-window.mdx',
  'neural-network': 'foundations/neural-network.mdx',
  'parameters': 'foundations/parameters.mdx',
  'embeddings': 'foundations/embeddings.mdx',
  'attention': 'foundations/attention.mdx',
  'transformer': 'foundations/transformer.mdx',
  'labels': 'foundations/labels.mdx',
  'training': 'foundations/training.mdx',
  'reward': 'foundations/reward.mdx',
  'tuning': 'foundations/tuning.mdx',
  'inference': 'foundations/inference.mdx',
  'temperature': 'foundations/temperature.mdx',
  'emergence': 'foundations/emergence.mdx',
  'hallucinations': 'foundations/hallucinations.mdx',
  'understanding': 'foundations/understanding.mdx',
  'prompt-engineering': 'foundations/prompt-engineering.mdx',
  'tools': 'foundations/tools.mdx',
  'vector-databases': 'foundations/vector-databases.mdx',
  'hardware': 'foundations/hardware.mdx',
  'models': 'ecosystem/models.mdx',
  'players': 'ecosystem/players.mdx',
  'open': 'ecosystem/open.mdx',
  'bias': 'safety/bias.mdx',
  'alignment': 'safety/alignment.mdx',
};

// Cache for loaded metadata
const metadataCache = new Map<string, NodeMeta>();

/**
 * Parse YAML frontmatter from MDX content
 */
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const yaml = match[1];
  const result: Record<string, string> = {};
  
  // Simple YAML parsing for known fields
  const titleMatch = yaml.match(/title:\s*["']?(.+?)["']?\s*$/m);
  const summaryMatch = yaml.match(/summary:\s*["']?(.+?)["']?\s*$/m);
  const categoryMatch = yaml.match(/category:\s*["']?(.+?)["']?\s*$/m);
  const orderMatch = yaml.match(/order:\s*(\d+)/m);
  
  if (titleMatch) result.title = titleMatch[1].trim();
  if (summaryMatch) result.summary = summaryMatch[1].trim();
  if (categoryMatch) result.category = categoryMatch[1].trim();
  if (orderMatch) result.order = orderMatch[1];
  
  return result;
}

/**
 * Load metadata for a single node
 */
export async function loadNodeMeta(nodeId: string, contentDir: string = 'src/content'): Promise<NodeMeta | null> {
  // Check cache first
  if (metadataCache.has(nodeId)) {
    return metadataCache.get(nodeId)!;
  }
  
  const filePath = nodeFiles[nodeId];
  if (!filePath) return null;
  
  try {
    const fullPath = `${contentDir}/${filePath}`;
    const file = Bun.file(fullPath);
    
    if (!(await file.exists())) {
      return null;
    }
    
    const content = await file.text();
    const frontmatter = parseFrontmatter(content);
    
    const meta: NodeMeta = {
      id: nodeId,
      title: frontmatter.title || nodeId,
      summary: frontmatter.summary || '',
      category: frontmatter.category,
      order: frontmatter.order ? parseInt(frontmatter.order, 10) : undefined,
    };
    
    metadataCache.set(nodeId, meta);
    return meta;
  } catch (error) {
    console.error(`Failed to load metadata for ${nodeId}:`, error);
    return null;
  }
}

/**
 * Load metadata for all nodes
 */
export async function loadAllNodeMeta(contentDir: string = 'src/content'): Promise<NodeMeta[]> {
  const metas: NodeMeta[] = [];
  
  for (const nodeId of Object.keys(nodeFiles)) {
    const meta = await loadNodeMeta(nodeId, contentDir);
    if (meta) {
      metas.push(meta);
    }
  }
  
  return metas;
}

/**
 * Get all node IDs
 */
export function getAllNodeIds(): string[] {
  return Object.keys(nodeFiles);
}

/**
 * Check if a path is a valid node
 */
export function isValidNode(nodeId: string): boolean {
  return nodeId in nodeFiles || nodeId === 'index' || nodeId === '';
}

/**
 * Get the full filesystem path to a node's MDX file
 */
export function getContentPath(nodeId: string, contentDir: string = 'src/content'): string | null {
  const filePath = nodeFiles[nodeId];
  if (!filePath) return null;
  return `${contentDir}/${filePath}`;
}

// Special pages metadata
export const specialPages: Record<string, NodeMeta> = {
  'index': {
    id: 'index',
    title: 'Content Index',
    summary: 'A complete listing of all topics in this AI explainer, organized by category.',
  },
  '': {
    id: '',
    title: 'Understanding Frontier AI',
    summary: 'An interactive guide to understanding how frontier AI actually works—the mechanics, the architecture, and the why behind the what.',
  },
};

