/**
 * Conway's Game of Life Interactive Widget
 * 
 * Features:
 * - Play/pause and step controls
 * - Speed adjustment slider
 * - Generation counter
 * - Multiple presets (random densities + classic patterns)
 * - Click to toggle cells manually
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'preact/hooks';
import type { JSX } from 'preact';

export interface GameOfLifeProps {
  /** Grid width in cells */
  width?: number;
  /** Grid height in cells */
  height?: number;
  /** Cell size in pixels */
  cellSize?: number;
  /** Title for the widget */
  title?: string;
  /** Initial preset to load */
  initialPreset?: string;
}

type Grid = boolean[][];

// Classic Game of Life patterns
const PATTERNS: Record<string, { name: string; pattern: number[][]; description: string }> = {
  empty: {
    name: 'Empty',
    pattern: [],
    description: 'Start with a blank canvas',
  },
  glider: {
    name: 'Glider',
    pattern: [
      [0, 1],
      [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
    description: 'The smallest spaceship',
  },
  lwss: {
    name: 'Lightweight Spaceship',
    pattern: [
      [0, 1], [0, 4],
      [1, 0],
      [2, 0], [2, 4],
      [3, 0], [3, 1], [3, 2], [3, 3],
    ],
    description: 'A larger traveling pattern',
  },
  blinker: {
    name: 'Blinker',
    pattern: [
      [0, 0], [0, 1], [0, 2],
    ],
    description: 'Simplest oscillator (period 2)',
  },
  toad: {
    name: 'Toad',
    pattern: [
      [0, 1], [0, 2], [0, 3],
      [1, 0], [1, 1], [1, 2],
    ],
    description: 'Period 2 oscillator',
  },
  beacon: {
    name: 'Beacon',
    pattern: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
      [2, 2], [2, 3],
      [3, 2], [3, 3],
    ],
    description: 'Period 2 oscillator',
  },
  pulsar: {
    name: 'Pulsar',
    pattern: [
      // Top section
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [2, 0], [2, 5], [2, 7], [2, 12],
      [3, 0], [3, 5], [3, 7], [3, 12],
      [4, 0], [4, 5], [4, 7], [4, 12],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      // Bottom section (mirrored)
      [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
      [8, 0], [8, 5], [8, 7], [8, 12],
      [9, 0], [9, 5], [9, 7], [9, 12],
      [10, 0], [10, 5], [10, 7], [10, 12],
      [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
    ],
    description: 'Period 3 oscillator',
  },
  pentadecathlon: {
    name: 'Pentadecathlon',
    pattern: [
      [0, 1],
      [1, 1],
      [2, 0], [2, 2],
      [3, 1],
      [4, 1],
      [5, 1],
      [6, 1],
      [7, 0], [7, 2],
      [8, 1],
      [9, 1],
    ],
    description: 'Period 15 oscillator',
  },
  gliderGun: {
    name: 'Gosper Glider Gun',
    pattern: [
      // Left square
      [4, 0], [4, 1],
      [5, 0], [5, 1],
      // Left part
      [4, 10],
      [5, 10], [5, 11],
      [6, 10], [6, 11],
      [3, 12], [7, 12],
      [2, 14], [3, 14], [7, 14], [8, 14],
      [5, 16],
      [3, 17], [7, 17],
      [4, 18], [5, 18], [6, 18],
      [5, 19],
      // Right part
      [2, 20], [3, 20], [4, 20],
      [2, 21], [3, 21], [4, 21],
      [1, 22], [5, 22],
      [0, 24], [1, 24], [5, 24], [6, 24],
      // Right square
      [2, 34], [3, 34],
      [2, 35], [3, 35],
    ],
    description: 'Produces gliders indefinitely',
  },
  rPentomino: {
    name: 'R-pentomino',
    pattern: [
      [0, 1], [0, 2],
      [1, 0], [1, 1],
      [2, 1],
    ],
    description: 'Chaotic long-lived pattern',
  },
  acorn: {
    name: 'Acorn',
    pattern: [
      [0, 1],
      [1, 3],
      [2, 0], [2, 1], [2, 4], [2, 5], [2, 6],
    ],
    description: 'Evolves for 5206 generations',
  },
  diehard: {
    name: 'Diehard',
    pattern: [
      [0, 6],
      [1, 0], [1, 1],
      [2, 1], [2, 5], [2, 6], [2, 7],
    ],
    description: 'Disappears after 130 generations',
  },
  block: {
    name: 'Block (Still Life)',
    pattern: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
    ],
    description: 'Simplest still life',
  },
  beehive: {
    name: 'Beehive (Still Life)',
    pattern: [
      [0, 1], [0, 2],
      [1, 0], [1, 3],
      [2, 1], [2, 2],
    ],
    description: 'Common still life',
  },
};

// Random preset generators
const RANDOM_PRESETS = {
  sparse: { name: 'Sparse Random', density: 0.15, description: '~15% cells alive' },
  medium: { name: 'Medium Random', density: 0.3, description: '~30% cells alive' },
  dense: { name: 'Dense Random', density: 0.5, description: '~50% cells alive' },
  full: { name: 'Full', density: 1.0, description: 'All cells alive' },
};

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
      const ny = (y + dy + height) % height; // Wrap around (toroidal)
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
      // Conway's rules:
      // 1. Any live cell with 2 or 3 neighbors survives
      // 2. Any dead cell with exactly 3 neighbors becomes alive
      // 3. All other cells die or stay dead
      if (cell) {
        return neighbors === 2 || neighbors === 3;
      } else {
        return neighbors === 3;
      }
    })
  );
}

