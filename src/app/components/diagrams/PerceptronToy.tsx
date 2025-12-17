/**
 * Interactive Perceptron Toy
 * 
 * Visualizes a single-neuron perceptron with adjustable weights and bias.
 * Shows how inputs get weighted, summed, and passed through an activation function.
 * Users can see the classification boundary shift as they tweak parameters.
 */

import { useState, useMemo, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles } from '@griffel/react';

const useStyles = makeStyles({
  container: {
    paddingTop: 'var(--space-lg)',
    paddingBottom: 'var(--space-lg)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface-raised)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
  },
  title: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 'var(--space-md)',
    textAlign: 'center',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-lg)',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  viz: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  svg: {
    width: '100%',
    maxWidth: '240px',
    height: 'auto',
    aspectRatio: '1 / 1',
  },
  testPoint: {
    cursor: 'grab',
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-fast)',
    ':hover': {
      transform: 'scale(1.2)',
    },
    ':active': {
      cursor: 'grabbing',
    },
  },
  legend: {
    display: 'flex',
    gap: 'var(--space-md)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid var(--color-surface)',
  },
  legendLine: {
    width: '16px',
    height: '2px',
    backgroundColor: 'var(--color-accent)',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xs)',
  },
  controlLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  controlLabelStrong: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
  },
  slider: {
    width: '100%',
    height: '6px',
    appearance: 'none',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    '::-webkit-slider-thumb': {
      appearance: 'none',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: 'var(--color-accent)',
      border: '2px solid var(--color-surface)',
      cursor: 'pointer',
      transitionProperty: 'transform',
      transitionDuration: 'var(--duration-fast)',
    },
    '::-webkit-slider-thumb:hover': {
      transform: 'scale(1.2)',
    },
    '::-moz-range-thumb': {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: 'var(--color-accent)',
      border: '2px solid var(--color-surface)',
      cursor: 'pointer',
    },
  },
  select: {
    paddingTop: 'var(--space-2xs)',
    paddingBottom: 'var(--space-2xs)',
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    marginTop: 'var(--space-xs)',
    marginBottom: 'var(--space-xs)',
  },
  output: {
    marginTop: 'var(--space-md)',
    paddingTop: 'var(--space-md)',
    borderTop: '1px solid var(--color-border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  formula: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    flexWrap: 'wrap',
  },
  formulaLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  formulaCode: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
  },
  result: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-md)',
  },
  resultItem: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
  },
  resultStrong: {
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
  },
  hint: {
    marginTop: 'var(--space-md)',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-sm)',
    paddingRight: 'var(--space-sm)',
    backgroundColor: 'var(--color-accent-subtle)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--line-height-relaxed)',
  },
});

export interface PerceptronToyProps {
  /** Title for the demo */
  title?: string;
  /** Number of inputs (default: 2 for 2D visualization) */
  numInputs?: 2;
}

interface Point {
  x: number;
  y: number;
  label: 0 | 1;
}

// Activation functions
const activations = {
  step: (x: number) => (x >= 0 ? 1 : 0),
  sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
  relu: (x: number) => Math.max(0, x),
  tanh: (x: number) => Math.tanh(x),
};

type ActivationType = keyof typeof activations;

// Generate sample points for visualization
const generateSamplePoints = (): Point[] => [
  // Class 0 points (lower-left region)
  { x: 0.2, y: 0.3, label: 0 },
  { x: 0.3, y: 0.2, label: 0 },
  { x: 0.15, y: 0.15, label: 0 },
  { x: 0.4, y: 0.25, label: 0 },
  { x: 0.25, y: 0.4, label: 0 },
  // Class 1 points (upper-right region)
  { x: 0.7, y: 0.8, label: 1 },
  { x: 0.8, y: 0.7, label: 1 },
  { x: 0.85, y: 0.85, label: 1 },
  { x: 0.6, y: 0.75, label: 1 },
  { x: 0.75, y: 0.6, label: 1 },
];

