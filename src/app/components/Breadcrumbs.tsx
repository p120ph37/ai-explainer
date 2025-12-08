/**
 * Breadcrumbs component
 * 
 * Shows the path through the concept hierarchy.
 */

import { navigateTo } from '../router.ts';
import { getNodeMeta } from '../../content/_registry.ts';

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
                href={`#/${path.slice(0, index + 1).join('/')}`}
                className="breadcrumbs__link"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate by truncating path to this point
                  const newPath = path.slice(0, index + 1);
                  window.history.pushState(
                    { nodeId, path: newPath },
                    '',
                    `#/${newPath.join('/')}`
                  );
                  // Force route update would go here
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

