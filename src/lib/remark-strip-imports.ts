/**
 * Remark plugin to strip import statements from MDX
 * 
 * Used during SSR to remove imports that would fail to resolve.
 * Components are provided via useMDXComponents instead.
 */

import type { Root } from 'mdast';

export default function remarkStripImports() {
  return (tree: Root) => {
    // Filter out import nodes
    tree.children = tree.children.filter((node) => {
      // MDX imports are represented as mdxjsEsm nodes
      if (node.type === 'mdxjsEsm') {
        const value = (node as any).value || '';
        // Keep non-import ESM (like exports), remove imports
        return !value.trim().startsWith('import ');
      }
      return true;
    });
    
    return tree;
  };
}