export function PerceptronToy({
  title = 'Interactive Perceptron',
}: PerceptronToyProps) {
  const styles = useStyles();
  
  // Weights and bias
  const [w1, setW1] = useState(1.0);
  const [w2, setW2] = useState(1.0);
  const [bias, setBias] = useState(-0.8);
  const [activation, setActivation] = useState<ActivationType>('step');
  
  // Test point for interactive exploration
  const [testX, setTestX] = useState(0.5);
  const [testY, setTestY] = useState(0.5);
  
  // Sample points for the scatter plot
  const samplePoints = useMemo(() => generateSamplePoints(), []);
  
  // Calculate the decision boundary line
  // For w1*x + w2*y + bias = 0, solving for y: y = (-w1*x - bias) / w2
  const boundaryLine = useMemo(() => {
    if (Math.abs(w2) < 0.01) return null; // Avoid division by zero
    const x1 = 0;
    const x2 = 1;
    const y1 = (-w1 * x1 - bias) / w2;
    const y2 = (-w1 * x2 - bias) / w2;
    return { x1, y1, x2, y2 };
  }, [w1, w2, bias]);
  
  // Calculate output for test point
  const testOutput = useMemo(() => {
    const weightedSum = w1 * testX + w2 * testY + bias;
    const activationFn = activations[activation];
    return {
      weightedSum,
      activated: activationFn(weightedSum),
    };
  }, [w1, w2, bias, testX, testY, activation]);
  
  // Calculate accuracy on sample points
  const accuracy = useMemo(() => {
    const activationFn = activations[activation];
    let correct = 0;
    for (const point of samplePoints) {
      const sum = w1 * point.x + w2 * point.y + bias;
      const predicted = activation === 'step' ? (sum >= 0 ? 1 : 0) : (activationFn(sum) >= 0.5 ? 1 : 0);
      if (predicted === point.label) correct++;
    }
    return (correct / samplePoints.length * 100).toFixed(0);
  }, [w1, w2, bias, activation, samplePoints]);
  
  // SVG dimensions
  const svgSize = 200;
  const padding = 20;
  const plotSize = svgSize - 2 * padding;
  
  // Scale to plot coordinates
  const toPlotX = (x: number) => padding + x * plotSize;
  const toPlotY = (y: number) => padding + (1 - y) * plotSize; // Flip Y axis
  
  const handleSliderChange = useCallback(
    (setter: (v: number) => void) => (e: JSX.TargetedEvent<HTMLInputElement>) => {
      setter(parseFloat((e.target as HTMLInputElement).value));
    },
    []
  );
  
  return (
    <div className={styles.container}>
      {title && <div className={styles.title}>{title}</div>}
      
      <div className={styles.layout}>
        {/* Visualization */}
        <div className={styles.viz}>
          <svg 
            viewBox={`0 0 ${svgSize} ${svgSize}`} 
            className={styles.svg}
            aria-label="Perceptron classification visualization"
          >
            {/* Grid background */}
            <rect
              x={padding}
              y={padding}
              width={plotSize}
              height={plotSize}
              fill="var(--color-bg-subtle)"
              stroke="var(--color-border)"
            />
            
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((v) => (
              <g key={v}>
                <line
                  x1={toPlotX(v)}
                  y1={padding}
                  x2={toPlotX(v)}
                  y2={svgSize - padding}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="2,2"
                />
                <line
                  x1={padding}
                  y1={toPlotY(v)}
                  x2={svgSize - padding}
                  y2={toPlotY(v)}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="2,2"
                />
              </g>
            ))}
            
            {/* Decision boundary */}
            {boundaryLine && (
              <line
                x1={toPlotX(Math.max(0, Math.min(1, boundaryLine.x1)))}
                y1={toPlotY(Math.max(0, Math.min(1, boundaryLine.y1)))}
                x2={toPlotX(Math.max(0, Math.min(1, boundaryLine.x2)))}
                y2={toPlotY(Math.max(0, Math.min(1, boundaryLine.y2)))}
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
            
            {/* Sample points */}
            {samplePoints.map((point, i) => (
              <circle
                key={i}
                cx={toPlotX(point.x)}
                cy={toPlotY(point.y)}
                r={6}
                fill={point.label === 1 ? 'var(--color-success)' : 'var(--color-warning)'}
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            ))}
            
            {/* Test point */}
            <circle
              cx={toPlotX(testX)}
              cy={toPlotY(testY)}
              r={8}
              fill={testOutput.activated >= 0.5 ? 'var(--color-success)' : 'var(--color-warning)'}
              stroke="var(--color-text)"
              strokeWidth="2"
              className={styles.testPoint}
            />
            
            {/* Axis labels */}
            <text x={svgSize / 2} y={svgSize - 2} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
              Input x₁
            </text>
            <text x={8} y={svgSize / 2} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" transform={`rotate(-90, 8, ${svgSize / 2})`}>
              Input x₂
            </text>
          </svg>
          
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-warning)' }} />
              Class 0
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--color-success)' }} />
              Class 1
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendLine} />
              Boundary
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Weight w₁: <strong className={styles.controlLabelStrong}>{w1.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w1}
              onInput={handleSliderChange(setW1)}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Weight w₂: <strong className={styles.controlLabelStrong}>{w2.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w2}
              onInput={handleSliderChange(setW2)}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Bias: <strong className={styles.controlLabelStrong}>{bias.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={bias}
              onInput={handleSliderChange(setBias)}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Activation:</label>
            <select
              value={activation}
              onChange={(e) => setActivation((e.target as HTMLSelectElement).value as ActivationType)}
              className={styles.select}
            >
              <option value="step">Step (binary)</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="relu">ReLU</option>
              <option value="tanh">Tanh</option>
            </select>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Test x₁: <strong className={styles.controlLabelStrong}>{testX.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={testX}
              onInput={handleSliderChange(setTestX)}
              className={styles.slider}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Test x₂: <strong className={styles.controlLabelStrong}>{testY.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={testY}
              onInput={handleSliderChange(setTestY)}
              className={styles.slider}
            />
          </div>
        </div>
      </div>
      
      {/* Output display */}
      <div className={styles.output}>
        <div className={styles.formula}>
          <span className={styles.formulaLabel}>Computation:</span>
          <code className={styles.formulaCode}>
            ({w1.toFixed(1)} × {testX.toFixed(2)}) + ({w2.toFixed(1)} × {testY.toFixed(2)}) + ({bias.toFixed(1)}) = {testOutput.weightedSum.toFixed(2)}
          </code>
        </div>
        <div className={styles.result}>
          <span className={styles.resultItem}>
            Weighted sum: <strong className={styles.resultStrong}>{testOutput.weightedSum.toFixed(3)}</strong>
          </span>
          <span className={styles.resultItem}>
            After {activation}: <strong className={styles.resultStrong}>{testOutput.activated.toFixed(3)}</strong>
          </span>
          <span className={styles.resultItem}>
            Accuracy: <strong className={styles.resultStrong}>{accuracy}%</strong>
          </span>
        </div>
      </div>
      
      <div className={styles.hint}>
        <strong>Try it:</strong> Adjust the weights and bias to move the decision boundary. Can you get 100% accuracy on the sample points? Notice how the boundary is always a straight line — that's the limitation of a single perceptron.
      </div>
    </div>
  );
}
