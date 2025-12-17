/**
 * Conway's Game of Life Interactive Widget
 * 
 * Features:
 * - Play/pause and step controls
 * - Speed adjustment slider
 * - Generation counter
 * - Multiple presets (random densities + classic patterns)
 * - Click to toggle cells manually
 * - Auto-sizing grid to fit selected patterns
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'preact/hooks';
import type { JSX } from 'preact';
import { makeStyles, mergeClasses } from '@griffel/react';

const useStyles = makeStyles({
  container: {
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
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
    marginBottom: 'var(--space-sm)',
    textAlign: 'center',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 'var(--space-xs)',
    rowGap: '2px',
    marginBottom: 'var(--space-sm)',
  },
  selectGroup: {
    display: 'flex',
    gap: '2px',
  },
  selectWrapper: {
    position: 'relative',
    display: 'inline-block',
    height: '32px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    ':focus-within': {
      borderColor: 'var(--color-accent)',
    },
  },
  selectSizer: {
    visibility: 'hidden',
    height: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
  },
  selectSizerSpan: {
    whiteSpace: 'nowrap',
    paddingRight: 'calc(var(--space-2xs) + 10px)',
  },
  selectFacade: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    gap: 'var(--space-2xs)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  selectText: {
    flex: 1,
  },
  selectChevron: {
    color: 'var(--color-text-muted)',
    flexShrink: 0,
  },
  selectNative: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
  },
  playbackGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  buttons: {
    display: 'flex',
    gap: '2px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
    ':hover:not(:disabled)': {
      borderColor: 'var(--color-accent)',
      backgroundColor: 'var(--color-accent-subtle)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  btnActive: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-surface)',
    ':hover:not(:disabled)': {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-surface)',
    },
  },
  speed: {
    display: 'flex',
    alignItems: 'stretch',
    height: '32px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  speedValue: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text)',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    whiteSpace: 'nowrap',
  },
  speedUnit: {
    color: 'var(--color-text-muted)',
    marginLeft: '1px',
  },
  speedButtons: {
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--color-border)',
  },
  speedBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '20px',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':first-child': {
      borderBottom: '1px solid var(--color-border)',
    },
    ':hover': {
      backgroundColor: 'var(--color-bg-subtle)',
    },
    ':active': {
      backgroundColor: 'var(--color-border)',
    },
  },
  stats: {
    display: 'flex',
    gap: '2px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    paddingLeft: 'var(--space-2xs)',
    paddingRight: 'var(--space-2xs)',
    gap: '2px',
    cursor: 'default',
    transitionProperty: 'border-color',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--color-text-muted)',
    },
  },
  statLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text)',
    minWidth: '3ch',
    textAlign: 'right',
  },
  extinct: {
    color: 'var(--color-error, #dc2626)',
    fontSize: 'var(--font-size-sm)',
    animationName: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    animationDuration: '1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  grid: {
    display: 'grid',
    gap: '1px',
    backgroundColor: 'var(--color-border-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: 'auto',
    userSelect: 'none',
  },
  cell: {
    aspectRatio: '1 / 1',
    backgroundColor: 'var(--color-surface)',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '50ms',
    ':hover': {
      backgroundColor: 'var(--color-bg-subtle)',
    },
  },
  cellAlive: {
    backgroundColor: 'var(--color-accent)',
    ':hover': {
      backgroundColor: 'var(--color-accent)',
      opacity: 0.8,
    },
  },
});

export interface GameOfLifeProps {
  /** Initial grid width in cells */
  initialWidth?: number;
  /** Initial grid height in cells */
  initialHeight?: number;
  /** Maximum width of the grid container in pixels */
  maxContainerWidth?: number;
  /** Title for the widget */
  title?: string;
  /** Initial preset to load */
  initialPreset?: string;
}

// Grid size presets
const GRID_SIZES = [
  { label: '8×8', width: 8, height: 8 },
  { label: '16×16', width: 16, height: 16 },
  { label: '24×24', width: 24, height: 24 },
  { label: '32×24', width: 32, height: 24 },
  { label: '48×36', width: 48, height: 36 },
  { label: '64×48', width: 64, height: 48 },
  { label: '80×60', width: 80, height: 60 },
  { label: '128×96', width: 128, height: 96 },
];

