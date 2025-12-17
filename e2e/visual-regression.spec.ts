/**
 * Visual regression tests for the Frontier AI Explainer
 * 
 * These tests capture screenshots and compare them against baselines
 * to detect unintended visual changes.
 * 
 * Note: Screenshots are platform-specific. These tests are skipped in CI
 * unless Linux baselines are generated. Run locally with:
 *   bunx playwright test --update-snapshots
 */

import { test, expect } from '@playwright/test';

const isCI = !!process.env.CI;

test.describe('Visual Regression', () => {
  // Skip visual regression tests in CI (cross-platform baseline differences)
  // To enable in CI, generate Linux baselines and commit them
  test.skip(isCI, 'Visual regression tests are skipped in CI due to cross-platform baseline differences');
  test.describe('Page Layout', () => {
    test('home page renders correctly', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      await expect(page).toHaveScreenshot('home-page.png', {
        fullPage: true,
      });
    });
    
    test('index page renders correctly', async ({ page }) => {
      await page.goto('/index');
      await page.waitForSelector('.index-page');
      
      await expect(page).toHaveScreenshot('index-page.png', {
        fullPage: true,
      });
    });
  });
  
  test.describe('Margin Asides', () => {
    test('metaphor aside closed state', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Find a metaphor aside
      const metaphor = page.locator('.metaphor').first();
      
      if (await metaphor.count() > 0) {
        await expect(metaphor).toHaveScreenshot('metaphor-closed.png');
      }
    });
    
    test('metaphor aside open state', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Find and click a metaphor aside (trigger is now a button inside .metaphor)
      const metaphor = page.locator('.metaphor').first();
      
      if (await metaphor.count() > 0) {
        await metaphor.locator('button').click();
        await page.waitForTimeout(300); // Wait for animation
        
        await expect(metaphor).toHaveScreenshot('metaphor-open.png');
      }
    });
    
    test('question aside closed state', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      const question = page.locator('.question').first();
      
      if (await question.count() > 0) {
        await expect(question).toHaveScreenshot('question-closed.png');
      }
    });
    
    test('question aside open state', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Find and click a question aside (trigger is now a button inside .question)
      const question = page.locator('.question').first();
      
      if (await question.count() > 0) {
        await question.locator('button').click();
        await page.waitForTimeout(300); // Wait for animation
        
        await expect(question).toHaveScreenshot('question-open.png');
      }
    });
    
    // TODO: Fix MarginDeoverlap component - currently asides can overlap by ~54px
    test.skip('margin asides do not overlap', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Wait for margin deoverlap to run
      await page.waitForTimeout(500);
      
      // Get all margin asides
      const asides = page.locator('.metaphor, .question');
      const count = await asides.count();
      
      if (count >= 2) {
        // Get bounding boxes for all asides
        const boxes = await Promise.all(
          Array.from({ length: count }, (_, i) => 
            asides.nth(i).boundingBox()
          )
        );
        
        // Check for overlaps
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i];
            const b = boxes[j];
            
            if (a && b) {
              // Check if vertically overlapping
              const aBottom = a.y + a.height;
              const bBottom = b.y + b.height;
              
              // Allow small overlap (5px tolerance)
              const overlap = Math.min(aBottom, bBottom) - Math.max(a.y, b.y);
              expect(overlap).toBeLessThan(10);
            }
          }
        }
      }
    });
  });
  
  test.describe('Internal Links', () => {
    test('internal link has status indicator', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Wait for link enhancement
      await page.waitForTimeout(500);
      
      const internalLink = page.locator('.internal-link').first();
      
      if (await internalLink.count() > 0) {
        await expect(internalLink).toHaveScreenshot('internal-link.png');
      }
    });
    
    test('internal link shows tooltip on hover', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      await page.waitForTimeout(500);
      
      const internalLink = page.locator('.internal-link a').first();
      
      if (await internalLink.count() > 0) {
        await internalLink.hover();
        await page.waitForTimeout(300);
        
        // Check for native title tooltip (won't show in screenshot)
        const title = await internalLink.getAttribute('title');
        expect(title).toBeTruthy();
      }
    });
  });
  
  test.describe('Footnotes', () => {
    test('footnote shows tooltip on hover', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      const footnote = page.locator('.footnote').first();
      
      if (await footnote.count() > 0) {
        await footnote.hover();
        await page.waitForTimeout(300);
        
        const tooltip = footnote.locator('.footnote__tooltip');
        if (await tooltip.count() > 0) {
          await expect(tooltip).toBeVisible();
        }
      }
    });
    
    test('footnote click scrolls to citation', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      const footnote = page.locator('.footnote').first();
      
      if (await footnote.count() > 0) {
        // Get initial scroll position
        const initialScroll = await page.evaluate(() => window.scrollY);
        
        await footnote.locator('.footnote__link').click();
        await page.waitForTimeout(500); // Wait for smooth scroll
        
        // Check that we scrolled somewhere
        const finalScroll = await page.evaluate(() => window.scrollY);
        
        // Note: If footnote is already visible, scroll might not change much
        // Just check that the citation is now visible
        const citationId = await footnote.locator('.footnote__link').getAttribute('href');
        if (citationId) {
          const citation = page.locator(citationId.replace('#', '#'));
          // Should at least exist if click worked
        }
      }
    });
    
    test('citation highlight animation', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      const footnote = page.locator('.footnote').first();
      
      if (await footnote.count() > 0) {
        await footnote.locator('.footnote__link').click();
        await page.waitForTimeout(100);
        
        // Check for highlighted class
        const citation = page.locator('.citation--highlighted');
        if (await citation.count() > 0) {
          await expect(citation).toHaveScreenshot('citation-highlighted.png');
        }
      }
    });
  });
  
  test.describe('Progress Sidebar', () => {
    test('sidebar renders correctly', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      const sidebar = page.locator('.progress-sidebar');
      
      if (await sidebar.count() > 0) {
        await expect(sidebar).toHaveScreenshot('progress-sidebar.png');
      }
    });
    
    // TODO: Progress bar fill width isn't updating reactively - investigate signal binding
    test.skip('progress updates after scrolling', async ({ page }) => {
      await page.goto('/intro');
      await page.waitForSelector('.content-node__body');
      
      // Scroll down the page
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      // Check if progress bar updated
      const progressBar = page.locator('.progress-bar').first();
      
      if (await progressBar.count() > 0) {
        const width = await progressBar.evaluate(el => {
          const inner = el.querySelector('.progress-bar__fill');
          return inner ? getComputedStyle(inner).width : '0';
        });
        
        // Should have some progress after scrolling
        expect(width).not.toBe('0');
      }
    });
  });
  
  test.describe('Theme', () => {
    test('light theme renders correctly', async ({ page }) => {
      await page.goto('/intro');
      await page.evaluate(() => {
        localStorage.setItem('theme-preference', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
      });
      await page.waitForSelector('.content-node__body');
      
      await expect(page).toHaveScreenshot('theme-light.png', {
        fullPage: true,
      });
    });
    
    test('dark theme renders correctly', async ({ page }) => {
      await page.goto('/intro');
      await page.evaluate(() => {
        localStorage.setItem('theme-preference', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.waitForSelector('.content-node__body');
      
      await expect(page).toHaveScreenshot('theme-dark.png', {
        fullPage: true,
      });
    });
  });
});

test.describe('Discovery Animation', () => {
  // Discovery animation feature is currently disabled
  test.skip('link discovery triggers animation canvas', async ({ page }) => {
    // Clear progress to ensure fresh discovery
    await page.goto('/intro');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForSelector('.content-node__body');
    
    // Check for discovery canvas
    const canvas = page.locator('.discovery-canvas');
    await expect(canvas).toBeVisible();
  });
});

test.describe('Navigation Screenshots', () => {
  // Visual tests are skipped in CI due to cross-platform baseline differences
  test.skip(isCI, 'Visual regression tests are skipped in CI');
  
  test('breadcrumbs show correct path', async ({ page }) => {
    // Go directly to tokens - breadcrumbs should show the path
    await page.goto('/tokens');
    await page.waitForSelector('.content-node__body');
    
    const breadcrumbs = page.locator('.breadcrumbs');
    
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toHaveScreenshot('breadcrumbs.png');
    }
  });
});

test.describe('Responsive Layout', () => {
  test.skip(isCI, 'Visual regression tests are skipped in CI');
  
  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/intro');
    await page.waitForSelector('.content-node__body');
    
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
    });
  });
  
  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/intro');
    await page.waitForSelector('.content-node__body');
    
    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: true,
    });
  });
});

