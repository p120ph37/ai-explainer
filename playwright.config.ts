/**
 * Playwright configuration for visual regression testing
 * 
 * In CI: Uses preview server (port 4000) against built dist/
 * Locally: Uses dev server (port 3000) with HMR
 */

import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: isCI,
  
  // Retry on CI only
  retries: isCI ? 2 : 0,
  
  // Opt out of parallel tests on CI for stability
  workers: isCI ? 1 : undefined,
  
  // Reporter
  reporter: isCI 
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'never' }], ['list']],
  
  // Shared settings for all projects
  use: {
    // Base URL - CI uses preview server, local uses dev server
    baseURL: isCI ? 'http://localhost:4000' : 'http://localhost:3000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot settings
    screenshot: 'only-on-failure',
  },

  // Configure projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local server before tests
  webServer: {
    command: isCI ? 'bun run preview' : 'bun run dev',
    url: isCI ? 'http://localhost:4000' : 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 30000,
  },
  
  // Snapshot settings for visual regression
  expect: {
    toHaveScreenshot: {
      // Threshold for pixel difference
      maxDiffPixelRatio: 0.05,
      // Animation stability
      animations: 'disabled',
    },
  },
  
  // Output directories
  outputDir: 'test-results',
});
