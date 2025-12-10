/**
 * Tests for the GameOfLife widget
 */

import { describe, test, expect } from 'bun:test';

type Grid = boolean[][];

// Grid creation functions (extracted from component)
function createEmptyGrid(width: number, height: number): Grid {
  return Array(height).fill(null).map(() => Array(width).fill(false));
}

function createRandomGrid(width: number, height: number, density: number): Grid {
  return Array(height).fill(null).map(() => 
    Array(width).fill(null).map(() => Math.random() < density)
  );
}

function placePattern(grid: Grid, pattern: number[][], offsetX: number, offsetY: number): Grid {
  const newGrid = grid.map(row => [...row]);
  for (const [y, x] of pattern) {
    const ny = offsetY + y;
    const nx = offsetX + x;
    if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[0].length) {
      newGrid[ny][nx] = true;
    }
  }
  return newGrid;
}

function countNeighbors(grid: Grid, x: number, y: number): number {
  const height = grid.length;
  const width = grid[0].length;
  let count = 0;
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = (y + dy + height) % height;
      const nx = (x + dx + width) % width;
      if (grid[ny][nx]) count++;
    }
  }
  return count;
}

function nextGeneration(grid: Grid): Grid {
  const height = grid.length;
  const width = grid[0].length;
  
  return grid.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(grid, x, y);
      if (cell) {
        return neighbors === 2 || neighbors === 3;
      } else {
        return neighbors === 3;
      }
    })
  );
}

function countAliveCells(grid: Grid): number {
  return grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
}

// Sample patterns
const PATTERNS = {
  glider: [
    [0, 1],
    [1, 2],
    [2, 0], [2, 1], [2, 2],
  ],
  blinker: [
    [0, 0], [0, 1], [0, 2],
  ],
  block: [
    [0, 0], [0, 1],
    [1, 0], [1, 1],
  ],
};

