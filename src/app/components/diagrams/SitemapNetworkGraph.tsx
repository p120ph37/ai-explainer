/**
 * Interactive network graph for sitemap visualization
 * 
 * Uses visx network layout to show pages and their link relationships.
 * Links are directional (arrows) showing which page links to which.
 */

import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { makeStyles } from '@griffel/react';
import { Group } from '@visx/group';
import { Graph } from '@visx/network';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { navigateTo } from '@/app/router.ts';
import { forceBoundingBox } from '@/lib/d3-force-bounding-box.ts';
import { 
  forceSimulation, 
  forceLink, 
  forceManyBody,
  forceCollide,
} from 'd3-force';

// Type imports
import type { ContentMeta } from '@/lib/content.ts';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

// ============================================
// TYPES
// ============================================

interface NetworkNode extends SimulationNodeDatum {
  id: string;
  title: string;
  x?: number;
  y?: number;
}

interface NetworkLink extends SimulationLinkDatum<NetworkNode> {
  source: NetworkNode;
  target: NetworkNode;
}

interface GraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// ============================================
// STYLES
// ============================================

const useStyles = makeStyles({
  container: {
    width: '100%',
    marginBlock: 'var(--space-xl)',
    overflowX: 'auto',
    overflowY: 'visible',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
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
  },
  
  nodeCircle: {
    fill: 'transparent',
    stroke: 'var(--color-text-body)',
    strokeWidth: 2,
    strokeOpacity: 1,
    ':hover': {
      fill: 'var(--color-accent)',
      fillOpacity: 0.3,
      strokeWidth: 3,
      strokeOpacity: 1,
      stroke: 'var(--color-accent)',
    },
  },
  
  nodeText: {
    fill: 'var(--color-text-heading)',
    fontSize: '10px',
    fontFamily: 'var(--font-body)',
    pointerEvents: 'none',
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontWeight: 600,
  },
  
  tooltip: {
    ...defaultStyles,
    backgroundColor: 'var(--color-surface-elevated)',
    color: 'var(--color-text-body)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    boxShadow: 'var(--shadow-md)',
    maxWidth: '300px',
  },
  
  link: {
    stroke: 'var(--color-text-muted)',
    strokeWidth: 1.5,
    strokeOpacity: 0.5,
    fill: 'none',
  },
  
  arrowhead: {
    fill: 'var(--color-text-muted)',
    fillOpacity: 0.7,
  },
});

// ============================================
// FORCE SIMULATION (d3-force)
// ============================================

/**
 * Apply d3-force layout to position nodes
 * Uses proper d3-force simulation for better performance and accuracy
 */
function applyForceLayout(
  nodes: NetworkNode[],
  links: NetworkLink[],
  width: number,
  height: number,
  iterations: number = 300
): void {
  
  // Initialize positions in center for starting distribution
  nodes.forEach((node) => {
    node.x = width / 2;
    node.y = height / 2;
  });
  
  // Create d3-force simulation
  const simulation = forceSimulation(nodes)
    .force('link', forceLink<NetworkNode, NetworkLink>(links)
      .id((d: NetworkNode) => d.id)
      .distance(150)
    )
    .force('charge', forceManyBody<NetworkNode>()
      .strength(-800)
    )
    .force('collide', forceCollide<NetworkNode>()
      .radius(35)
    )
    .force('boundingBox', forceBoundingBox<NetworkNode>()
      .box({ x0: 0, y0: 0, x1: width, y1: height })
      .strength(10.0)
    );
  
  // Run simulation synchronously for specified iterations
  simulation.stop().tick(iterations);
}

// ============================================
// COMPONENT
// ============================================

interface SitemapNetworkGraphProps {
  allMeta: Record<string, ContentMeta>;
}

const NODE_RADIUS = 30;

export function SitemapNetworkGraph({ allMeta }: SitemapNetworkGraphProps) {
  const styles = useStyles();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<NetworkNode>();
  
  // Build graph data
  const graphData = useMemo((): GraphData => {
    const nodeMap = new Map<string, NetworkNode>();
    const links: NetworkLink[] = [];
    
    // Create nodes (exclude drafts)
    Object.entries(allMeta).forEach(([id, meta]) => {
      if (meta.draft || id.includes('/')) return; // Skip drafts and variants
      
      nodeMap.set(id, {
        id,
        title: meta.title || id,
      });
    });
    
    // Create links from extracted links metadata
    Object.entries(allMeta).forEach(([sourceId, meta]) => {
      if (meta.draft || sourceId.includes('/')) return;
      
      const sourceNode = nodeMap.get(sourceId);
      if (!sourceNode) return;
      
      // Use extracted links
      const linkedPages = meta.links || [];
      
      linkedPages.forEach(targetId => {
        const targetNode = nodeMap.get(targetId);
        if (targetNode) {
          links.push({
            source: sourceNode,
            target: targetNode,
          });
        }
      });
    });
    
    const nodes = Array.from(nodeMap.values());
    
    // Apply force-directed layout
    applyForceLayout(nodes, links, dimensions.width, dimensions.height);
    
    return { nodes, links };
  }, [allMeta, dimensions]);
  
  // Update dimensions on mount
  useEffect(() => {
    if (svgRef.current && svgRef.current.parentElement) {
      setDimensions({
        width: svgRef.current.parentElement.clientWidth,
        height: svgRef.current.parentElement.clientWidth,
      });
    }
  }, []);
  
  if (graphData.nodes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No pages to display
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className={styles.svg}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrowhead marker for directed edges */}
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="20"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            className={styles.arrowhead}
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        
        <Graph
          graph={graphData}
          nodeComponent={({ node }) => (
            <Group
              className={styles.node}
              onClick={() => {
                navigateTo(node.id, { addToPath: true });
              }}
              onMouseMove={(event) => {
                const point = localPoint(event);
                if (point) {
                  showTooltip({
                    tooltipData: node,
                    tooltipLeft: point.x,
                    tooltipTop: point.y,
                  });
                }
              }}
              onMouseLeave={() => {
                hideTooltip();
              }}
            >
              <circle
                r={NODE_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                style={{ color: 'var(--color-text-body)' }}
              />
              <text
                className={styles.nodeText}
              >
                {node.id}
              </text>
            </Group>
          )}
          linkComponent={({ link }) => {
            const source = link.source;
            const target = link.target;
            
            // Calculate direction vector
            const dx = (target.x || 0) - (source.x || 0);
            const dy = (target.y || 0) - (source.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Shorten line to account for node radius
            const offsetSource = NODE_RADIUS;
            const offsetTarget = NODE_RADIUS + 6; // Extra for arrow
            
            const sourceX = (source.x || 0) + (dx / dist) * offsetSource;
            const sourceY = (source.y || 0) + (dy / dist) * offsetSource;
            const targetX = (target.x || 0) - (dx / dist) * offsetTarget;
            const targetY = (target.y || 0) - (dy / dist) * offsetTarget;
            
            return (
              <line
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                className={styles.link}
                markerEnd="url(#arrowhead)"
              />
            );
          }}
        />
      </svg>
      
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          className={styles.tooltip}
        >
          <strong>{tooltipData.title}</strong>
        </TooltipWithBounds>
      )}
    </div>
  );
}


