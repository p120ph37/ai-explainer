/**
 * Radial Sitemap visualization for content network
 * 
 * Shows pages arranged in a circle with arc-based links between them.
 * Hovering over a page ID highlights incoming/outgoing links and shows full title.
 * Uses circle-arc connections that dynamically utilize interior space based on distance.
 * 
 * Optimization modes:
 * - If allMeta contains displayOrder properties: Uses pre-computed order directly
 * - Otherwise: Runs incremental optimization via requestAnimationFrame when visible
 * 
 * The 12-o-clock position is determined at render time by finding the node with the
 * lowest "order" metadata value.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'preact/hooks';
import { makeStyles } from '@griffel/react';
import { select } from 'd3-selection';
import { navigateTo } from '@/app/router.ts';

// Runtime imports (for animation when not pre-optimized)
import {
  runOptimizationStep,
  createOptimizationState,
} from '@/lib/sitemap-optimization.ts';

import type { ContentMeta } from '@/lib/content.ts';
import type { PageData, OptimizationState } from '@/lib/sitemap-optimization.ts';

// ============================================
// TYPES
// ============================================

/** Extended ContentMeta that may include displayOrder from optimization */
interface ExtendedMeta extends ContentMeta {
  displayOrder?: number;
}

interface NodeData {
  id: string;
  title: string;
  links: string[];
  order?: number; // The metadata "order" field for determining 12-o-clock
  angle: number;
  x: number;
  y: number;
  text?: SVGTextElement;
  incoming: LinkData[];
  outgoing: LinkData[];
}

interface LinkData {
  source: NodeData;
  target: NodeData;
  fillPath?: SVGPathElement;
  strokePath?: SVGPathElement;
}

// ============================================
// STYLES
// ============================================

const useStyles = makeStyles({
  wrapper: {
    width: '100%',
    marginBlock: 'var(--space-xl)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-md)',
    overflow: 'visible',
  },
  
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  
  svg: {
    width: '100%',
    maxWidth: '1000px',
    aspectRatio: '1 / 1',
    fontFamily: 'var(--font-body)',
    fontSize: '22px',
    overflow: 'visible',
  },
});

// ============================================
// TAPERED ARC GENERATION
// ============================================

/**
 * Find the center of a circle passing through three points.
 * Returns null if points are collinear.
 */
function circleThrough3Points(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { cx: number; cy: number; r: number } | null {
  const ax = p1.x, ay = p1.y;
  const bx = p2.x, by = p2.y;
  const cx = p3.x, cy = p3.y;
  
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-10) return null; // Collinear
  
  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;
  
  const centerX = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const centerY = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;
  const radius = Math.sqrt((ax - centerX) ** 2 + (ay - centerY) ** 2);
  
  return { cx: centerX, cy: centerY, r: radius };
}

interface TaperedArcPaths {
  fill: string;   // Closed path for the fill
  stroke: string; // Open path for the stroke (arcs only, no endcap)
}

/**
 * Generate a tapered arc path that's wider at source and tapers to a point at target.
 * 
 * Algorithm:
 * 1. Compute start-B and start-C by offsetting source perpendicular to the radial direction
 * 2. For each edge (B and C), compute its chord midpoint and offset perpendicular to that
 *    chord by a scaled sagitta to match the center arc's curvature ratio
 * 3. Fit circle arcs through [start-B, mid-B, end] and [start-C, mid-C, end]
 * 
 * Returns both a closed fill path and an open stroke path (without the wide endcap).
 */
