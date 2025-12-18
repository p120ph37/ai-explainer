/**
 * Interactive sitemap diagram using visx tree layout
 * 
 * Visualizes the content hierarchy (children relationships) as a tree
 * and shows cross-links (related relationships) as curved connections.
 */

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { makeStyles } from '@griffel/react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';
import { navigateTo } from '@/app/router.ts';
import { 
  buildGraph, 
  buildTreeStructure, 
  getCrossLinks, 
  validateContentGraph,
} from '@/lib/graph-validation.ts';
import type { ContentMeta } from '@/lib/content.ts';

// ============================================
// STYLES
// ============================================

const useStyles = makeStyles({
  container: {
    width: '100%',
    marginBlock: 'var(--space-xl)',
    overflowX: 'auto',
    overflowY: 'visible',
  },
  
  svg: {
    minWidth: '100%',
    cursor: 'grab',
    userSelect: 'none',
    ':active': {
      cursor: 'grabbing',
    },
  },
  
  node: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      filter: 'brightness(1.1)',
    },
  },
  
  nodeCircle: {
    fill: 'var(--color-primary)',
    stroke: 'var(--color-bg)',
    strokeWidth: 2,
  },
  
  nodeText: {
    fill: 'var(--color-text-body)',
    fontSize: '12px',
    fontFamily: 'var(--font-body)',
    pointerEvents: 'none',
  },
  
  link: {
    fill: 'none',
    stroke: 'var(--color-border)',
    strokeWidth: 1.5,
    strokeOpacity: 0.6,
  },
  
  crossLink: {
    fill: 'none',
    stroke: 'var(--color-accent)',
    strokeWidth: 1,
    strokeOpacity: 0.3,
    strokeDasharray: '4,4',
    pointerEvents: 'none',
  },
  
  error: {
    padding: 'var(--space-md)',
    backgroundColor: 'var(--color-error-bg)',
    color: 'var(--color-error-text)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'monospace',
    fontSize: 'var(--font-size-sm)',
    whiteSpace: 'pre-wrap',
  },
});

// ============================================
// TYPES
// ============================================

interface SitemapDiagramProps {
  allMeta: Record<string, ContentMeta>;
}

interface NodePosition {
  x: number;
  y: number;
}

// ============================================
// COMPONENT
// ============================================

const NODE_RADIUS = 6;
const TREE_LAYOUT = {
  nodeSize: [40, 200] as [number, number], // [dy, dx] - vertical and horizontal spacing
  separation: (a: any, b: any) => (a.parent === b.parent ? 1 : 1.2),
};

export function SitemapDiagram({ allMeta }: SitemapDiagramProps) {
  const styles = useStyles();
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  
  // Validate and build graph
  const { graph, treeData, crossLinks, nodePositions } = useMemo(() => {
    try {
      // Validate the graph (throws on error)
      validateContentGraph(allMeta);
      
      // Build the graph
      const g = buildGraph(allMeta);
      
      // Build tree structure
      const tree = buildTreeStructure(g);
      
      // Get cross-links
      const links = getCrossLinks(g);
      
      return {
        graph: g,
        treeData: tree,
        crossLinks: links,
        nodePositions: new Map<string, NodePosition>(),
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return {
        graph: new Map(),
        treeData: null,
        crossLinks: [],
        nodePositions: new Map(),
      };
    }
  }, [allMeta]);
  
  // Update dimensions on mount
  useEffect(() => {
    if (svgRef.current) {
      const container = svgRef.current.parentElement;
      if (container) {
        const width = Math.max(1200, container.clientWidth);
        setDimensions({ width, height: 800 });
      }
    }
  }, []);
  
  if (error) {
    return (
      <div className={styles.error}>
        <strong>Content Graph Validation Error:</strong>
        {'\n\n'}
        {error}
      </div>
    );
  }
  
  if (!treeData) {
    return null;
  }
  
  const margin = { top: 40, right: 120, bottom: 40, left: 120 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;
  
  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className={styles.svg}
      >
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={hierarchy(treeData)}
            size={[innerHeight, innerWidth]}
            nodeSize={TREE_LAYOUT.nodeSize}
            separation={TREE_LAYOUT.separation}
          >
            {(tree) => {
              // Store node positions for cross-link rendering
              tree.descendants().forEach((node) => {
                if (node.data.id !== '__root__') {
                  nodePositions.set(node.data.id, { x: node.y, y: node.x });
                }
              });
              
              return (
                <Group>
                  {/* Render tree links (parent-child) */}
                  {tree.links().map((link, i) => {
                    // Skip links from virtual root
                    if (link.source.data.id === '__root__') {
                      return null;
                    }
                    
                    return (
                      <LinkHorizontal
                        key={`link-${i}`}
                        data={link}
                        x={(d) => d.y}
                        y={(d) => d.x}
                        className={styles.link}
                      />
                    );
                  })}
                  
                  {/* Render cross-links (related pages) */}
                  {crossLinks.map((link, i) => {
                    const sourcePos = nodePositions.get(link.source);
                    const targetPos = nodePositions.get(link.target);
                    
                    if (!sourcePos || !targetPos) return null;
                    
                    // Create a curved path for cross-links
                    const midX = (sourcePos.x + targetPos.x) / 2;
                    const midY = (sourcePos.y + targetPos.y) / 2;
                    const dx = targetPos.x - sourcePos.x;
                    const dy = targetPos.y - sourcePos.y;
                    
                    // Control point offset perpendicular to the line
                    const offset = 30;
                    const controlX = midX - (dy / Math.sqrt(dx * dx + dy * dy)) * offset;
                    const controlY = midY + (dx / Math.sqrt(dx * dx + dy * dy)) * offset;
                    
                    return (
                      <path
                        key={`cross-link-${i}`}
                        d={`M ${sourcePos.x},${sourcePos.y} Q ${controlX},${controlY} ${targetPos.x},${targetPos.y}`}
                        className={styles.crossLink}
                      />
                    );
                  })}
                  
                  {/* Render nodes */}
                  {tree.descendants().map((node, i) => {
                    // Skip rendering the virtual root node
                    if (node.data.id === '__root__') {
                      return null;
                    }
                    
                    const isRoot = node.depth === 1; // Direct child of virtual root
                    
                    return (
                      <Group
                        key={`node-${i}`}
                        top={node.x}
                        left={node.y}
                        className={styles.node}
                        onClick={() => {
                          if (node.data.id) {
                            navigateTo(node.data.id, { addToPath: true });
                          }
                        }}
                      >
                        <circle
                          r={isRoot ? NODE_RADIUS * 1.5 : NODE_RADIUS}
                          className={styles.nodeCircle}
                          style={{
                            fill: isRoot ? 'var(--color-accent)' : 'var(--color-primary)',
                          }}
                        />
                        <text
                          dy="0.33em"
                          x={12}
                          className={styles.nodeText}
                          style={{
                            fontWeight: isRoot ? 600 : 400,
                          }}
                        >
                          {node.data.name}
                        </text>
                      </Group>
                    );
                  })}
                </Group>
              );
            }}
          </Tree>
        </Group>
      </svg>
    </div>
  );
}

