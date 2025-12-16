/**
 * Breadcrumbs component
 * 
 * Shows the path through the concept hierarchy.
 */

import { navigateTo, currentRoute } from '../router.ts';
import { getNodeMeta } from '../../lib/content.ts';

interface BreadcrumbsProps {
  path: string[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  if (path.length <= 1) {
    return null;
  }
  
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {path.map((nodeId, index) => {
        const meta = getNodeMeta(nodeId);
        const isLast = index === path.length - 1;
        const title = meta?.title || nodeId;
        
        return (
          <>
            {index > 0 && (
              <span className="breadcrumbs__separator" aria-hidden="true">
                →
              </span>
            )}
            {isLast ? (
              <span className="breadcrumbs__current" aria-current="page">
                {title}
              </span>
            ) : (
              <a 
                href={`/${nodeId}`}
                className="breadcrumbs__link"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to this node with truncated path
                  const newPath = path.slice(0, index + 1);
                  currentRoute.value = { nodeId, path: newPath };
                  window.history.pushState(
                    { nodeId, path: newPath },
                    '',
                    `/${nodeId}`
                  );
                }}
              >
                {title}
              </a>
            )}
          </>
        );
      })}
    </nav>
  );
}
