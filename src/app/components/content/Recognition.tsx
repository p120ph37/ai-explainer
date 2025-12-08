/**
 * Recognition block component
 * 
 * Connects concepts to the user's existing experience.
 */

import type { RecognitionProps } from '../../../content/_types.ts';

export function Recognition({ children }: RecognitionProps) {
  return (
    <aside className="recognition">
      <span className="recognition__label">💡 You've seen this</span>
      <div className="recognition__content">
        {children}
      </div>
    </aside>
  );
}