export function GameOfLife({
  width = 40,
  height = 30,
  cellSize = 12,
  title = "Conway's Game of Life",
  initialPreset = 'glider',
}: GameOfLifeProps) {
  const [grid, setGrid] = useState<Grid>(() => {
    const emptyGrid = createEmptyGrid(width, height);
    const pattern = PATTERNS[initialPreset];
    if (pattern && pattern.pattern.length > 0) {
      return placePattern(emptyGrid, pattern.pattern, Math.floor(width / 4), Math.floor(height / 4));
    }
    return emptyGrid;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(10); // Generations per second
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(true);
  
  const intervalRef = useRef<number | null>(null);
  
  // Calculate alive cell count
  const aliveCount = useMemo(() => {
    return grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  }, [grid]);
  
  // Step function
  const step = useCallback(() => {
    setGrid(g => nextGeneration(g));
    setGeneration(g => g + 1);
  }, []);
  
  // Play/pause effect
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / speed;
      intervalRef.current = window.setInterval(step, interval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isPlaying, speed, step]);
  
  // Load preset
  const loadPreset = useCallback((presetKey: string) => {
    setIsPlaying(false);
    setGeneration(0);
    setSelectedPreset(presetKey);
    
    if (presetKey in RANDOM_PRESETS) {
      const preset = RANDOM_PRESETS[presetKey as keyof typeof RANDOM_PRESETS];
      setGrid(createRandomGrid(width, height, preset.density));
    } else if (presetKey in PATTERNS) {
      const pattern = PATTERNS[presetKey];
      const emptyGrid = createEmptyGrid(width, height);
      if (pattern.pattern.length === 0) {
        setGrid(emptyGrid);
      } else {
        // Center the pattern
        const patternHeight = Math.max(...pattern.pattern.map(p => p[0])) + 1;
        const patternWidth = Math.max(...pattern.pattern.map(p => p[1])) + 1;
        const offsetX = Math.floor((width - patternWidth) / 2);
        const offsetY = Math.floor((height - patternHeight) / 2);
        setGrid(placePattern(emptyGrid, pattern.pattern, offsetX, offsetY));
      }
    }
  }, [width, height]);
  
  // Cell toggle handlers
  const handleCellMouseDown = useCallback((x: number, y: number) => {
    setIsDragging(true);
    const newValue = !grid[y][x];
    setDragValue(newValue);
    setGrid(g => {
      const newGrid = g.map(row => [...row]);
      newGrid[y][x] = newValue;
      return newGrid;
    });
  }, [grid]);
  
  const handleCellMouseEnter = useCallback((x: number, y: number) => {
    if (isDragging) {
      setGrid(g => {
        const newGrid = g.map(row => [...row]);
        newGrid[y][x] = dragValue;
        return newGrid;
      });
    }
  }, [isDragging, dragValue]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add global mouse up listener
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);
  
  const handleSpeedChange = useCallback((e: JSX.TargetedEvent<HTMLInputElement>) => {
    setSpeed(parseFloat((e.target as HTMLInputElement).value));
  }, []);
  
  // Group presets by category
  const presetCategories = useMemo(() => [
    {
      label: 'Basics',
      presets: ['empty', 'sparse', 'medium', 'dense', 'full'],
    },
    {
      label: 'Spaceships',
      presets: ['glider', 'lwss'],
    },
    {
      label: 'Oscillators',
      presets: ['blinker', 'toad', 'beacon', 'pulsar', 'pentadecathlon'],
    },
    {
      label: 'Still Lifes',
      presets: ['block', 'beehive'],
    },
    {
      label: 'Methuselahs',
      presets: ['rPentomino', 'acorn', 'diehard'],
    },
    {
      label: 'Guns',
      presets: ['gliderGun'],
    },
  ], []);
  
  const getPresetInfo = (key: string) => {
    if (key in PATTERNS) return PATTERNS[key];
    if (key in RANDOM_PRESETS) return RANDOM_PRESETS[key as keyof typeof RANDOM_PRESETS];
    return { name: key, description: '' };
  };
  
  return (
    <div className="game-of-life">
      {title && <div className="game-of-life__title">{title}</div>}
      
      {/* Controls */}
      <div className="game-of-life__controls">
        <div className="game-of-life__buttons">
          <button
            className={`game-of-life__btn ${isPlaying ? 'game-of-life__btn--active' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="game-of-life__btn"
            onClick={step}
            disabled={isPlaying}
            title="Step"
          >
            ⏭
          </button>
          <button
            className="game-of-life__btn"
            onClick={() => loadPreset(selectedPreset)}
            title="Reset"
          >
            ↺
          </button>
        </div>
        
        <div className="game-of-life__speed">
          <label className="game-of-life__speed-label">
            Speed: <strong>{speed}</strong>/s
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onInput={handleSpeedChange}
            className="game-of-life__slider"
          />
        </div>
        
        <div className="game-of-life__stats">
          <span className="game-of-life__stat">
            Gen: <strong>{generation}</strong>
          </span>
          <span className="game-of-life__stat">
            Alive: <strong>{aliveCount}</strong>
          </span>
        </div>
      </div>
      
      {/* Grid */}
      <div 
        className="game-of-life__grid-container"
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="game-of-life__grid"
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`game-of-life__cell ${cell ? 'game-of-life__cell--alive' : ''}`}
                onMouseDown={() => handleCellMouseDown(x, y)}
                onMouseEnter={() => handleCellMouseEnter(x, y)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Presets */}
      <div className="game-of-life__presets">
        <div className="game-of-life__presets-label">Presets:</div>
        <div className="game-of-life__presets-grid">
          {presetCategories.map(category => (
            <div key={category.label} className="game-of-life__preset-category">
              <span className="game-of-life__category-label">{category.label}</span>
              <div className="game-of-life__preset-buttons">
                {category.presets.map(key => {
                  const info = getPresetInfo(key);
                  return (
                    <button
                      key={key}
                      className={`game-of-life__preset-btn ${selectedPreset === key ? 'game-of-life__preset-btn--active' : ''}`}
                      onClick={() => loadPreset(key)}
                      title={info.description}
                    >
                      {info.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="game-of-life__hint">
        <strong>Interact:</strong> Click or drag on the grid to toggle cells. Watch how four simple rules create complex, emergent patterns.
      </div>
    </div>
  );
}
