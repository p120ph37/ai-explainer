/**
 * Layer stack visualization - Pure CSS implementation
 */

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
  const orderedLayers = direction === 'up' ? [...layers].reverse() : layers;

  return (
    <div 
      className="diagram-container layer-stack"
      role="img"
      aria-label={ariaLabel || title || 'Layer stack diagram'}
    >
      {title && <div className="diagram-title">{title}</div>}
      <div className="layer-stack__layers">
        {orderedLayers.map((layer, i) => (
          <div key={layer.id} className="layer-stack__item">
            <div 
              className={`layer-stack__layer ${highlightLayer === layer.id ? 'layer-stack__layer--highlight' : ''}`}
              style={{ backgroundColor: layer.color || 'var(--color-surface)' }}
            >
              <span className="layer-stack__label">{layer.label}</span>
              {layer.sublabel && (
                <span className="layer-stack__sublabel">{layer.sublabel}</span>
              )}
            </div>
            {showArrows && i < orderedLayers.length - 1 && (
              <div className="layer-stack__arrow">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
