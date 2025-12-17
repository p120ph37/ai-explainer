/**
 * MDX Provider with custom components
 * 
 * Uses @mdx-js/preact to provide custom component implementations.
 * Most importantly, wraps internal links in InternalLink for discovery.
 */

import { MDXProvider as BaseMDXProvider } from '@mdx-js/preact';
import type { ComponentChildren, JSX } from 'preact';
import { InternalLink } from '@/app/components/InternalLink.tsx';

// Custom anchor component that detects internal links
function CustomAnchor({ href, children, ...props }: JSX.HTMLAttributes<HTMLAnchorElement>) {
  // Check if this is an internal link (starts with / but not // or file paths)
  const isInternalLink = typeof href === 'string' && 
    href.startsWith('/') && 
    !href.startsWith('//') && 
    !href.includes('.');
  
  if (isInternalLink && typeof href === 'string') {
    // Extract node ID from href: /tokens -> tokens
    const nodeId = href.slice(1).split('/')[0];
    
    return (
      <InternalLink nodeId={nodeId} {...props}>
        {children}
      </InternalLink>
    );
  }
  
  // External link - open in new tab
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

// MDX component overrides
export const mdxComponents = {
  a: CustomAnchor,
};

interface MDXProviderProps {
  children: ComponentChildren;
}

export function MDXProvider({ children }: MDXProviderProps) {
  return (
    <BaseMDXProvider components={mdxComponents}>
      {children}
    </BaseMDXProvider>
  );
}
