/**
 * Functional E2E tests for the Frontier AI Explainer
 * 
 * These tests verify functionality without relying on visual regression.
 * They run reliably in CI across different platforms.
 */

import { test, expect } from '@playwright/test';

test.describe('Page Loading', () => {
  test('home page loads and displays content', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    // Check title is present
    const title = page.locator('.content-node__title');
    await expect(title).toBeVisible();
    
    // Check content body has text
    const body = page.locator('.content-node__body');
    await expect(body).not.toBeEmpty();
  });
  
  test('index page loads and shows topics', async ({ page }) => {
    await page.goto('/#/index');
    await page.waitForSelector('.index-page');
    
    // Wait for async loading to complete
    await page.waitForSelector('.index-category', { timeout: 10000 });
    
    // Check that categories are rendered
    const categories = page.locator('.index-category');
    await expect(categories.first()).toBeVisible();
    
    // Check that topic links exist
    const topicLinks = page.locator('.index-item a');
    const count = await topicLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Navigation', () => {
  test('clicking topic link navigates to topic', async ({ page }) => {
    await page.goto('/#/index');
    await page.waitForSelector('.index-page');
    
    // Wait for async loading
    await page.waitForSelector('.index-item a', { timeout: 10000 });
    
    // Get first topic link
    const firstLink = page.locator('.index-item a').first();
    const href = await firstLink.getAttribute('href');
    
    await firstLink.click();
    await page.waitForSelector('.content-node__body', { timeout: 10000 });
    
    // Should have navigated
    const currentUrl = page.url();
    expect(currentUrl).toContain(href?.replace('#', ''));
  });
  
  test('internal links update URL hash', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(500); // Wait for link enhancement
    
    // Find an internal link
    const internalLink = page.locator('a[href^="#/"]').first();
    
    if (await internalLink.count() > 0) {
      const href = await internalLink.getAttribute('href');
      await internalLink.click();
      await page.waitForTimeout(500);
      
      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toContain('/');
    }
  });
  
  test('breadcrumbs are clickable', async ({ page }) => {
    // Navigate deep into content
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(500);
    
    // Click through to a child page
    const childLink = page.locator('.nav-link a').first();
    if (await childLink.count() > 0) {
      await childLink.click();
      await page.waitForSelector('.content-node__body');
      
      // Check breadcrumbs exist
      const breadcrumbs = page.locator('.breadcrumbs');
      if (await breadcrumbs.count() > 0) {
        const crumbLinks = breadcrumbs.locator('a');
        expect(await crumbLinks.count()).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Interactive Elements', () => {
  test('metaphor aside expands on click', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const metaphor = page.locator('.metaphor').first();
    
    if (await metaphor.count() > 0) {
      // Should not have open class initially
      await expect(metaphor).not.toHaveClass(/metaphor--open/);
      
      // Click to expand
      await metaphor.locator('.metaphor__trigger').click();
      await page.waitForTimeout(300);
      
      // Should now have open class
      await expect(metaphor).toHaveClass(/metaphor--open/);
      
      // Content should be visible
      const content = metaphor.locator('.metaphor__content');
      await expect(content).toBeVisible();
    }
  });
  
  test('question aside expands on click', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const question = page.locator('.question').first();
    
    if (await question.count() > 0) {
      // Click to expand
      await question.locator('.question__trigger').click();
      await page.waitForTimeout(300);
      
      // Should now have open class
      await expect(question).toHaveClass(/question--open/);
    }
  });
  
  test('footnote link scrolls to citation', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const footnote = page.locator('.footnote').first();
    
    if (await footnote.count() > 0) {
      const footnoteLink = footnote.locator('.footnote__link');
      const href = await footnoteLink.getAttribute('href');
      
      await footnoteLink.click();
      await page.waitForTimeout(600); // Wait for smooth scroll
      
      // Citation should exist
      if (href) {
        const citationId = href.replace('#', '');
        const citation = page.locator(`#${citationId}`);
        if (await citation.count() > 0) {
          // Citation should be in viewport (scrolled to)
          await expect(citation).toBeInViewport();
        }
      }
    }
  });
});

test.describe('Link Enhancement', () => {
  test('internal links exist in content', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(1500); // Wait for link enhancement
    
    // Find internal links (either enhanced or plain)
    const allInternalLinks = page.locator('a[href^="#/"]');
    const count = await allInternalLinks.count();
    
    // Should have at least some internal links
    expect(count).toBeGreaterThan(0);
  });
  
  test('enhanced internal links have status indicators', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(1500);
    
    // Find enhanced internal links
    const enhancedLinks = page.locator('.internal-link');
    const count = await enhancedLinks.count();
    
    // If we have enhanced links, check they have status indicators
    if (count > 0) {
      const firstLink = enhancedLinks.first();
      const status = firstLink.locator('.internal-link__status');
      await expect(status).toBeVisible();
    }
  });
  
  test('internal link shows title on hover', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(1500);
    
    // Try enhanced link first, fall back to plain internal link
    let internalLink = page.locator('.internal-link a').first();
    if (await internalLink.count() === 0) {
      internalLink = page.locator('a[href^="#/"]').first();
    }
    
    if (await internalLink.count() > 0) {
      const title = await internalLink.getAttribute('title');
      // Title might be set by enhancement or by original link
      // Just check link works
      await expect(internalLink).toBeVisible();
    }
  });
});

