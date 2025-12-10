/**
 * Interactive Perceptron Toy
 * 
 * Visualizes a single-neuron perceptron with adjustable weights and bias.
 * Shows how inputs get weighted, summed, and passed through an activation function.
 * Users can see the classification boundary shift as they tweak parameters.
 */

import { useState, useMemo, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';

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
    <div className="perceptron-toy">
      {title && <div className="perceptron-toy__title">{title}</div>}
      
      <div className="perceptron-toy__layout">
        {/* Visualization */}
        <div className="perceptron-toy__viz">
          <svg 
            viewBox={`0 0 ${svgSize} ${svgSize}`} 
            className="perceptron-toy__svg"
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
              className="perceptron-toy__test-point"
            />
            
            {/* Axis labels */}
            <text x={svgSize / 2} y={svgSize - 2} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">
              Input x₁
            </text>
            <text x={8} y={svgSize / 2} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" transform={`rotate(-90, 8, ${svgSize / 2})`}>
              Input x₂
            </text>
          </svg>
          
          <div className="perceptron-toy__legend">
            <span className="perceptron-toy__legend-item">
              <span className="perceptron-toy__legend-dot" style={{ background: 'var(--color-warning)' }} />
              Class 0
            </span>
            <span className="perceptron-toy__legend-item">
              <span className="perceptron-toy__legend-dot" style={{ background: 'var(--color-success)' }} />
              Class 1
            </span>
            <span className="perceptron-toy__legend-item">
              <span className="perceptron-toy__legend-line" />
              Boundary
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="perceptron-toy__controls">
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">
              Weight w₁: <strong>{w1.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w1}
              onInput={handleSliderChange(setW1)}
              className="perceptron-toy__slider"
            />
          </div>
          
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">
              Weight w₂: <strong>{w2.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={w2}
              onInput={handleSliderChange(setW2)}
              className="perceptron-toy__slider"
            />
          </div>
          
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">
              Bias: <strong>{bias.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={bias}
              onInput={handleSliderChange(setBias)}
              className="perceptron-toy__slider"
            />
          </div>
          
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">Activation:</label>
            <select
              value={activation}
              onChange={(e) => setActivation((e.target as HTMLSelectElement).value as ActivationType)}
              className="perceptron-toy__select"
            >
              <option value="step">Step (binary)</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="relu">ReLU</option>
              <option value="tanh">Tanh</option>
            </select>
          </div>
          
          <div className="perceptron-toy__divider" />
          
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">
              Test x₁: <strong>{testX.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={testX}
              onInput={handleSliderChange(setTestX)}
              className="perceptron-toy__slider"
            />
          </div>
          
          <div className="perceptron-toy__control-group">
            <label className="perceptron-toy__control-label">
              Test x₂: <strong>{testY.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={testY}
              onInput={handleSliderChange(setTestY)}
              className="perceptron-toy__slider"
            />
          </div>
        </div>
      </div>
      
      {/* Output display */}
      <div className="perceptron-toy__output">
        <div className="perceptron-toy__formula">
          <span className="perceptron-toy__formula-label">Computation:</span>
          <code>
            ({w1.toFixed(1)} × {testX.toFixed(2)}) + ({w2.toFixed(1)} × {testY.toFixed(2)}) + ({bias.toFixed(1)}) = {testOutput.weightedSum.toFixed(2)}
          </code>
        </div>
        <div className="perceptron-toy__result">
          <span className="perceptron-toy__result-item">
            Weighted sum: <strong>{testOutput.weightedSum.toFixed(3)}</strong>
          </span>
          <span className="perceptron-toy__result-item">
            After {activation}: <strong>{testOutput.activated.toFixed(3)}</strong>
          </span>
          <span className="perceptron-toy__result-item">
            Accuracy: <strong>{accuracy}%</strong>
          </span>
        </div>
      </div>
      
      <div className="perceptron-toy__hint">
        <strong>Try it:</strong> Adjust the weights and bias to move the decision boundary. Can you get 100% accuracy on the sample points? Notice how the boundary is always a straight line — that's the limitation of a single perceptron.
      </div>
    </div>
  );
}
