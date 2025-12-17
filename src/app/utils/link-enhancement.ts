/**
 * Pure utility functions for link enhancement
 * 
 * These functions handle the logic for:
 * - Detecting internal links
 * - Creating link wrapper structure
 * - Determining if a link should be enhanced
 */

import type { QuestStatus } from '@/app/progress.ts';

export interface LinkInfo {
  /** The href attribute value */
  href: string;
  /** Extracted node ID from the href */
  nodeId: string;
  /** Whether this is a valid internal link */
  isInternal: boolean;
}

export interface EnhancementConfig {
  /** CSS class for the wrapper element */
  wrapperClass: string;
  /** CSS class for the status indicator */
  statusClass: string;
  /** Status icon character */
  statusIcon: string;
  /** Accessible label for the status */
  statusLabel: string;
  /** Title tooltip text */
  titleText: string;
}

/**
 * Parse an href attribute to extract link information
 * Uses path-based URLs (/tokens, /intro, etc.)
 */
export function parseInternalLink(href: string | null): LinkInfo | null {
  if (!href) return null;
  
  // Only support path-based links (/nodeId)
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('.')) {
    return null;
  }
  
  const nodeId = href.slice(1).split('/')[0];
  
  if (!nodeId) return null;
  
  // Validate node ID format (alphanumeric with hyphens)
  if (!/^[a-z0-9-]+$/i.test(nodeId)) {
    return null;
  }
  
  return {
    href,
    nodeId,
    isInternal: true,
  };
}

/**
 * Check if an element should be enhanced
 * Returns false if already enhanced or wrapped
 */
export function shouldEnhanceLink(
  element: { 
    dataset?: { enhanced?: string };
    closest?: (selector: string) => Element | null;
  }
): boolean {
  // Already marked as enhanced
  if (element.dataset?.enhanced === 'true') {
    return false;
  }
  
  // Already wrapped in internal-link
  if (element.closest?.('.internal-link')) {
    return false;
  }
  
  return true;
}

/**
 * Generate enhancement configuration for a link
 */
export function getEnhancementConfig(
  nodeId: string,
  status: QuestStatus,
  statusInfo: { icon: string; label: string; className: string },
  title: string
): EnhancementConfig {
  return {
    wrapperClass: `internal-link internal-link--${status}`,
    statusClass: 'internal-link__status',
    statusIcon: statusInfo.icon,
    statusLabel: statusInfo.label,
    titleText: title,
  };
}

/**
 * Calculate exploration percentage from seen and total heights
 */
export function calculateExplorationPercent(
  totalCountableHeight: number,
  totalSeenHeight: number
): number {
  if (totalCountableHeight === 0) return 100;
  
  const percent = Math.round((totalSeenHeight / totalCountableHeight) * 100);
  return Math.min(100, Math.max(0, percent));
}

/**
 * Determine how much of a section has been seen based on viewport
 */
export function calculateSectionVisibility(
  sectionTop: number,
  sectionHeight: number,
  viewportBottom: number
): number {
  const sectionBottom = sectionTop + sectionHeight;
  
  if (viewportBottom >= sectionBottom) {
    // Fully seen
    return sectionHeight;
  } else if (viewportBottom > sectionTop) {
    // Partially seen
    return Math.max(0, viewportBottom - sectionTop);
  }
  
  // Not yet seen
  return 0;
}

/**
 * Check if an element is in the viewport
 */
export function isElementInViewport(
  rect: { top: number; bottom: number; height: number; width: number },
  viewportHeight: number
): boolean {
  return (
    rect.top < viewportHeight && 
    rect.bottom > 0 && 
    rect.height > 0 &&
    rect.width > 0
  );
}

/**
 * Parse node ID from href
 * Uses path-based URLs (/tokens, /intro, etc.)
 */
export function extractNodeIdFromHref(href: string): string | null {
  if (!href) return null;
  
  // Only support path-based format (/nodeId)
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('.')) {
    return null;
  }
  
  return href.slice(1).split('/')[0] || null;
}