type Grid = boolean[][];

type PatternCategory = 'basic' | 'spaceship' | 'oscillator' | 'still' | 'methuselah' | 'gun';

interface PatternDef {
  name: string;
  pattern: number[][];
  description: string;
  category: PatternCategory;
  minWidth: number;
  minHeight: number;
}

/**
 * Parse an ASCII pattern into coordinate array.
 * Uses 'O' or 'o' for alive cells, any other character for dead cells.
 * Whitespace-only lines at start/end are trimmed.
 */
function parseAscii(ascii: string): number[][] {
  const lines = ascii.split('\n');
  // Find first and last non-empty lines
  let start = 0;
  let end = lines.length - 1;
  while (start < lines.length && lines[start]?.trim() === '') start++;
  while (end >= 0 && lines[end]?.trim() === '') end--;
  
  const coords: number[][] = [];
  for (let row = start; row <= end; row++) {
    const line = lines[row] ?? '';
    for (let col = 0; col < line.length; col++) {
      if (line[col] === 'O' || line[col] === 'o') {
        coords.push([row - start, col]);
      }
    }
  }
  return coords;
}

/** Calculate minimum grid size from pattern coordinates (pattern size + 4 cells padding) */
function getPatternSize(pattern: number[][]): { minWidth: number; minHeight: number } {
  if (pattern.length === 0) return { minWidth: 8, minHeight: 8 };
  const maxRow = Math.max(...pattern.map(p => p[0] ?? 0));
  const maxCol = Math.max(...pattern.map(p => p[1] ?? 0));
  return { 
    minWidth: maxCol + 1 + 4, 
    minHeight: maxRow + 1 + 4 
  };
}

/** Create a pattern definition from ASCII art */
function pat(
  name: string,
  description: string,
  category: PatternCategory,
  ascii: string,
  minSizeOverride?: { minWidth: number; minHeight: number }
): PatternDef {
  const pattern = parseAscii(ascii);
  const size = minSizeOverride ?? getPatternSize(pattern);
  return { name, description, category, pattern, ...size };
}

// =============================================================================
// PATTERNS - Using ASCII art for readability
// Legend: O = alive cell, . = dead cell
// =============================================================================

