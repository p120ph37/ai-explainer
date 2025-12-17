/**
 * Layer stack visualization - Pure CSS implementation
 */

import { makeStyles, mergeClasses } from '@griffel/react';

const useStyles = makeStyles({
  container: {
    width: '100%',
    marginBlockStart: 'var(--space-lg)',
    marginBlockEnd: 'var(--space-lg)',
    paddingTop: 'var(--space-md)',
    paddingBottom: 'var(--space-md)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
    textAlign: 'center',
    marginBottom: 'var(--space-md)',
  },
  layers: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  layer: {
    width: '80%',
    maxWidth: '300px',
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  layerHighlight: {
    borderColor: 'var(--color-accent)',
    borderWidth: '2px',
  },
  label: {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  sublabel: {
    display: 'block',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-3xs)',
  },
  arrow: {
    fontSize: '1.2em',
    color: 'var(--color-text-muted)',
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
  },
});

interface Layer {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
}

interface LayerStackProps {
  layers: Layer[];
  direction?: 'up' | 'down';
  showArrows?: boolean;
  title?: string;
  ariaLabel?: string;
  highlightLayer?: string;
}

export function LayerStack({
  layers,
  direction = 'up',
  showArrows = true,
  title,
  ariaLabel,
  highlightLayer,
}: LayerStackProps) {
  const styles = useStyles();
  const orderedLayers = direction === 'up' ? [...layers].reverse() : layers;

  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={ariaLabel || title || 'Layer stack diagram'}
    >
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.layers}>
        {orderedLayers.map((layer, i) => (
          <div key={layer.id} className={styles.item}>
            <div 
              className={mergeClasses(styles.layer, highlightLayer === layer.id && styles.layerHighlight)}
              style={{ backgroundColor: layer.color || 'var(--color-surface)' }}
            >
              <span className={styles.label}>{layer.label}</span>
              {layer.sublabel && (
                <span className={styles.sublabel}>{layer.sublabel}</span>
              )}
            </div>
            {showArrows && i < orderedLayers.length - 1 && (
              <div className={styles.arrow}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
