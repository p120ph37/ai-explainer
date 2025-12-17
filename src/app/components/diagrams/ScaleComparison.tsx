/**
 * Scale comparison chart - Pure CSS/SVG implementation
 * 
 * Shows items on a logarithmic or linear scale with optional threshold markers.
 * Uses native SVG without external dependencies.
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
  chart: {
    position: 'relative',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 'var(--space-sm)',
  },
  label: {
    width: '120px',
    flexShrink: 0,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    textAlign: 'right',
    paddingRight: 'var(--space-sm)',
  },
  barContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  bar: {
    height: '24px',
    borderRadius: 'var(--radius-sm)',
    transitionProperty: 'width',
    transitionDuration: 'var(--duration-normal)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  value: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap',
  },
  unit: {
    textAlign: 'center',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-sm)',
  },
});

export interface ScaleComparisonData {
  label: string;
  value: number;
  color?: string;
  annotation?: string;
}

interface ThresholdMarker {
  value: number;
  label: string;
  color?: string;
}

interface ScaleComparisonProps {
  data: ScaleComparisonData[];
  logarithmic?: boolean;
  thresholds?: ThresholdMarker[];
  unit?: string;
  title?: string;
  ariaLabel?: string;
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

export function ScaleComparison({
  data,
  logarithmic = true,
  thresholds = [],
  unit = '',
  title,
  ariaLabel,
}: ScaleComparisonProps) {
  const styles = useStyles();
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value).filter(v => v > 0));
  
  const getScale = (value: number): number => {
    if (logarithmic && minValue > 0) {
      const logMin = Math.log10(minValue * 0.5);
      const logMax = Math.log10(maxValue * 1.5);
      const logValue = Math.log10(value);
      return ((logValue - logMin) / (logMax - logMin)) * 100;
    }
    return (value / (maxValue * 1.1)) * 100;
  };

  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={ariaLabel || title || 'Scale comparison chart'}
    >
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.chart}>
        {data.map((d, i) => (
          <div key={d.label} className={styles.row}>
            <div className={styles.label}>{d.label}</div>
            <div className={styles.barContainer}>
              <div 
                className={styles.bar}
                style={{
                  width: `${getScale(d.value)}%`,
                  backgroundColor: d.color || 'var(--color-accent)',
                }}
              />
              <span className={styles.value}>
                {formatNumber(d.value)}{d.annotation ? ` ${d.annotation}` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
      {unit && <div className={styles.unit}>{unit}</div>}
    </div>
  );
}
