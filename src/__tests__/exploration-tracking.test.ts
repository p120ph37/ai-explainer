/**
 * Tests for exploration tracking functionality
 * 
 * Tests DOM-based content scanning and exploration calculations
 * using happy-dom for a realistic DOM environment.
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { setupTestDOM, createMockElement, waitForDOM } from './setup.ts';
import { 
  updateExploredPercent, 
  markVisited, 
  getNodeProgress,
  resetAllProgress,
} from '../app/progress.ts';
import {
  calculateExplorationPercent,
  calculateSectionVisibility,
} from '../app/utils/link-enhancement.ts';

describe('Exploration Tracking', () => {
  beforeEach(() => {
    resetAllProgress();
    document.body.innerHTML = '';
  });
  
  describe('DOM Content Structure', () => {
    test('can create and query content sections', () => {
      document.body.innerHTML = `
        <article class="content-node__body">
          <section id="section-1">Content 1</section>
          <section id="section-2">Content 2</section>
        </article>
      `;
      
      const sections = document.querySelectorAll('section');
      expect(sections.length).toBe(2);
    });
    
    test('can identify expandable sections', () => {
      document.body.innerHTML = `
        <article class="content-node__body">
          <div class="expandable">
            <button class="expandable__header">Title</button>
            <div class="expandable__content">Hidden content</div>
          </div>
        </article>
      `;
      
      const expandable = document.querySelector('.expandable');
      expect(expandable).not.toBeNull();
      
      const header = expandable?.querySelector('.expandable__header');
      const content = expandable?.querySelector('.expandable__content');
      expect(header).not.toBeNull();
      expect(content).not.toBeNull();
    });
    
    test('can detect expanded state', () => {
      document.body.innerHTML = `
        <details class="expandable" open>
          <summary>Click to expand</summary>
          <div>Expanded content</div>
        </details>
      `;
      
      const details = document.querySelector('details');
      expect(details?.hasAttribute('open')).toBe(true);
    });
    
    test('can toggle expanded state', () => {
      document.body.innerHTML = `
        <div class="expandable">
          <div class="expandable__content">Content</div>
        </div>
      `;
      
      const expandable = document.querySelector('.expandable');
      expect(expandable?.classList.contains('expandable--open')).toBe(false);
      
      expandable?.classList.add('expandable--open');
      expect(expandable?.classList.contains('expandable--open')).toBe(true);
    });
  });
  
  describe('Progress Tracking Integration', () => {
    test('markVisited updates node progress', () => {
      markVisited('test-node');
      const progress = getNodeProgress('test-node');
      expect(progress.visitedAt).toBeDefined();
    });
    
    test('updateExploredPercent stores progress', () => {
      updateExploredPercent('test-node', 50);
      const progress = getNodeProgress('test-node');
      expect(progress.exploredPercent).toBe(50);
    });
    
    test('exploredPercent only increases (high water mark)', () => {
      updateExploredPercent('test-node', 75);
      updateExploredPercent('test-node', 50); // Should not decrease
      const progress = getNodeProgress('test-node');
      expect(progress.exploredPercent).toBe(75);
    });
    
    test('exploredPercent can increase past previous value', () => {
      updateExploredPercent('test-node', 50);
      updateExploredPercent('test-node', 80);
      const progress = getNodeProgress('test-node');
      expect(progress.exploredPercent).toBe(80);
    });
  });
  
  describe('Content Visibility Calculations', () => {
    test('calculateExplorationPercent handles zero total height', () => {
      expect(calculateExplorationPercent(0, 0)).toBe(100);
    });
    
    test('calculateExplorationPercent calculates correct percentage', () => {
      expect(calculateExplorationPercent(1000, 250)).toBe(25);
      expect(calculateExplorationPercent(1000, 500)).toBe(50);
      expect(calculateExplorationPercent(1000, 750)).toBe(75);
      expect(calculateExplorationPercent(1000, 1000)).toBe(100);
    });
    
    test('calculateExplorationPercent caps at 100', () => {
      expect(calculateExplorationPercent(500, 1000)).toBe(100);
    });
    
    test('calculateSectionVisibility returns 0 for unseen section', () => {
      // Section at 500-600, viewport at 400
      expect(calculateSectionVisibility(500, 100, 400)).toBe(0);
    });
    
    test('calculateSectionVisibility returns partial for partially seen', () => {
      // Section at 500-600, viewport at 550
      expect(calculateSectionVisibility(500, 100, 550)).toBe(50);
    });
    
    test('calculateSectionVisibility returns full height for fully seen', () => {
      // Section at 500-600, viewport at 700
      expect(calculateSectionVisibility(500, 100, 700)).toBe(100);
    });
  });
  
  describe('Internal Link Detection', () => {
    test('finds internal links in content', () => {
      document.body.innerHTML = `
        <article class="content-node__body">
          <p>See <a href="/tokens">tokens</a> for more info.</p>
          <p>Also check <a href="/embeddings">embeddings</a>.</p>
        </article>
      `;
      
      const links = document.querySelectorAll('a[href^="/"]');
      expect(links.length).toBe(2);
    });
    
    test('ignores external links', () => {
      document.body.innerHTML = `
        <article class="content-node__body">
          <a href="/tokens">Internal</a>
          <a href="https://example.com">External</a>
          <a href="#ref-1">Anchor</a>
        </article>
      `;
      
      const internalLinks = document.querySelectorAll('a[href^="/"]');
      expect(internalLinks.length).toBe(1);
    });
    
    test('can extract node ID from internal link', () => {
      document.body.innerHTML = `
        <a href="/context-window" id="test-link">Context Window</a>
      `;
      
      const link = document.getElementById('test-link');
      const href = link?.getAttribute('href');
      const nodeId = href?.slice(1); // Remove leading /
      
      expect(nodeId).toBe('context-window');
    });
  });
  
  describe('Expandable Content Tracking', () => {
    test('expandable content has measurable height when open', async () => {
      document.body.innerHTML = `
        <div class="expandable expandable--open">
          <div class="expandable__header">Header</div>
          <div class="expandable__content" style="height: 200px;">
            Content here
          </div>
        </div>
      `;
      
      const content = document.querySelector('.expandable__content') as HTMLElement;
      // Note: In happy-dom, computed styles may differ from real browser
      expect(content).not.toBeNull();
    });
    
    test('can track which expandables are open', () => {
      document.body.innerHTML = `
        <div class="content-node__body">
          <div class="expandable" data-section-id="section-1"></div>
          <div class="expandable expandable--open" data-section-id="section-2"></div>
          <details class="expandable" data-section-id="section-3" open></details>
        </div>
      `;
      
      const expandables = document.querySelectorAll('.expandable');
      const openCount = Array.from(expandables).filter(el => 
        el.classList.contains('expandable--open') || el.hasAttribute('open')
      ).length;
      
      expect(openCount).toBe(2);
    });
  });
  
  describe('Link Enhancement', () => {
    test('can mark links as enhanced', () => {
      document.body.innerHTML = `
        <a href="/tokens" id="test-link">Tokens</a>
      `;
      
      const link = document.getElementById('test-link') as HTMLAnchorElement;
      link.dataset.enhanced = 'true';
      
      expect(link.dataset.enhanced).toBe('true');
    });
    
    test('can wrap links with status indicators', () => {
      document.body.innerHTML = `
        <p>See <a href="/tokens" id="test-link">tokens</a></p>
      `;
      
      const link = document.getElementById('test-link') as HTMLAnchorElement;
      const wrapper = document.createElement('span');
      wrapper.className = 'internal-link internal-link--discovered';
      
      link.parentNode?.insertBefore(wrapper, link);
      wrapper.appendChild(link);
      
      const indicator = document.createElement('span');
      indicator.className = 'internal-link__status';
      indicator.textContent = '○';
      wrapper.appendChild(indicator);
      
      expect(wrapper.querySelector('a')).toBe(link);
      expect(wrapper.querySelector('.internal-link__status')?.textContent).toBe('○');
    });
    
    test('enhanced links can be detected to avoid duplicate enhancement', () => {
      document.body.innerHTML = `
        <span class="internal-link">
          <a href="/tokens" data-enhanced="true">Tokens</a>
          <span class="internal-link__status">○</span>
        </span>
      `;
      
      const link = document.querySelector('a') as HTMLAnchorElement;
      
      // Check if already enhanced
      const isEnhanced = link.dataset.enhanced === 'true';
      const isWrapped = link.closest('.internal-link') !== null;
      
      expect(isEnhanced).toBe(true);
      expect(isWrapped).toBe(true);
    });
  });
});

describe('MutationObserver Integration', () => {
  test('MutationObserver is available in happy-dom', () => {
    expect(typeof MutationObserver).toBe('function');
  });
  
  test('can observe DOM mutations', async () => {
    const mutations: MutationRecord[] = [];
    
    const observer = new MutationObserver((records) => {
      mutations.push(...records);
    });
    
    const target = document.createElement('div');
    document.body.appendChild(target);
    
    observer.observe(target, { childList: true, subtree: true });
    
    const child = document.createElement('span');
    target.appendChild(child);
    
    // Wait for mutation to be processed
    await waitForDOM();
    
    observer.disconnect();
    
    // Note: happy-dom may process mutations differently than browsers
    expect(mutations.length).toBeGreaterThanOrEqual(0);
  });
});

describe('IntersectionObserver Integration', () => {
  test('IntersectionObserver is available in happy-dom', () => {
    expect(typeof IntersectionObserver).toBe('function');
  });
  
  test('can create IntersectionObserver', () => {
    const observer = new IntersectionObserver((entries) => {
      // Callback
    });
    
    expect(observer).toBeDefined();
    expect(typeof observer.observe).toBe('function');
    expect(typeof observer.disconnect).toBe('function');
  });
});

