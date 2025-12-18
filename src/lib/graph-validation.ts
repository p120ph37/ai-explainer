/**
 * Graph validation for content relationships
 * 
 * Validates that the content graph (defined by children/related metadata):
 * - Forms a DAG (no circular ancestry via children links)
 * - Has no broken links (all referenced pages exist)
 * - Excludes draft pages
 */

import type { ContentMeta } from './content.ts';

export interface GraphNode {
  id: string;
  meta: ContentMeta;
  children: string[];
  related: string[];
}

export interface ValidationError {
  type: 'broken-link' | 'circular-ancestry';
  message: string;
  nodeId: string;
  targetId?: string;
  cycle?: string[];
}

/**
 * Build a graph from content metadata
 */
export function buildGraph(allMeta: Record<string, ContentMeta>): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();
  
  // Only include non-draft pages
  for (const [id, meta] of Object.entries(allMeta)) {
    if (meta.draft) continue;
    
    graph.set(id, {
      id,
      meta,
      children: meta.children || [],
      related: meta.related || [],
    });
  }
  
  return graph;
}

/**
 * Validate that all referenced pages exist
 */
export function validateNobrokenLinks(graph: Map<string, GraphNode>): ValidationError[] {
  const errors: ValidationError[] = [];
  const validIds = new Set(graph.keys());
  
  for (const node of graph.values()) {
    // Check children links
    for (const childId of node.children) {
      if (!validIds.has(childId)) {
        errors.push({
          type: 'broken-link',
          message: `Page "${node.id}" references non-existent child page "${childId}"`,
          nodeId: node.id,
          targetId: childId,
        });
      }
    }
    
    // Check related links
    for (const relatedId of node.related) {
      if (!validIds.has(relatedId)) {
        errors.push({
          type: 'broken-link',
          message: `Page "${node.id}" references non-existent related page "${relatedId}"`,
          nodeId: node.id,
          targetId: relatedId,
        });
      }
    }
  }
  
  return errors;
}

/**
 * Detect cycles in the ancestry graph (children relationships)
 * Uses DFS with path tracking
 */
export function detectCycles(graph: Map<string, GraphNode>): ValidationError[] {
  const errors: ValidationError[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const pathStack: string[] = [];
  
  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    pathStack.push(nodeId);
    
    const node = graph.get(nodeId);
    if (!node) return false;
    
    // Only follow children links (not related) for ancestry
    for (const childId of node.children) {
      if (!graph.has(childId)) continue; // Skip broken links (handled separately)
      
      if (!visited.has(childId)) {
        if (dfs(childId)) {
          return true; // Cycle found deeper in tree
        }
      } else if (recursionStack.has(childId)) {
        // Found a cycle!
        const cycleStart = pathStack.indexOf(childId);
        const cycle = [...pathStack.slice(cycleStart), childId];
        
        errors.push({
          type: 'circular-ancestry',
          message: `Circular ancestry detected: ${cycle.join(' → ')}`,
          nodeId,
          targetId: childId,
          cycle,
        });
        
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    pathStack.pop();
    return false;
  }
  
  // Check all nodes (to catch disconnected cycles)
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }
  
  return errors;
}

/**
 * Validate the entire content graph
 * Throws an error if validation fails
 */
export function validateContentGraph(allMeta: Record<string, ContentMeta>): void {
  const graph = buildGraph(allMeta);
  const errors: ValidationError[] = [];
  
  // Check for broken links
  errors.push(...validateNobrokenLinks(graph));
  
  // Check for cycles
  errors.push(...detectCycles(graph));
  
  if (errors.length > 0) {
    const errorMessages = errors.map(e => `  - ${e.message}`).join('\n');
    throw new Error(
      `Content graph validation failed:\n${errorMessages}\n\n` +
      `Fix these issues in the content metadata (frontmatter).`
    );
  }
}

/**
 * Get root nodes (nodes with no parents)
 */
export function getRootNodes(graph: Map<string, GraphNode>): string[] {
  const hasParent = new Set<string>();
  
  // Mark all nodes that have a parent
  for (const node of graph.values()) {
    for (const childId of node.children) {
      hasParent.add(childId);
    }
  }
  
  // Return nodes without parents
  return Array.from(graph.keys()).filter(id => !hasParent.has(id));
}

/**
 * Build a tree structure suitable for visx hierarchy
 */
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  meta?: ContentMeta;
}

export function buildTreeStructure(
  graph: Map<string, GraphNode>,
  rootId?: string
): TreeNode {
  const visited = new Set<string>();
  
  function buildNode(nodeId: string): TreeNode | null {
    if (visited.has(nodeId)) {
      // Avoid infinite loops (shouldn't happen if DAG validation passed)
      return null;
    }
    
    visited.add(nodeId);
    const node = graph.get(nodeId);
    if (!node) return null;
    
    const children: TreeNode[] = [];
    for (const childId of node.children) {
      const childNode = buildNode(childId);
      if (childNode) {
        children.push(childNode);
      }
    }
    
    return {
      id: nodeId,
      name: node.meta.title || nodeId,
      children: children.length > 0 ? children : undefined,
      meta: node.meta,
    };
  }
  
  // If no root specified, create a virtual root with all actual roots as children
  if (!rootId) {
    const roots = getRootNodes(graph);
    const rootChildren: TreeNode[] = [];
    
    for (const id of roots) {
      visited.clear(); // Reset for each root tree
      const tree = buildNode(id);
      if (tree) {
        rootChildren.push(tree);
      }
    }
    
    return {
      id: '__root__',
      name: 'Content',
      children: rootChildren,
    };
  }
  
  const tree = buildNode(rootId);
  if (!tree) {
    throw new Error(`Cannot build tree from root: ${rootId}`);
  }
  
  return tree;
}

/**
 * Get all cross-links (related links) for visualization
 */
export interface CrossLink {
  source: string;
  target: string;
}

export function getCrossLinks(graph: Map<string, GraphNode>): CrossLink[] {
  const links: CrossLink[] = [];
  
  for (const node of graph.values()) {
    for (const relatedId of node.related) {
      if (graph.has(relatedId)) {
        links.push({
          source: node.id,
          target: relatedId,
        });
      }
    }
  }
  
  return links;
}