const PATTERNS: Record<string, PatternDef> = {
  
  // ---------------------------------------------------------------------------
  // BASIC
  // ---------------------------------------------------------------------------
  empty: {
    name: 'Empty Grid',
    pattern: [],
    description: 'Start with a blank canvas',
    category: 'basic',
    minWidth: 8,
    minHeight: 8,
  },

  // ---------------------------------------------------------------------------
  // SPACESHIPS
  // ---------------------------------------------------------------------------
  glider: pat('Glider', 'The smallest spaceship - travels diagonally', 'spaceship', `
.O.
..O
OOO
`),

  lwss: pat('Lightweight Spaceship', 'Travels horizontally', 'spaceship', `
.O..O
O....
O...O
OOOO.
`),

  // ---------------------------------------------------------------------------
  // OSCILLATORS
  // ---------------------------------------------------------------------------
  blinker: pat('Blinker', 'Simplest oscillator (period 2)', 'oscillator', `
OOO
`),

  toad: pat('Toad', 'Period 2 oscillator', 'oscillator', `
.OOO
OOO.
`),

  beacon: pat('Beacon', 'Two blocks blinking (period 2)', 'oscillator', `
OO..
OO..
..OO
..OO
`),

  pulsar: pat('Pulsar', 'Beautiful period 3 oscillator', 'oscillator', `
..OOO...OOO..
.............
O....O.O....O
O....O.O....O
O....O.O....O
..OOO...OOO..
.............
..OOO...OOO..
O....O.O....O
O....O.O....O
O....O.O....O
.............
..OOO...OOO..
`, { minWidth: 21, minHeight: 21 }), // Expands during oscillation

  pentadecathlon: pat('Pentadecathlon', 'Period 15 oscillator', 'oscillator', `
.O.
.O.
O.O
.O.
.O.
.O.
.O.
O.O
.O.
.O.
`, { minWidth: 9, minHeight: 22 }), // Extends 3 cells on each end during oscillation

  // ---------------------------------------------------------------------------
  // STILL LIFES
  // ---------------------------------------------------------------------------
  block: pat('Block', 'Simplest still life', 'still', `
OO
OO
`),

  beehive: pat('Beehive', 'Common 6-cell still life', 'still', `
.OO.
O..O
.OO.
`),

  loaf: pat('Loaf', '7-cell still life', 'still', `
.OO.
O..O
.O.O
..O.
`),

  // ---------------------------------------------------------------------------
  // METHUSELAHS (long-lived patterns)
  // ---------------------------------------------------------------------------
  rPentomino: pat('R-pentomino', 'Chaotic - stabilizes after 1103 gens on an infinite grid', 'methuselah', `
.OO
OO.
.O.
`, { minWidth: 64, minHeight: 48 }),

  acorn: pat('Acorn', 'Evolves for 5206 gens on an infinite grid', 'methuselah', `
.O.....
...O...
OO..OOO
`, { minWidth: 128, minHeight: 96 }),

  diehard: pat('Diehard', 'Dies after exactly 130 generations', 'methuselah', `
......O.
OO......
.O...OOO
`, { minWidth: 48, minHeight: 36 }),

  // ---------------------------------------------------------------------------
  // GUNS
  // ---------------------------------------------------------------------------
  gliderGun: pat('Gosper Glider Gun', 'Produces gliders every 30 generations', 'gun', `
........................O...........
......................O.O...........
............OO......OO............OO
...........O...O....OO............OO
OO........O.....O...OO..............
OO........O...O.OO....O.O...........
..........O.....O.......O...........
...........O...O....................
............OO......................
`, { minWidth: 48, minHeight: 24 }),

};

// Random preset generators
interface RandomPresetDef {
  name: string;
  density: number;
  description: string;
  category: 'basic';
  minWidth: number;
  minHeight: number;
}

const RANDOM_PRESETS: Record<string, RandomPresetDef> = {
  sparse: { name: 'Random (Sparse)', density: 0.15, description: '~15% cells alive', category: 'basic', minWidth: 8, minHeight: 8 },
  medium: { name: 'Random (Medium)', density: 0.3, description: '~30% cells alive', category: 'basic', minWidth: 8, minHeight: 8 },
  dense: { name: 'Random (Dense)', density: 0.5, description: '~50% cells alive', category: 'basic', minWidth: 8, minHeight: 8 },
};

// Organized preset groups for the dropdown
const PRESET_GROUPS = [
  { label: 'Starting Points', presets: ['empty', 'sparse', 'medium', 'dense'] },
  { label: 'Spaceships', presets: ['glider', 'lwss'] },
  { label: 'Oscillators', presets: ['blinker', 'toad', 'beacon', 'pulsar', 'pentadecathlon'] },
  { label: 'Still Lifes', presets: ['block', 'beehive', 'loaf'] },
  { label: 'Methuselahs', presets: ['rPentomino', 'diehard', 'acorn'] },
  { label: 'Guns', presets: ['gliderGun'] },
];

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
  const firstRow = newGrid[0];
  if (!firstRow) return newGrid;
  for (const coord of pattern) {
    const y = coord[0] ?? 0;
    const x = coord[1] ?? 0;
    const ny = offsetY + y;
    const nx = offsetX + x;
    if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < firstRow.length) {
      const row = newGrid[ny];
      if (row) row[nx] = true;
    }
  }
  return newGrid;
}

function countNeighbors(grid: Grid, x: number, y: number): number {
  const height = grid.length;
  const firstRow = grid[0];
  if (!firstRow) return 0;
  const width = firstRow.length;
  let count = 0;
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const ny = (y + dy + height) % height; // Wrap around (toroidal)
      const nx = (x + dx + width) % width;
      const row = grid[ny];
      if (row && row[nx]) count++;
    }
  }
  return count;
}