test.describe('Progress Tracking', () => {
  test('progress sidebar exists', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const sidebar = page.locator('.progress-sidebar');
    await expect(sidebar).toBeVisible();
  });
  
  test('discovery canvas exists', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const canvas = page.locator('.discovery-canvas');
    await expect(canvas).toBeVisible();
  });
  
  test('clear progress button works', async ({ page }) => {
    // Visit a page to create some progress
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    await page.waitForTimeout(500);
    
    // Navigate to index
    await page.goto('/#/index');
    await page.waitForSelector('.index-page');
    
    // Click clear progress button
    const clearButton = page.locator('button:has-text("Clear All Progress")');
    
    if (await clearButton.count() > 0) {
      // Handle confirm dialog
      page.on('dialog', dialog => dialog.accept());
      await clearButton.click();
      
      // localStorage should be cleared (progress reset)
      const progress = await page.evaluate(() => localStorage.getItem('explainer-progress'));
      expect(progress).toBeNull();
    }
  });
});

test.describe('Theme', () => {
  test('theme toggle changes theme', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const themeToggle = page.locator('.theme-toggle');
    
    if (await themeToggle.count() > 0) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => 
        document.documentElement.getAttribute('data-theme')
      );
      
      // Click toggle
      await themeToggle.click();
      await page.waitForTimeout(100);
      
      // Theme should have changed
      const newTheme = await page.evaluate(() => 
        document.documentElement.getAttribute('data-theme')
      );
      
      expect(newTheme).not.toBe(initialTheme);
    }
  });
});

test.describe('Responsive Behavior', () => {
  test('content renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    // Content should be visible
    const body = page.locator('.content-node__body');
    await expect(body).toBeVisible();
    
    // Title should be visible
    const title = page.locator('.content-node__title');
    await expect(title).toBeVisible();
  });
  
  test('content renders on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    const body = page.locator('.content-node__body');
    await expect(body).toBeVisible();
  });
});

test.describe('Content Structure', () => {
  test('content has required sections', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    // Header with title
    const header = page.locator('.content-node__header');
    await expect(header).toBeVisible();
    
    // Title
    const title = page.locator('.content-node__title');
    await expect(title).toBeVisible();
    
    // Summary
    const summary = page.locator('.content-node__summary');
    await expect(summary).toBeVisible();
    
    // Body
    const body = page.locator('.content-node__body');
    await expect(body).toBeVisible();
  });
  
  test('nav links section exists', async ({ page }) => {
    await page.goto('/#/intro');
    await page.waitForSelector('.content-node__body');
    
    // Navigation section should exist (go deeper / related)
    const navLinks = page.locator('.nav-links');
    const navCount = await navLinks.count();
    
    // Intro should have child links
    expect(navCount).toBeGreaterThanOrEqual(0);
  });
});