function generateTaperedArcPath(
  source: { x: number; y: number; angle: number },
  target: { x: number; y: number; angle: number },
  _outerRadius: number,
  sourceWidth: number = 8
): TaperedArcPaths {
  // Calculate angular distance
  let angularDist = Math.abs(target.angle - source.angle);
  if (angularDist > Math.PI) {
    angularDist = 2 * Math.PI - angularDist;
  }
  
  // Perpendicular direction at source (tangent to outer circle)
  const srcPerpX = -Math.sin(source.angle);
  const srcPerpY = Math.cos(source.angle);
  
  // Source endpoints (wide end)
  const startB = { x: source.x + srcPerpX * sourceWidth / 2, y: source.y + srcPerpY * sourceWidth / 2 };
  const startC = { x: source.x - srcPerpX * sourceWidth / 2, y: source.y - srcPerpY * sourceWidth / 2 };
  
  // Target is a single point (tapers to nothing)
  const end = { x: target.x, y: target.y };
  
  // For nearly straight lines or opposite points, use a simple triangle
  if (angularDist > Math.PI - 0.05 || angularDist < 0.05) {
    const fill = `M ${startB.x} ${startB.y} L ${end.x} ${end.y} L ${startC.x} ${startC.y} Z`;
    // Stroke: just the two edges to the point, not the base
    const stroke = `M ${startB.x} ${startB.y} L ${end.x} ${end.y} M ${end.x} ${end.y} L ${startC.x} ${startC.y}`;
    return { fill, stroke };
  }
  
  // Calculate center arc's sagitta ratio (sagitta / chord length)
  // This ratio characterizes the "bulge" of the arc
  const centerDx = target.x - source.x;
  const centerDy = target.y - source.y;
  const centerChordLen = Math.sqrt(centerDx * centerDx + centerDy * centerDy);
  const arcAngle = Math.PI - angularDist;
  const centerArcRadius = centerChordLen / (2 * Math.sin(arcAngle / 2));
  const centerSagitta = centerArcRadius - Math.sqrt(centerArcRadius * centerArcRadius - (centerChordLen / 2) ** 2);
  const sagittaRatio = centerSagitta / centerChordLen;
  
  // Determine which side the arc bulges (for consistent direction)
  const srcAngleNorm = ((source.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const tgtAngleNorm = ((target.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let isClockwise: boolean;
  if (tgtAngleNorm > srcAngleNorm) {
    isClockwise = (tgtAngleNorm - srcAngleNorm) <= Math.PI;
  } else {
    isClockwise = (srcAngleNorm - tgtAngleNorm) > Math.PI;
  }
  const sign = isClockwise ? -1 : 1;
  
  // For edge B: compute its chord, midpoint, perpendicular, and offset
  const chordBx = end.x - startB.x;
  const chordBy = end.y - startB.y;
  const chordBLen = Math.sqrt(chordBx * chordBx + chordBy * chordBy);
  const chordBMidX = (startB.x + end.x) / 2;
  const chordBMidY = (startB.y + end.y) / 2;
  const perpBx = -chordBy / chordBLen;
  const perpBy = chordBx / chordBLen;
  const sagittaB = sagittaRatio * chordBLen;
  const midB = { x: chordBMidX + perpBx * sagittaB * sign, y: chordBMidY + perpBy * sagittaB * sign };
  
  // For edge C: compute its chord, midpoint, perpendicular, and offset
  const chordCx = end.x - startC.x;
  const chordCy = end.y - startC.y;
  const chordCLen = Math.sqrt(chordCx * chordCx + chordCy * chordCy);
  const chordCMidX = (startC.x + end.x) / 2;
  const chordCMidY = (startC.y + end.y) / 2;
  const perpCx = -chordCy / chordCLen;
  const perpCy = chordCx / chordCLen;
  const sagittaC = sagittaRatio * chordCLen;
  const midC = { x: chordCMidX + perpCx * sagittaC * sign, y: chordCMidY + perpCy * sagittaC * sign };
  
  // Fit circles through the three points for each edge
  const circleB = circleThrough3Points(startB, midB, end);
  const circleC = circleThrough3Points(startC, midC, end);
  
  // If circles can't be computed (collinear), fall back to straight lines
  if (!circleB || !circleC) {
    const fill = `M ${startB.x} ${startB.y} L ${end.x} ${end.y} L ${startC.x} ${startC.y} Z`;
    const stroke = `M ${startB.x} ${startB.y} L ${end.x} ${end.y} M ${end.x} ${end.y} L ${startC.x} ${startC.y}`;
    return { fill, stroke };
  }
  
  // Determine sweep flags for each arc
  // For arc B: from startB to end via midB
  const crossB = (midB.x - startB.x) * (end.y - startB.y) - (midB.y - startB.y) * (end.x - startB.x);
  const sweepB = crossB > 0 ? 0 : 1;
  
  // For arc C: from end to startC via midC (reverse direction)
  const crossC = (midC.x - end.x) * (startC.y - end.y) - (midC.y - end.y) * (startC.x - end.x);
  const sweepC = crossC > 0 ? 0 : 1;
  
  // Build the closed fill path
  const fill = `M ${startB.x} ${startB.y} ` +
    `A ${circleB.r} ${circleB.r} 0 0 ${sweepB} ${end.x} ${end.y} ` +
    `A ${circleC.r} ${circleC.r} 0 0 ${sweepC} ${startC.x} ${startC.y} ` +
    `Z`;
  
  // Build the open stroke path (arcs only, no endcap line)
  const stroke = `M ${startB.x} ${startB.y} ` +
    `A ${circleB.r} ${circleB.r} 0 0 ${sweepB} ${end.x} ${end.y} ` +
    `A ${circleC.r} ${circleC.r} 0 0 ${sweepC} ${startC.x} ${startC.y}`;
  
  return { fill, stroke };
}

// ============================================
// HELPER: Rotate array to put element at position 0
// ============================================

function rotateToFirst<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  const idx = arr.findIndex(predicate);
  if (idx <= 0) return arr; // Already at 0 or not found
  return [...arr.slice(idx), ...arr.slice(0, idx)];
}

// ============================================
// COMPONENT
// ============================================

interface RadialSitemapProps {
  allMeta: Record<string, ExtendedMeta>;
}

export function RadialSitemap({ allMeta }: RadialSitemapProps) {
  const styles = useStyles();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PageData[]>([]);
  
  // Optimization state refs (persist across renders without triggering re-renders)
  const optimizationStateRef = useRef<OptimizationState | null>(null);
  const rafIdRef = useRef<number | null>(null);
  
  // Build pages from metadata, with order property for 12-o-clock determination
  const buildPages = useCallback((): (PageData & { order?: number })[] => {
    const result: (PageData & { order?: number })[] = [];
    Object.entries(allMeta).forEach(([id, meta]) => {
      if (meta.draft || id.includes('/')) return;
      result.push({
        id,
        title: meta.title || id,
        links: meta.links || [],
        order: meta.order,
      });
    });
    return result;
  }, [allMeta]);

  // Initialize ordering based on whether we have pre-optimized order
  useEffect(() => {
    const pages = buildPages();
    if (pages.length === 0) return;
    
    // Check if all pages have displayOrder defined (pre-optimized)    
    if (pages.every(page => typeof allMeta[page.id]?.displayOrder === 'number')) {
      // Pre-optimized: sort by displayOrder
      const sorted = [...pages].sort((a, b) => {
        return (allMeta[a.id]!.displayOrder ?? 0) - (allMeta[b.id]!.displayOrder ?? 0);
      });
      setCurrentOrder(sorted);
      // Mark optimization as complete
      optimizationStateRef.current = {
        order: sorted,
        segmentSize: 0,
        srcIdx: 0,
        destIdx: 0,
        shouldReverse: false,
        isComplete: true,
        maxSegmentSize: 0,
      };
    } else {
      // Not pre-optimized: use intrinsic order from discoverContent (already sorted by order, then id)
      // pages is already in that order from buildPages iterating over allMeta entries
      setCurrentOrder(pages);
      optimizationStateRef.current = createOptimizationState(pages);
    }
  }, [buildPages, allMeta]);

  // Render visualization whenever order changes
  useEffect(() => {
    if (!svgRef.current || currentOrder.length === 0) return;

    try {
      // Find the node with the lowest "order" value for 12-o-clock position
      // With order=0 only on intro, this will reliably anchor intro at 12 o'clock
      let minOrderIdx = 0;
      let minOrder = Infinity;
      
      currentOrder.forEach((page, idx) => {
        const pageOrder = page.order ?? 999;
        // Tiebreak by id for stability if multiple have same order
        const currentMinPage = currentOrder[minOrderIdx];
        if (pageOrder < minOrder || (pageOrder === minOrder && currentMinPage && page.id < currentMinPage.id)) {
          minOrder = pageOrder;
          minOrderIdx = idx;
        }
      });
      
      // Create a rotated copy with the lowest-order node at position 0 (12 o'clock)
      const rotatedOrder = minOrderIdx > 0 
        ? [...currentOrder.slice(minOrderIdx), ...currentOrder.slice(0, minOrderIdx)]
        : currentOrder;
      
      renderVisualization(svgRef.current, rotatedOrder);
    } catch (err) {
      console.error('Error rendering edge bundling:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentOrder]);
  
  // Animation frame loop for optimization
  const runFrame = useCallback(() => {
    const state = optimizationStateRef.current;
    if (!state || state.isComplete) {
      rafIdRef.current = null;
      return;
    }
    
    const result = runOptimizationStep(state);
    
    if (result.improved && result.newOrder) {
      setCurrentOrder(result.newOrder);
    }
    
    if (!result.complete) {
      rafIdRef.current = requestAnimationFrame(runFrame);
    } else {
      rafIdRef.current = null;
    }
  }, []);
  
  // IntersectionObserver to trigger optimization when component becomes visible
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    
    const observer = new IntersectionObserver(
      () => {
        // Start optimization if not already running and not complete
        if (!rafIdRef.current && !optimizationStateRef.current?.isComplete) {
          rafIdRef.current = requestAnimationFrame(runFrame);
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(wrapper);
    
    return () => {
      observer.disconnect();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [runFrame]);

  if (error) {
    return (
      <div className={styles.wrapper} ref={wrapperRef}>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--color-error-text)',
          backgroundColor: 'var(--color-error-bg)',
          borderRadius: 'var(--radius-md)',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.container}>
        <svg ref={svgRef} className={styles.svg} />
      </div>
    </div>
  );
}

// ============================================
// RENDER VISUALIZATION
// ============================================

function renderVisualization(
  svgElement: SVGSVGElement,
  orderedPages: PageData[]
) {
  const width = 1000;
  const radius = width / 2 - 200;
  
  const colorin = '#9333ea';
  const colorout = '#3b82f6';
  const colornone = '#888888';

  const svg = select(svgElement);
  svg.selectAll('*').remove();

  if (orderedPages.length === 0) return;

  const angleStep = (2 * Math.PI) / orderedPages.length;
  
  const nodes: NodeData[] = orderedPages.map((page, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      id: page.id,
      title: page.title,
      links: page.links,
      order: (page as PageData & { order?: number }).order,
      angle,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      incoming: [],
      outgoing: [],
    };
  });
  
  const nodeMap = new Map<string, NodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));
  
  const links: LinkData[] = [];
  nodes.forEach(source => {
    source.links.forEach(targetId => {
      const target = nodeMap.get(targetId);
      if (target) {
        const link: LinkData = { source, target };
        links.push(link);
        source.outgoing.push(link);
        target.incoming.push(link);
      }
    });
  });

  svg
    .attr('viewBox', `${-width / 2} ${-width / 2} ${width} ${width}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Use CSS variables directly for theme-aware colors
  const textColor = 'var(--color-text-muted)';
  const textEmphasisColor = 'var(--color-text-heading)';
  // Hovered stroke matches background for maximum contrast with fill
  const hoverStrokeColor = 'var(--color-bg)';

  // Arc width matches x-height of text (approximately 0.5em = 11px at current 22px font size)
  const arcWidth = 11;

  // Draw links as tapered arcs (wider at source, narrower at target)
  // Use five groups for proper layering (bottom to top):
  // 1. unhovered strokes, 2. unhovered fills, 3. hovered strokes, 4. hovered "in" fills, 5. hovered "out" fills
  const unhoveredStrokeGroup = svg.append('g').attr('class', 'link-strokes-unhovered');
  const unhoveredFillGroup = svg.append('g').attr('class', 'link-fills-unhovered');
  const hoveredStrokeGroup = svg.append('g').attr('class', 'link-strokes-hovered');
  const hoveredInFillGroup = svg.append('g').attr('class', 'link-fills-hovered-in');
  const hoveredOutFillGroup = svg.append('g').attr('class', 'link-fills-hovered-out');
  
  // Draw stroke paths (start in unhovered group)
  // Note: stroke width is 0.5px but fills cover half of it, resulting in 0.25px visible hairline
  const linkStrokes = unhoveredStrokeGroup.selectAll('path')
    .data(links)
    .join('path')
    .attr('d', d => generateTaperedArcPath(d.source, d.target, radius, arcWidth).stroke)
    .style('fill', 'none')
    .style('stroke', textColor)
    .style('stroke-width', 0.5)
    .each(function(d) { 
      d.strokePath = this as SVGPathElement;
    });
  
  // Draw fill paths (start in unhovered group)
  const linkFills = unhoveredFillGroup.selectAll('path')
    .data(links)
    .join('path')
    .attr('d', d => generateTaperedArcPath(d.source, d.target, radius, arcWidth).fill)
    .style('fill', textColor)
    .style('fill-opacity', 0.4)
    .style('stroke', 'none')
    .each(function(d) { 
      d.fillPath = this as SVGPathElement;
    });

  // Draw nodes
  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .append('text')
    .attr('transform', (d) => {
      const angleDeg = d.angle * 180 / Math.PI;
      const isLeftHalf = d.angle < -Math.PI / 2 || d.angle > Math.PI / 2;
      if (isLeftHalf) {
        return `rotate(${angleDeg + 180}) translate(${-radius - 8}, 0)`;
      } else {
        return `rotate(${angleDeg}) translate(${radius + 8}, 0)`;
      }
    })
    .attr('dy', '0.35em')
    .attr('text-anchor', (d) => {
      const isLeftHalf = d.angle < -Math.PI / 2 || d.angle > Math.PI / 2;
      return isLeftHalf ? 'end' : 'start';
    })
    .style('fill', textColor)
    .attr('font-weight', 'normal')
    .style('cursor', 'pointer')
    .style('font-size', '22px')
    .text(d => d.id)
    .each(function(d) { d.text = this; })
    .on('click', function(event, d) {
      navigateTo(d.id, { addToPath: true });
    });

  // Hover interactions
  function overed(this: SVGTextElement, event: MouseEvent, d: NodeData) {
    select(this)
      .attr('font-weight', 'bold')
      .style('fill', textEmphasisColor);
    
    if (d.title) {
      select(this).text(d.title);
    }
    
    d.incoming.forEach(linkData => {
      if (linkData.strokePath) {
        // Move stroke to hovered stroke group
        hoveredStrokeGroup.node()!.appendChild(linkData.strokePath);
        select(linkData.strokePath)
          .style('stroke', hoverStrokeColor)
          .style('stroke-width', 2);
      }
      if (linkData.fillPath) {
        // Move fill to hovered "in" fill group
        hoveredInFillGroup.node()!.appendChild(linkData.fillPath);
        select(linkData.fillPath)
          .style('fill', colorin)
          .style('fill-opacity', 1);
      }
      const source = linkData.source;
      if (source.text) {
        select(source.text)
          .style('fill', colorin)
          .attr('font-weight', 'bold');
      }
    });
    
    d.outgoing.forEach(linkData => {
      if (linkData.strokePath) {
        // Move stroke to hovered stroke group
        hoveredStrokeGroup.node()!.appendChild(linkData.strokePath);
        select(linkData.strokePath)
          .style('stroke', hoverStrokeColor)
          .style('stroke-width', 2);
      }
      if (linkData.fillPath) {
        // Move fill to hovered "out" fill group
        hoveredOutFillGroup.node()!.appendChild(linkData.fillPath);
        select(linkData.fillPath)
          .style('fill', colorout)
          .style('fill-opacity', 1);
      }
      const target = linkData.target;
      if (target.text) {
        select(target.text)
          .style('fill', colorout)
          .attr('font-weight', 'bold');
      }
    });
  }

  function outed(this: SVGTextElement, event: MouseEvent, d: NodeData) {
    // Move all strokes back to unhovered stroke group
    links.forEach(linkData => {
      if (linkData.strokePath) {
        unhoveredStrokeGroup.node()!.appendChild(linkData.strokePath);
      }
      if (linkData.fillPath) {
        unhoveredFillGroup.node()!.appendChild(linkData.fillPath);
      }
    });
    
    linkFills
      .style('fill', textColor)
      .style('fill-opacity', 0.4);
    linkStrokes
      .style('stroke', textColor)
      .style('stroke-width', 0.5);
    
    select(this)
      .attr('font-weight', null)
      .style('fill', textColor);
    select(this).text(d.id);
    
    d.incoming.forEach(linkData => {
      const source = linkData.source;
      if (source.text) {
        select(source.text)
          .style('fill', textColor)
          .attr('font-weight', null);
      }
    });
    
    d.outgoing.forEach(linkData => {
      const target = linkData.target;
      if (target.text) {
        select(target.text)
          .style('fill', textColor)
          .attr('font-weight', null);
      }
    });
  }

  node
    .on('mouseenter', overed)
    .on('mouseleave', outed);
}