function nextGeneration(grid: Grid): Grid {
  const height = grid.length;
  const firstRow = grid[0];
  if (!firstRow) return grid;
  const width = firstRow.length;
  
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

// Helper to get minimum grid size needed for a preset
function getMinGridSize(presetKey: string): { minWidth: number; minHeight: number } {
  const pattern = PATTERNS[presetKey];
  if (pattern) {
    return { minWidth: pattern.minWidth, minHeight: pattern.minHeight };
  }
  const randomPreset = RANDOM_PRESETS[presetKey];
  if (randomPreset) {
    return { minWidth: randomPreset.minWidth, minHeight: randomPreset.minHeight };
  }
  return { minWidth: 8, minHeight: 8 };
}

// Find smallest grid size preset that fits the required dimensions
function findSuitableGridSize(minWidth: number, minHeight: number): number {
  const index = GRID_SIZES.findIndex(s => s.width >= minWidth && s.height >= minHeight);
  return index >= 0 ? index : GRID_SIZES.length - 1; // Fall back to largest
}

export function GameOfLife({
  initialWidth = 32,
  initialHeight = 24,
  maxContainerWidth = 600,
  title = "Conway's Game of Life",
  initialPreset = 'glider',
}: GameOfLifeProps) {
  // Find initial grid size preset or use custom
  const initialSizeIndex = GRID_SIZES.findIndex(
    s => s.width === initialWidth && s.height === initialHeight
  );
  
  const [gridWidth, setGridWidth] = useState(initialWidth);
  const [gridHeight, setGridHeight] = useState(initialHeight);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(
    initialSizeIndex >= 0 ? initialSizeIndex : 3 // Default to 32×24
  );
  
  const [grid, setGrid] = useState<Grid>(() => {
    const emptyGrid = createEmptyGrid(initialWidth, initialHeight);
    const pattern = PATTERNS[initialPreset];
    if (pattern && pattern.pattern.length > 0) {
      const patternHeight = Math.max(...pattern.pattern.map(p => (p[0] ?? 0))) + 1;
      const patternWidth = Math.max(...pattern.pattern.map(p => (p[1] ?? 0))) + 1;
      const offsetX = Math.floor((initialWidth - patternWidth) / 2);
      const offsetY = Math.floor((initialHeight - patternHeight) / 2);
      return placePattern(emptyGrid, pattern.pattern, offsetX, offsetY);
    }
    return emptyGrid;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(10); // Generations per second
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(true);
  const [isExtinct, setIsExtinct] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasAutoStarted = useRef(false);
  
  // Calculate alive cell count
  const aliveCount = useMemo(() => {
    return grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  }, [grid]);
  
  // Detect extinction and stop simulation
  useEffect(() => {
    if (aliveCount === 0 && generation > 0) {
      setIsExtinct(true);
      setIsPlaying(false);
    }
  }, [aliveCount, generation]);
  
  // Auto-start when container scrolls into view (once only)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasAutoStarted.current) {
          hasAutoStarted.current = true;
          setIsPlaying(true);
        }
      },
      { threshold: 0 } // Trigger when top edge enters viewport
    );
    
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  // Step function
  const step = useCallback(() => {
    if (isExtinct) return; // Don't step if extinct
    setGrid(g => {
      const next = nextGeneration(g);
      return next;
    });
    setGeneration(g => g + 1);
  }, [isExtinct]);
  
  // Play/pause effect
  useEffect(() => {
    if (isPlaying && !isExtinct) {
      const interval = 1000 / speed;
      intervalRef.current = window.setInterval(step, interval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isPlaying, isExtinct, speed, step]);
  
  // Load preset with auto-resize
  const loadPreset = useCallback((presetKey: string, forceWidth?: number, forceHeight?: number) => {
    setIsPlaying(false);
    setGeneration(0);
    setIsExtinct(false);
    setSelectedPreset(presetKey);
    
    // Determine grid dimensions - auto-resize if needed
    let w = forceWidth ?? gridWidth;
    let h = forceHeight ?? gridHeight;
    
    if (forceWidth === undefined && forceHeight === undefined) {
      // Check if current grid is large enough
      const { minWidth, minHeight } = getMinGridSize(presetKey);
      if (w < minWidth || h < minHeight) {
        const newSizeIndex = findSuitableGridSize(minWidth, minHeight);
        const newSize = GRID_SIZES[newSizeIndex];
        if (newSize) {
          w = newSize.width;
          h = newSize.height;
          setGridWidth(w);
          setGridHeight(h);
          setSelectedSizeIndex(newSizeIndex);
        }
      }
    }
    
    if (presetKey in RANDOM_PRESETS) {
      const preset = RANDOM_PRESETS[presetKey];
      if (preset) {
        setGrid(createRandomGrid(w, h, preset.density));
      }
    } else if (presetKey in PATTERNS) {
      const pattern = PATTERNS[presetKey];
      const emptyGrid = createEmptyGrid(w, h);
      if (!pattern || pattern.pattern.length === 0) {
        setGrid(emptyGrid);
      } else {
        // Center the pattern
        const patternHeight = Math.max(...pattern.pattern.map(p => (p[0] ?? 0))) + 1;
        const patternWidth = Math.max(...pattern.pattern.map(p => (p[1] ?? 0))) + 1;
        const offsetX = Math.floor((w - patternWidth) / 2);
        const offsetY = Math.floor((h - patternHeight) / 2);
        setGrid(placePattern(emptyGrid, pattern.pattern, offsetX, offsetY));
      }
    }
  }, [gridWidth, gridHeight]);
  
  // Handle preset change from dropdown
  const handlePresetChange = useCallback((e: JSX.TargetedEvent<HTMLSelectElement>) => {
    const presetKey = (e.target as HTMLSelectElement).value;
    loadPreset(presetKey);
  }, [loadPreset]);
  
  // Handle grid size change
  const handleSizeChange = useCallback((e: JSX.TargetedEvent<HTMLSelectElement>) => {
    const index = parseInt((e.target as HTMLSelectElement).value, 10);
    const size = GRID_SIZES[index];
    if (size) {
      setSelectedSizeIndex(index);
      setGridWidth(size.width);
      setGridHeight(size.height);
      setIsPlaying(false);
      setGeneration(0);
      setIsExtinct(false);
      // Reload the current preset with new dimensions
      loadPreset(selectedPreset, size.width, size.height);
    }
  }, [selectedPreset, loadPreset]);
  
  // Cell toggle handlers
  const handleCellMouseDown = useCallback((x: number, y: number) => {
    setIsDragging(true);
    setIsExtinct(false); // Clear extinction on manual edit
    const row = grid[y];
    const newValue = row ? !row[x] : true;
    setDragValue(newValue);
    setGrid(g => {
      const newGrid = g.map(r => [...r]);
      const targetRow = newGrid[y];
      if (targetRow) targetRow[x] = newValue;
      return newGrid;
    });
  }, [grid]);
  
  const handleCellMouseEnter = useCallback((x: number, y: number) => {
    if (isDragging) {
      setGrid(g => {
        const newGrid = g.map(r => [...r]);
        const targetRow = newGrid[y];
        if (targetRow) targetRow[x] = dragValue;
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
  
  // Get preset info for display
  const getPresetInfo = (key: string): { name: string; description: string } => {
    if (key in PATTERNS) {
      const p = PATTERNS[key];
      if (p) return { name: p.name, description: p.description };
    }
    if (key in RANDOM_PRESETS) {
      const r = RANDOM_PRESETS[key];
      if (r) return { name: r.name, description: r.description };
    }
    return { name: key, description: '' };
  };
  
  const currentPresetInfo = getPresetInfo(selectedPreset);
  
  const styles = useStyles();
  
  return (
    <div 
      ref={containerRef}
      className={styles.container}
      onMouseLeave={() => setIsDragging(false)}
    >
      {title && <div className={styles.title}>{title}</div>}
        <div className={styles.controls}>
          <div className={styles.selectGroup}>
            {/* Preset selector with custom styling */}
            <div className={styles.selectWrapper} title={currentPresetInfo.description}>
              {/* Sizer: renders all options invisibly to establish max width */}
              <div className={styles.selectSizer} aria-hidden="true">
                {PRESET_GROUPS.flatMap(group => 
                  group.presets.map(key => {
                    const info = getPresetInfo(key);
                    return <span key={key}>{info.name}</span>;
                  })
                )}
              </div>
              {/* Visible facade showing current value */}
              <div className={styles.selectFacade}>
                <span className={styles.selectText}>{currentPresetInfo.name}</span>
                <svg className={styles.selectChevron} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1L5 5L9 1"/>
                </svg>
              </div>
              {/* Invisible native select for accessibility & mobile */}
              <select
                value={selectedPreset}
                onChange={handlePresetChange}
                className={styles.selectNative}
              >
                {PRESET_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.presets.map(key => {
                      const info = getPresetInfo(key);
                      return (
                        <option key={key} value={key}>
                          {info.name}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Size selector with custom styling */}
            <div className={styles.selectWrapper}>
              {/* Sizer: renders all options invisibly to establish max width */}
              <div className={styles.selectSizer} aria-hidden="true">
                {GRID_SIZES.map((size) => (
                  <span key={size.label}>{size.label}</span>
                ))}
              </div>
              {/* Visible facade showing current value */}
              <div className={styles.selectFacade}>
                <span className={styles.selectText}>{GRID_SIZES[selectedSizeIndex]?.label}</span>
                <svg className={styles.selectChevron} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1L5 5L9 1"/>
                </svg>
              </div>
              {/* Invisible native select for accessibility & mobile */}
              <select
                value={String(selectedSizeIndex)}
                onChange={handleSizeChange}
                className={styles.selectNative}
              >
                {GRID_SIZES.map((size, index) => (
                  <option key={size.label} value={String(index)}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Wrap-unit: playback controls + speed */}
          <div className={styles.playbackGroup}>
            <div className={styles.buttons}>
              <button
                className={mergeClasses(styles.btn, isPlaying && styles.btnActive)}
                onClick={() => !isExtinct && setIsPlaying(!isPlaying)}
                disabled={isExtinct}
                title={isExtinct ? 'Extinct' : isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="5" height="16" rx="1" />
                    <rect x="14" y="4" width="5" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4l15 8-15 8V4z" />
                  </svg>
                )}
              </button>
              <button
                className={styles.btn}
                onClick={step}
                disabled={isPlaying || isExtinct}
                title="Step"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4l10 8-10 8V4z" />
                  <rect x="16" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
              <button
                className={styles.btn}
                onClick={() => loadPreset(selectedPreset)}
                title="Reset"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
            
            <div className={styles.speed} title="Speed (generations/sec)">
              <span className={styles.speedValue}>{speed}<span className={styles.speedUnit}>/s</span></span>
              <div className={styles.speedButtons}>
                <button
                  type="button"
                  className={styles.speedBtn}
                  onClick={() => setSpeed(s => Math.min(60, s + 1))}
                  aria-label="Increase speed"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.speedBtn}
                  onClick={() => setSpeed(s => Math.max(1, s - 1))}
                  aria-label="Decrease speed"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.stats}>
            <span className={styles.stat} title="Generation: Number of simulation steps">
              <span className={styles.statLabel}>Gen</span>
              <span className={styles.statValue}>{generation}</span>
            </span>
            <span className={styles.stat} title="Population: Number of living cells">
              <span className={styles.statLabel}>Pop</span>
              <span className={styles.statValue}>{aliveCount}</span>
              {isExtinct && <span className={styles.extinct}>☠</span>}
            </span>
          </div>
        </div>
        
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
            maxWidth: `${gridWidth * 20 + gridWidth - 1 + 2}px`, // maxCellSize * cols + gaps + border
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={mergeClasses(styles.cell, cell && styles.cellAlive)}
                onMouseDown={() => handleCellMouseDown(x, y)}
                onMouseEnter={() => handleCellMouseEnter(x, y)}
              />
            ))
          )}
        </div>
    </div>
  );
}
