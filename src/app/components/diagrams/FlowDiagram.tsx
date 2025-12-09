/**
 * Flow diagram - Pure CSS implementation
 */

interface FlowStep {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
}

interface FlowDiagramProps {
  steps: FlowStep[];
  direction?: 'horizontal' | 'vertical';
  title?: string;
  ariaLabel?: string;
  highlightStep?: string;
  showNumbers?: boolean;
}

export function FlowDiagram({
  steps,
  direction = 'horizontal',
  title,
  ariaLabel,
  highlightStep,
  showNumbers = false,
}: FlowDiagramProps) {
  return (
    <div 
      className={`diagram-container flow-diagram flow-diagram--${direction}`}
      role="img"
      aria-label={ariaLabel || title || 'Flow diagram'}
    >
      {title && <div className="diagram-title">{title}</div>}
      <div className={`flow-diagram__steps flow-diagram__steps--${direction}`}>
        {steps.map((step, i) => (
          <div key={step.id} className="flow-diagram__item">
            <div 
              className={`flow-diagram__step ${highlightStep === step.id ? 'flow-diagram__step--highlight' : ''}`}
              style={{ backgroundColor: step.color || 'var(--color-surface)' }}
            >
              {showNumbers && (
                <span className="flow-diagram__number">{i + 1}</span>
              )}
              {step.icon && (
                <span className="flow-diagram__icon">{step.icon}</span>
              )}
              <span className="flow-diagram__label">{step.label}</span>
              {step.sublabel && (
                <span className="flow-diagram__sublabel">{step.sublabel}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flow-diagram__arrow">
                {direction === 'horizontal' ? '→' : '↓'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
