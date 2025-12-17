/**
 * Simple bar chart - Pure CSS implementation
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
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  // Horizontal styles
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  rowLabel: {
    width: '100px',
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
  barHorizontal: {
    height: '24px',
    borderRadius: 'var(--radius-sm)',
    transitionProperty: 'width',
    transitionDuration: 'var(--duration-normal)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  valueHorizontal: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  // Vertical styles
  chartVertical: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '200px',
    paddingTop: 'var(--space-md)',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '180px',
    justifyContent: 'flex-end',
  },
  barVertical: {
    width: '40px',
    borderTopLeftRadius: 'var(--radius-sm)',
    borderTopRightRadius: 'var(--radius-sm)',
    transitionProperty: 'height',
    transitionDuration: 'var(--duration-normal)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  valueVertical: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-2xs)',
  },
  columnLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: 'var(--space-xs)',
  },
});

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  annotation?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  yLabel?: string;
  showValues?: boolean;
  ariaLabel?: string;
  horizontal?: boolean;
}

export function BarChart({
  data,
  title,
  yLabel,
  showValues = true,
  ariaLabel,
  horizontal = false,
}: BarChartProps) {
  const styles = useStyles();
  const maxValue = Math.max(...data.map(d => d.value));

  if (horizontal) {
    return (
      <div 
        className={styles.container}
        role="img"
        aria-label={ariaLabel || title || 'Bar chart'}
      >
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.chart}>
          {data.map((d, i) => (
            <div key={d.label} className={styles.row}>
              <div className={styles.rowLabel}>{d.label}</div>
              <div className={styles.barContainer}>
                <div 
                  className={styles.barHorizontal}
                  style={{
                    width: `${(d.value / maxValue) * 100}%`,
                    backgroundColor: d.color || 'var(--color-accent)',
                  }}
                />
                {showValues && (
                  <span className={styles.valueHorizontal}>
                    {d.value.toLocaleString()}{d.annotation ? ` ${d.annotation}` : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={ariaLabel || title || 'Bar chart'}
    >
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.chartVertical}>
        {data.map((d, i) => (
          <div key={d.label} className={styles.column}>
            <div className={styles.barWrapper}>
              {showValues && (
                <span className={styles.valueVertical}>{d.value.toLocaleString()}</span>
              )}
              <div 
                className={styles.barVertical}
                style={{
                  height: `${(d.value / maxValue) * 100}%`,
                  backgroundColor: d.color || 'var(--color-accent)',
                }}
              />
            </div>
            <div className={styles.columnLabel}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
