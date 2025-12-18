/**
 * D3 force to keep nodes inside a bounding box
 * 
 * This force applies a hyperbolic repulsive force that grows as a node approaches
 * an edge, asymptotically approaching infinity at the boundary. The force is zero
 * at the center of the box and increases smoothly toward the edges.
 * 
 * The strength parameter controls the scaling of the force curve such that at the
 * midpoint between center and edge, the force equals the strength value.
 * 
 * If a node moves outside the box, it is clipped to the edge.
 * 
 * @example
 * ```ts
 * const simulation = forceSimulation(nodes)
 *   .force('boundingBox', forceBoundingBox()
 *     .box({ x0: 0, y0: 0, x1: width, y1: height })
 *     .strength(10.0)  // Force at midpoint = 10.0, approaches infinity at edges
 *   );
 * ```
 */

import type { Force } from 'd3-force';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BoundingBoxForce<NodeDatum extends { x?: number; y?: number; vx?: number; vy?: number }> 
  extends Force<NodeDatum, any> {
  /**
   * Set the bounding box dimensions
   */
  box(box: BoundingBox): this;
  box(): BoundingBox;
  
  /**
   * Set the strength of the repulsive force
   * 
   * The force follows a hyperbolic curve:
   * - At center: force = 0
   * - At midpoint (halfway from center to edge): force = strength
   * - At edge: force approaches infinity
   * 
   * A strength of 0 means no force is applied (only clipping occurs).
   * 
   * @default 1.0
   */
  strength(strength: number): this;
  strength(): number;
}

/**
 * Compute hyperbolic repulsive force
 * 
 * Given a distance from center (normalized 0 to 1, where 1 is at the edge),
 * returns a force value that:
 * - Is 0 at center (d = 0)
 * - Equals strength at midpoint (d = 0.5)
 * - Approaches infinity as d approaches 1
 * 
 * Uses the formula: f(d) = strength * d / (1 - d)
 * This satisfies: f(0) = 0, f(0.5) = strength, f(1) = infinity
 * 
 * To avoid the asymptote at d=1, we clamp the input at d=0.99, creating a
 * flat plateau for the final 1% of the distance to the edge.
 */
function hyperbolicForce(normalizedDistance: number, strength: number): number {
  if (strength === 0) return 0;
  if (normalizedDistance <= 0) return 0;
  
  // Clamp at 0.99 to avoid the asymptote at d=1.0
  // This creates a flat plateau for distances > 0.99
  const MAX_DISTANCE = 0.99;
  const d = Math.min(normalizedDistance, MAX_DISTANCE);
  
  // f(d) = strength * d / (1 - d)
  // At d=0: f = 0
  // At d=0.5: f = strength * 0.5 / 0.5 = strength
  // At d=0.99: f = strength * 0.99 / 0.01 = 99 * strength
  return strength * d / (1 - d);
}

/**
 * Create a bounding box force that keeps nodes within specified bounds
 */
export function forceBoundingBox<NodeDatum extends { x?: number; y?: number; vx?: number; vy?: number }>(
  initialBox?: BoundingBox
): BoundingBoxForce<NodeDatum> {
  let nodes: NodeDatum[] = [];
  let box: BoundingBox = initialBox || { x0: 0, y0: 0, x1: 100, y1: 100 };
  let strength = 1.0;
  
  function force(alpha: number) {
    if (strength === 0) return; // No force applied
    
    const width = box.x1 - box.x0;
    const height = box.y1 - box.y0;
    const centerX = (box.x0 + box.x1) / 2;
    const centerY = (box.y0 + box.y1) / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    for (const node of nodes) {
      if (typeof node.x !== "number" || typeof node.y !== "number") continue;

      // If node is outside box, clip it to the edge of the box
      if (node.x < box.x0) { node.x = box.x0; }
      if (node.x > box.x1) { node.x = box.x1; }
      if (node.y < box.y0) { node.y = box.y0; }
      if (node.y > box.y1) { node.y = box.y1; }

      // Compute normalized distance from center to current position
      // (0 at center, 1 at edge)
      const dx = (node.x - centerX) / halfWidth;  // -1 to 1
      const dy = (node.y - centerY) / halfHeight; // -1 to 1
      
      // Compute force for each axis independently
      // Use absolute distance from center, apply force toward center
      const normalizedDistX = Math.abs(dx);
      const normalizedDistY = Math.abs(dy);
      
      const forceX = hyperbolicForce(normalizedDistX, strength);
      const forceY = hyperbolicForce(normalizedDistY, strength);
      
      // Apply force toward center (negative if on right/bottom, positive if on left/top)
      // Scale by alpha for proper simulation cooling
      const fx = (dx > 0 ? -forceX : forceX) * alpha;
      const fy = (dy > 0 ? -forceY : forceY) * alpha;

      // Apply to node velocity
      node.vx = (node.vx || 0) + fx;
      node.vy = (node.vy || 0) + fy;
    }
  }
  
  // Standard D3 force API
  force.initialize = function(newNodes: NodeDatum[]) {
    nodes = newNodes;
  };
  
  // Accessor for bounding box
  force.box = function(_?: BoundingBox): any {
    return arguments.length ? (box = _!, force) : box;
  };
  
  // Accessor for strength
  force.strength = function(_?: number): any {
    return arguments.length ? (strength = _!, force) : strength;
  };
  
  return force as BoundingBoxForce<NodeDatum>;
}

