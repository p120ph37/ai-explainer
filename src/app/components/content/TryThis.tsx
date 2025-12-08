/**
 * Try This block component
 * 
 * Provides actionable experiments for the user.
 */

import type { TryThisProps } from '../../../content/_types.ts';

export function TryThis({ children }: TryThisProps) {
  return (
    <aside className="try-this">
      <span className="try-this__label">🧪 Try This</span>
      <div className="try-this__content">
        {children}
      </div>
    </aside>
  );
}

