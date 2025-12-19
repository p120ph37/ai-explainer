/**
 * Type declarations for the virtual:content-modules module
 * Generated at build time by content-plugin
 */

declare module 'virtual:content-modules' {
  /** Map of node ID to lazy loader function */
  export const contentModules: Record<string, () => Promise<{
    default: (props: any) => any;
    meta?: {
      id: string;
      title: string;
      summary: string;
      order?: number;
      prerequisites?: string[];
      children?: string[];
      related?: string[];
      keywords?: string[];
    };
  }>>;
  
  /** List of all content IDs */
  export const contentIds: string[];
}

