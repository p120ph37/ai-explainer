/**
 * Network graph visualization - Pure CSS/SVG implementation
 */

import { makeStyles } from '@griffel/react';

const useStyles = makeStyles({
  container: {
    width: '100%',
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
    textAlign: 'center',
    marginBottom: 'var(--space-md)',
  },
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-md)',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
});

export interface NetworkNode {
  id: string;
  label: string;
  group?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  label?: string;
  strength?: number;
  color?: string;
  dashed?: boolean;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  groupColors?: Record<string, string>;
  title?: string;
  ariaLabel?: string;
  layout?: 'auto' | 'hierarchical' | 'circular';
}

const defaultGroupColors: Record<string, string> = {
  hardware: '#e07a5f',
  cloud: '#81b29a',
  models: '#3d405b',
  apps: '#f2cc8f',
  default: 'var(--color-accent)',
};

export function NetworkGraph({
  nodes,
  links,
  groupColors = defaultGroupColors,
  title,
  ariaLabel,
  layout = 'auto',
}: NetworkGraphProps) {
  const styles = useStyles();
  
  // Simple auto-layout based on groups
  const groups = [...new Set(nodes.map(n => n.group || 'default'))];
  const width = 600;
  const height = 400;
  
  const positionedNodes = nodes.map((node, i) => {
    if (node.x !== undefined && node.y !== undefined) {
      return { ...node, cx: node.x * width, cy: node.y * height };
    }
    
    const groupIndex = groups.indexOf(node.group || 'default');
    const nodesInGroup = nodes.filter(n => (n.group || 'default') === (node.group || 'default'));
    const indexInGroup = nodesInGroup.indexOf(node);
    
    // Arrange groups in columns, nodes within group in rows
    const groupWidth = width / (groups.length + 1);
    const groupHeight = height / (nodesInGroup.length + 1);
    
    return {
      ...node,
      cx: groupWidth * (groupIndex + 1),
      cy: groupHeight * (indexInGroup + 1),
    };
  });

  const nodeMap = new Map(positionedNodes.map(n => [n.id, n]));

  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={ariaLabel || title || 'Network graph'}
    >
      {title && <div className={styles.title}>{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--color-text-muted)"
            />
          </marker>
        </defs>

        {/* Links */}
        {links.map((link, i) => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) return null;

          const sourceSize = source.size || 25;
          const targetSize = target.size || 25;
          
          const dx = (target.cx || 0) - (source.cx || 0);
          const dy = (target.cy || 0) - (source.cy || 0);
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist === 0) return null;
          
          const x1 = (source.cx || 0) + (dx / dist) * sourceSize;
          const y1 = (source.cy || 0) + (dy / dist) * sourceSize;
          const x2 = (target.cx || 0) - (dx / dist) * (targetSize + 8);
          const y2 = (target.cy || 0) - (dy / dist) * (targetSize + 8);

          return (
            <g key={`${link.source}-${link.target}-${i}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={link.color || 'var(--color-text-muted)'}
                strokeWidth={link.strength || 1.5}
                strokeDasharray={link.dashed ? '4,4' : undefined}
                markerEnd="url(#arrowhead)"
                opacity={0.6}
              />
              {link.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text-muted)"
                >
                  {link.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {positionedNodes.map(node => {
          const size = node.size || 25;
          const color = node.color || groupColors[node.group || 'default'] || groupColors.default;

          return (
            <g key={node.id}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={size}
                fill={color}
                opacity={0.9}
              />
              <text
                x={node.cx}
                y={node.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={500}
                fill="white"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className={styles.legend}>
        {groups.map(group => (
          <div key={group} className={styles.legendItem}>
            <span 
              className={styles.legendDot}
              style={{ backgroundColor: groupColors[group] || groupColors.default }}
            />
            <span>{group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
