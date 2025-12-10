/**
 * Tests for the PerceptronToy widget
 */

import { describe, test, expect } from 'bun:test';

// Activation functions (extracted from component for testing)
const activations = {
  step: (x: number) => (x >= 0 ? 1 : 0),
  sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
  relu: (x: number) => Math.max(0, x),
  tanh: (x: number) => Math.tanh(x),
};

// Perceptron computation
function computeWeightedSum(x1: number, x2: number, w1: number, w2: number, bias: number): number {
  return w1 * x1 + w2 * x2 + bias;
}

// Calculate decision boundary line
function calculateBoundary(w1: number, w2: number, bias: number) {
  if (Math.abs(w2) < 0.01) return null;
  const x1 = 0;
  const x2 = 1;
  const y1 = (-w1 * x1 - bias) / w2;
  const y2 = (-w1 * x2 - bias) / w2;
  return { x1, y1, x2, y2 };
}

describe('PerceptronToy', () => {
  describe('activation functions', () => {
    describe('step function', () => {
      test('returns 1 for positive input', () => {
        expect(activations.step(0.5)).toBe(1);
        expect(activations.step(10)).toBe(1);
      });

      test('returns 1 for zero input', () => {
        expect(activations.step(0)).toBe(1);
      });

      test('returns 0 for negative input', () => {
        expect(activations.step(-0.1)).toBe(0);
        expect(activations.step(-10)).toBe(0);
      });
    });

    describe('sigmoid function', () => {
      test('returns 0.5 for zero input', () => {
        expect(activations.sigmoid(0)).toBe(0.5);
      });

      test('approaches 1 for large positive input', () => {
        expect(activations.sigmoid(10)).toBeGreaterThan(0.99);
      });

      test('approaches 0 for large negative input', () => {
        expect(activations.sigmoid(-10)).toBeLessThan(0.01);
      });

      test('is always between 0 and 1', () => {
        for (let x = -10; x <= 10; x += 0.5) {
          const result = activations.sigmoid(x);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(1);
        }
      });

      test('is monotonically increasing', () => {
        let prev = activations.sigmoid(-10);
        for (let x = -9; x <= 10; x++) {
          const current = activations.sigmoid(x);
          expect(current).toBeGreaterThan(prev);
          prev = current;
        }
      });
    });

    describe('ReLU function', () => {
      test('returns input for positive values', () => {
        expect(activations.relu(5)).toBe(5);
        expect(activations.relu(0.5)).toBe(0.5);
      });

      test('returns 0 for zero', () => {
        expect(activations.relu(0)).toBe(0);
      });

      test('returns 0 for negative values', () => {
        expect(activations.relu(-5)).toBe(0);
        expect(activations.relu(-0.1)).toBe(0);
      });
    });

    describe('tanh function', () => {
      test('returns 0 for zero input', () => {
        expect(activations.tanh(0)).toBe(0);
      });

      test('approaches 1 for large positive input', () => {
        expect(activations.tanh(10)).toBeGreaterThan(0.99);
      });

      test('approaches -1 for large negative input', () => {
        expect(activations.tanh(-10)).toBeLessThan(-0.99);
      });

      test('is always between -1 and 1', () => {
        for (let x = -10; x <= 10; x += 0.5) {
          const result = activations.tanh(x);
          expect(result).toBeGreaterThanOrEqual(-1);
          expect(result).toBeLessThanOrEqual(1);
        }
      });

      test('is symmetric around origin', () => {
        expect(activations.tanh(2)).toBeCloseTo(-activations.tanh(-2), 10);
      });
    });
  });

  describe('weighted sum computation', () => {
    test('computes basic weighted sum', () => {
      const result = computeWeightedSum(0.5, 0.5, 1, 1, 0);
      expect(result).toBe(1.0);
    });

    test('weights affect contribution', () => {
      // Higher weight on x1
      const result1 = computeWeightedSum(1, 0, 2, 1, 0);
      expect(result1).toBe(2);

      // Higher weight on x2
      const result2 = computeWeightedSum(0, 1, 1, 2, 0);
      expect(result2).toBe(2);
    });

    test('bias shifts the result', () => {
      const withoutBias = computeWeightedSum(0.5, 0.5, 1, 1, 0);
      const withPositiveBias = computeWeightedSum(0.5, 0.5, 1, 1, 1);
      const withNegativeBias = computeWeightedSum(0.5, 0.5, 1, 1, -1);

      expect(withPositiveBias).toBe(withoutBias + 1);
      expect(withNegativeBias).toBe(withoutBias - 1);
    });

    test('negative weights invert contribution', () => {
      const positive = computeWeightedSum(1, 0, 1, 1, 0);
      const negative = computeWeightedSum(1, 0, -1, 1, 0);
      expect(negative).toBe(-positive);
    });

    test('zero inputs give bias only', () => {
      const result = computeWeightedSum(0, 0, 5, 5, 2);
      expect(result).toBe(2);
    });
  });

  describe('decision boundary', () => {
    test('calculates boundary line', () => {
      const boundary = calculateBoundary(1, 1, -1);
      expect(boundary).not.toBeNull();
      expect(boundary?.x1).toBe(0);
      expect(boundary?.x2).toBe(1);
    });

    test('boundary passes through correct points', () => {
      // For w1*x + w2*y + bias = 0, with w1=1, w2=1, bias=-1
      // At x=0: y = 1
      // At x=1: y = 0
      const boundary = calculateBoundary(1, 1, -1);
      expect(boundary?.y1).toBeCloseTo(1, 10);
      expect(boundary?.y2).toBeCloseTo(0, 10);
    });

    test('returns null for horizontal boundary (w2 ≈ 0)', () => {
      const boundary = calculateBoundary(1, 0.001, 0);
      expect(boundary).toBeNull();
    });

    test('different weights change boundary slope', () => {
      const boundary1 = calculateBoundary(1, 1, 0);
      const boundary2 = calculateBoundary(2, 1, 0);
      
      expect(boundary1?.y2).not.toEqual(boundary2?.y2);
    });

    test('bias shifts boundary position', () => {
      const boundary1 = calculateBoundary(1, 1, 0);
      const boundary2 = calculateBoundary(1, 1, -0.5);
      
      expect(boundary1?.y1).not.toEqual(boundary2?.y1);
    });
  });

  describe('classification', () => {
    test('step activation creates binary classification', () => {
      // Points on the positive side of w1*x + w2*y + bias >= 0
      const w1 = 1, w2 = 1, bias = -0.8;
      
      // Point (0.7, 0.8) should be class 1
      const sum1 = computeWeightedSum(0.7, 0.8, w1, w2, bias);
      expect(activations.step(sum1)).toBe(1);
      
      // Point (0.2, 0.3) should be class 0
      const sum2 = computeWeightedSum(0.2, 0.3, w1, w2, bias);
      expect(activations.step(sum2)).toBe(0);
    });

    test('sigmoid provides probability-like output', () => {
      const w1 = 1, w2 = 1, bias = -0.5;
      
      // Point clearly in positive region
      const sum1 = computeWeightedSum(0.9, 0.9, w1, w2, bias);
      const prob1 = activations.sigmoid(sum1);
      expect(prob1).toBeGreaterThan(0.5);
      
      // Point clearly in negative region
      const sum2 = computeWeightedSum(0.1, 0.1, w1, w2, bias);
      const prob2 = activations.sigmoid(sum2);
      expect(prob2).toBeLessThan(0.5);
    });
  });

  describe('sample point accuracy', () => {
    const samplePoints = [
      { x: 0.2, y: 0.3, label: 0 },
      { x: 0.3, y: 0.2, label: 0 },
      { x: 0.7, y: 0.8, label: 1 },
      { x: 0.8, y: 0.7, label: 1 },
    ];

    function calculateAccuracy(w1: number, w2: number, bias: number): number {
      let correct = 0;
      for (const point of samplePoints) {
        const sum = computeWeightedSum(point.x, point.y, w1, w2, bias);
        const predicted = activations.step(sum);
        if (predicted === point.label) correct++;
      }
      return (correct / samplePoints.length) * 100;
    }

    test('good weights achieve high accuracy', () => {
      // These weights should separate the two classes well
      const accuracy = calculateAccuracy(1, 1, -0.8);
      expect(accuracy).toBeGreaterThanOrEqual(75);
    });

    test('poor weights achieve low accuracy', () => {
      // These weights should not separate well
      const accuracy = calculateAccuracy(-1, -1, 2);
      expect(accuracy).toBeLessThanOrEqual(50);
    });

    test('accuracy is between 0 and 100', () => {
      for (let w1 = -2; w1 <= 2; w1 += 0.5) {
        for (let w2 = -2; w2 <= 2; w2 += 0.5) {
          const accuracy = calculateAccuracy(w1, w2, 0);
          expect(accuracy).toBeGreaterThanOrEqual(0);
          expect(accuracy).toBeLessThanOrEqual(100);
        }
      }
    });
  });
});
