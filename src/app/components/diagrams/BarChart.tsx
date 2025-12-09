/**
 * Simple bar chart - Pure CSS implementation
 */

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
  const maxValue = Math.max(...data.map(d => d.value));

  if (horizontal) {
    return (
      <div 
        className="diagram-container bar-chart bar-chart--horizontal"
        role="img"
        aria-label={ariaLabel || title || 'Bar chart'}
      >
        {title && <div className="diagram-title">{title}</div>}
        <div className="bar-chart__chart">
          {data.map((d, i) => (
            <div key={d.label} className="bar-chart__row">
              <div className="bar-chart__label">{d.label}</div>
              <div className="bar-chart__bar-container">
                <div 
                  className="bar-chart__bar"
                  style={{
                    width: `${(d.value / maxValue) * 100}%`,
                    backgroundColor: d.color || 'var(--color-accent)',
                  }}
                />
                {showValues && (
                  <span className="bar-chart__value">
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
      className="diagram-container bar-chart bar-chart--vertical"
      role="img"
      aria-label={ariaLabel || title || 'Bar chart'}
    >
      {title && <div className="diagram-title">{title}</div>}
      <div className="bar-chart__chart bar-chart__chart--vertical">
        {data.map((d, i) => (
          <div key={d.label} className="bar-chart__column">
            <div className="bar-chart__bar-wrapper">
              {showValues && (
                <span className="bar-chart__value">{d.value.toLocaleString()}</span>
              )}
              <div 
                className="bar-chart__bar"
                style={{
                  height: `${(d.value / maxValue) * 100}%`,
                  backgroundColor: d.color || 'var(--color-accent)',
                }}
              />
            </div>
            <div className="bar-chart__label">{d.label}</div>
          </div>
        ))}
      </div>
      {yLabel && <div className="bar-chart__y-label">{yLabel}</div>}
    </div>
  );
}
