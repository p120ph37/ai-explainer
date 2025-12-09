/**
 * Navigation links component
 * 
 * Shows links to child concepts (deeper) and related concepts (lateral).
 * Uses DiscoverableLink to trigger discovery animation when links become visible.
 */

import { navigateTo } from '../router.ts';
import { getNodeMeta } from '../../content/_registry.ts';
import { DiscoverableLink } from './DiscoverableLink.tsx';

interface NavLinksProps {
  children?: string[];
  related?: string[];
}

export function NavLinks({ children, related }: NavLinksProps) {
  const hasChildren = children && children.length > 0;
  const hasRelated = related && related.length > 0;
  
  if (!hasChildren && !hasRelated) {
    return null;
  }
  
  return (
    <nav className="nav-links">
      {hasChildren && (
        <div className="nav-links__section">
          <span className="nav-links__label">↓ Go Deeper</span>
          <ul className="nav-links__list">
            {children.map((nodeId) => {
              const meta = getNodeMeta(nodeId);
              return (
                <li key={nodeId}>
                  <DiscoverableLink nodeId={nodeId}>
                    <a 
                      href={`#/${nodeId}`}
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo(nodeId, { addToPath: true });
                      }}
                    >
                      {meta?.title || nodeId}
                    </a>
                  </DiscoverableLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {hasRelated && (
        <div className="nav-links__section">
          <span className="nav-links__label">↔ Related</span>
          <ul className="nav-links__list">
            {related.map((nodeId) => {
              const meta = getNodeMeta(nodeId);
              return (
                <li key={nodeId}>
                  <DiscoverableLink nodeId={nodeId}>
                    <a 
                      href={`#/${nodeId}`}
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo(nodeId);
                      }}
                    >
                      {meta?.title || nodeId}
                    </a>
                  </DiscoverableLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
