/**
 * Scale comparison chart - Pure CSS/SVG implementation
 * 
 * Shows items on a logarithmic or linear scale with optional threshold markers.
 * Uses native SVG without external dependencies.
 */

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

  const barHeight = 28;
  const labelWidth = 120;
  const padding = 20;

  return (
    <div 
      className="diagram-container scale-comparison"
      role="img"
      aria-label={ariaLabel || title || 'Scale comparison chart'}
    >
      {title && <div className="diagram-title">{title}</div>}
      <div className="scale-comparison__chart">
        {data.map((d, i) => (
          <div key={d.label} className="scale-comparison__row">
            <div className="scale-comparison__label">{d.label}</div>
            <div className="scale-comparison__bar-container">
              <div 
                className="scale-comparison__bar"
                style={{
                  width: `${getScale(d.value)}%`,
                  backgroundColor: d.color || 'var(--color-accent)',
                }}
              />
              <span className="scale-comparison__value">
                {formatNumber(d.value)}{d.annotation ? ` ${d.annotation}` : ''}
              </span>
            </div>
          </div>
        ))}
        {thresholds.map((threshold, i) => {
          const position = getScale(threshold.value);
          if (position < 0 || position > 100) return null;
          return (
            <div 
              key={i}
              className="scale-comparison__threshold"
              style={{ left: `calc(${labelWidth}px + ${position}% * (100% - ${labelWidth}px) / 100)` }}
            >
              <div 
                className="scale-comparison__threshold-line"
                style={{ borderColor: threshold.color || 'var(--color-accent)' }}
              />
              <span 
                className="scale-comparison__threshold-label"
                style={{ color: threshold.color || 'var(--color-accent)' }}
              >
                {threshold.label}
              </span>
            </div>
          );
        })}
      </div>
      {unit && <div className="scale-comparison__unit">{unit}</div>}
    </div>
  );
}