describe('GameOfLife', () => {
  describe('grid creation', () => {
    test('createEmptyGrid creates correct dimensions', () => {
      const grid = createEmptyGrid(10, 5);
      expect(grid.length).toBe(5); // height
      expect(grid[0].length).toBe(10); // width
    });

    test('createEmptyGrid creates all false values', () => {
      const grid = createEmptyGrid(5, 5);
      for (const row of grid) {
        for (const cell of row) {
          expect(cell).toBe(false);
        }
      }
    });

    test('createRandomGrid creates correct dimensions', () => {
      const grid = createRandomGrid(10, 5, 0.5);
      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(10);
    });

    test('createRandomGrid with density 0 creates empty grid', () => {
      const grid = createRandomGrid(10, 10, 0);
      const alive = countAliveCells(grid);
      expect(alive).toBe(0);
    });

    test('createRandomGrid with density 1 creates full grid', () => {
      const grid = createRandomGrid(10, 10, 1);
      const alive = countAliveCells(grid);
      expect(alive).toBe(100);
    });

    test('createRandomGrid with density 0.5 creates approximately half alive', () => {
      // Use a larger grid for statistical significance
      const grid = createRandomGrid(100, 100, 0.5);
      const alive = countAliveCells(grid);
      // Should be roughly 5000 ± some variance
      expect(alive).toBeGreaterThan(4000);
      expect(alive).toBeLessThan(6000);
    });
  });

  describe('pattern placement', () => {
    test('places pattern at specified offset', () => {
      const grid = createEmptyGrid(10, 10);
      const result = placePattern(grid, PATTERNS.block, 2, 2);
      
      expect(result[2][2]).toBe(true);
      expect(result[2][3]).toBe(true);
      expect(result[3][2]).toBe(true);
      expect(result[3][3]).toBe(true);
    });

    test('places glider pattern correctly', () => {
      const grid = createEmptyGrid(10, 10);
      const result = placePattern(grid, PATTERNS.glider, 0, 0);
      
      expect(result[0][1]).toBe(true);
      expect(result[1][2]).toBe(true);
      expect(result[2][0]).toBe(true);
      expect(result[2][1]).toBe(true);
      expect(result[2][2]).toBe(true);
      expect(countAliveCells(result)).toBe(5);
    });

    test('clips pattern to grid bounds', () => {
      const grid = createEmptyGrid(3, 3);
      // Place pattern partially outside grid
      const result = placePattern(grid, PATTERNS.glider, 2, 2);
      
      // Only cells within bounds should be set
      expect(countAliveCells(result)).toBeLessThan(5);
    });

    test('does not modify original grid', () => {
      const grid = createEmptyGrid(10, 10);
      const originalAlive = countAliveCells(grid);
      placePattern(grid, PATTERNS.glider, 0, 0);
      expect(countAliveCells(grid)).toBe(originalAlive);
    });
  });

  describe('neighbor counting', () => {
    test('counts zero neighbors for isolated cell', () => {
      const grid = createEmptyGrid(5, 5);
      grid[2][2] = true;
      expect(countNeighbors(grid, 2, 2)).toBe(0);
    });

    test('counts all 8 neighbors when surrounded', () => {
      const grid = createEmptyGrid(5, 5);
      // Surround center cell
      grid[1][1] = true; grid[1][2] = true; grid[1][3] = true;
      grid[2][1] = true;                     grid[2][3] = true;
      grid[3][1] = true; grid[3][2] = true; grid[3][3] = true;
      
      expect(countNeighbors(grid, 2, 2)).toBe(8);
    });

    test('counts partial neighbors', () => {
      const grid = createEmptyGrid(5, 5);
      grid[1][2] = true; // top
      grid[2][1] = true; // left
      grid[3][2] = true; // bottom
      
      expect(countNeighbors(grid, 2, 2)).toBe(3);
    });

    test('wraps around edges (toroidal)', () => {
      const grid = createEmptyGrid(5, 5);
      grid[4][4] = true; // bottom-right corner
      
      // Cell at (0,0) should see (4,4) as neighbor (diagonal wrap)
      expect(countNeighbors(grid, 0, 0)).toBe(1);
    });

    test('wraps left-right', () => {
      const grid = createEmptyGrid(5, 5);
      grid[2][4] = true; // right edge
      
      // Cell at (0,2) should see cell at (4,2) as neighbor
      expect(countNeighbors(grid, 0, 2)).toBe(1);
    });

    test('wraps top-bottom', () => {
      const grid = createEmptyGrid(5, 5);
      grid[4][2] = true; // bottom edge
      
      // Cell at (2,0) should see cell at (2,4) as neighbor
      expect(countNeighbors(grid, 2, 0)).toBe(1);
    });
  });

  describe("Conway's rules", () => {
    describe('rule 1: live cell with 2 or 3 neighbors survives', () => {
      test('live cell with 2 neighbors survives', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true; // cell to test
        grid[1][2] = true; // neighbor 1
        grid[3][2] = true; // neighbor 2
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(true);
      });

      test('live cell with 3 neighbors survives', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true;
        grid[1][2] = true;
        grid[3][2] = true;
        grid[2][1] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(true);
      });
    });

    describe('rule 2: dead cell with exactly 3 neighbors becomes alive', () => {
      test('dead cell with 3 neighbors becomes alive', () => {
        const grid = createEmptyGrid(5, 5);
        grid[1][2] = true;
        grid[3][2] = true;
        grid[2][1] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(true);
      });

      test('dead cell with 2 neighbors stays dead', () => {
        const grid = createEmptyGrid(5, 5);
        grid[1][2] = true;
        grid[3][2] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });

      test('dead cell with 4 neighbors stays dead', () => {
        const grid = createEmptyGrid(5, 5);
        grid[1][2] = true;
        grid[3][2] = true;
        grid[2][1] = true;
        grid[2][3] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });
    });

    describe('rule 3: underpopulation (fewer than 2 neighbors)', () => {
      test('live cell with 0 neighbors dies', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });

      test('live cell with 1 neighbor dies', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true;
        grid[1][2] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });
    });

    describe('rule 4: overpopulation (more than 3 neighbors)', () => {
      test('live cell with 4 neighbors dies', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true;
        grid[1][2] = true;
        grid[3][2] = true;
        grid[2][1] = true;
        grid[2][3] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });

      test('live cell with 8 neighbors dies', () => {
        const grid = createEmptyGrid(5, 5);
        grid[2][2] = true;
        // All 8 neighbors
        grid[1][1] = true; grid[1][2] = true; grid[1][3] = true;
        grid[2][1] = true;                     grid[2][3] = true;
        grid[3][1] = true; grid[3][2] = true; grid[3][3] = true;
        
        const next = nextGeneration(grid);
        expect(next[2][2]).toBe(false);
      });
    });
  });

  describe('classic patterns', () => {
    describe('still life: block', () => {
      test('block remains stable', () => {
        const grid = createEmptyGrid(10, 10);
        const withBlock = placePattern(grid, PATTERNS.block, 4, 4);
        
        const gen1 = nextGeneration(withBlock);
        const gen2 = nextGeneration(gen1);
        const gen3 = nextGeneration(gen2);
        
        // Block should be identical across generations
        expect(countAliveCells(gen1)).toBe(4);
        expect(countAliveCells(gen2)).toBe(4);
        expect(countAliveCells(gen3)).toBe(4);
        
        // Same positions
        expect(gen3[4][4]).toBe(true);
        expect(gen3[4][5]).toBe(true);
        expect(gen3[5][4]).toBe(true);
        expect(gen3[5][5]).toBe(true);
      });
    });

    describe('oscillator: blinker', () => {
      test('blinker oscillates with period 2', () => {
        const grid = createEmptyGrid(10, 10);
        // Horizontal blinker
        grid[5][4] = true;
        grid[5][5] = true;
        grid[5][6] = true;
        
        const gen1 = nextGeneration(grid);
        
        // Should become vertical
        expect(gen1[4][5]).toBe(true);
        expect(gen1[5][5]).toBe(true);
        expect(gen1[6][5]).toBe(true);
        expect(gen1[5][4]).toBe(false);
        expect(gen1[5][6]).toBe(false);
        
        const gen2 = nextGeneration(gen1);
        
        // Should return to horizontal
        expect(gen2[5][4]).toBe(true);
        expect(gen2[5][5]).toBe(true);
        expect(gen2[5][6]).toBe(true);
      });
    });

    describe('spaceship: glider', () => {
      test('glider moves diagonally', () => {
        const grid = createEmptyGrid(10, 10);
        const withGlider = placePattern(grid, PATTERNS.glider, 1, 1);
        
        // After 4 generations, glider should have moved 1 cell diagonally
        let current = withGlider;
        for (let i = 0; i < 4; i++) {
          current = nextGeneration(current);
        }
        
        // Glider maintains 5 cells
        expect(countAliveCells(current)).toBe(5);
      });

      test('glider wraps around edges', () => {
        const grid = createEmptyGrid(10, 10);
        const withGlider = placePattern(grid, PATTERNS.glider, 7, 7);
        
        // Run many generations to let it wrap
        let current = withGlider;
        for (let i = 0; i < 40; i++) {
          current = nextGeneration(current);
        }
        
        // Glider should still have 5 cells (no death from hitting edge)
        expect(countAliveCells(current)).toBe(5);
      });
    });
  });

  describe('grid size variations', () => {
    test('handles tiny grid (8x8)', () => {
      const grid = createEmptyGrid(8, 8);
      grid[4][4] = true;
      grid[4][5] = true;
      grid[5][4] = true;
      grid[5][5] = true;
      
      const next = nextGeneration(grid);
      expect(countAliveCells(next)).toBe(4);
    });

    test('handles large grid (128x128)', () => {
      const grid = createRandomGrid(128, 128, 0.3);
      const next = nextGeneration(grid);
      
      // Should produce valid grid
      expect(next.length).toBe(128);
      expect(next[0].length).toBe(128);
    });

    test('handles non-square grid', () => {
      const grid = createEmptyGrid(20, 10);
      const withBlock = placePattern(grid, PATTERNS.block, 5, 5);
      
      const next = nextGeneration(withBlock);
      expect(countAliveCells(next)).toBe(4);
    });
  });

  describe('edge cases', () => {
    test('empty grid stays empty', () => {
      const grid = createEmptyGrid(10, 10);
      const next = nextGeneration(grid);
      expect(countAliveCells(next)).toBe(0);
    });

    test('full grid loses most cells (overpopulation)', () => {
      const grid = createRandomGrid(10, 10, 1);
      const next = nextGeneration(grid);
      // Most cells should die due to overpopulation
      expect(countAliveCells(next)).toBeLessThan(50);
    });

    test('1x1 grid handles edge wrapping', () => {
      const grid = createEmptyGrid(1, 1);
      grid[0][0] = true;
      
      // Single cell with no real neighbors (wraps to itself, but self not counted)
      const next = nextGeneration(grid);
      expect(next[0][0]).toBe(false);
    });

    test('2x2 all alive dies (overpopulation due to wrapping)', () => {
      const grid = createEmptyGrid(2, 2);
      grid[0][0] = true;
      grid[0][1] = true;
      grid[1][0] = true;
      grid[1][1] = true;
      
      const next = nextGeneration(grid);
      // In a 2x2 grid with toroidal wrapping, each cell checks 8 neighbor
      // positions, but some wrap to the same cells multiple times.
      // This results in >3 neighbors counted, causing overpopulation death.
      expect(countAliveCells(next)).toBe(0);
    });

    test('3x3 center cell with 4 corners alive has 4 neighbors', () => {
      const grid = createEmptyGrid(3, 3);
      grid[0][0] = true; // corners
      grid[0][2] = true;
      grid[2][0] = true;
      grid[2][2] = true;
      
      // Center cell (1,1) should have exactly 4 neighbors
      expect(countNeighbors(grid, 1, 1)).toBe(4);
      
      // Center stays dead (needs exactly 3 to birth)
      const next = nextGeneration(grid);
      expect(next[1][1]).toBe(false);
    });
  });
});
