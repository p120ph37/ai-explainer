/**
 * Type definitions for content nodes
 */

import type { ComponentType, JSX } from 'preact';

/**
 * Metadata for a content node
 */
export interface ContentMeta {
  /** Unique identifier, matches filename */
  id: string;
  
  /** Display title */
  title: string;
  
  /** One-sentence summary (the TLDR) */
  summary: string;
  
  /** Node IDs that must be understood before this one */
  prerequisites?: string[];
  
  /** Child nodes (deeper concepts) */
  children?: string[];
  
  /** Related nodes (lateral concepts) */
  related?: string[];
  
  /** Keywords for search */
  keywords?: string[];
}

/**
 * A content module (the export shape of each .tsx file)
 */
export interface ContentModule {
  default: ComponentType;
  meta: ContentMeta;
}

/**
 * Citation types with their display metadata
 */
export type CitationType = 'paper' | 'video' | 'docs' | 'article';

export interface CitationInfo {
  type: CitationType;
  title: string;
  url: string;
  authors?: string;
  source?: string;
  year?: number;
}

/**
 * Props for common content components
 */
export interface TermProps {
  id: string;
  children: JSX.Element | string;
}

export interface ExpandableProps {
  title: string;
  level?: 'standard' | 'advanced';
  defaultOpen?: boolean;
  children: JSX.Element | JSX.Element[];
}

export interface CitationProps extends CitationInfo {}

export interface RecognitionProps {
  children: JSX.Element | JSX.Element[];
}

export interface TryThisProps {
  children: JSX.Element | JSX.Element[];
}

export interface SourcesProps {
  children: JSX.Element | JSX.Element[];
}

