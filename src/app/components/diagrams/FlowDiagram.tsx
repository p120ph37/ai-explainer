/**
 * Flow diagram - Pure CSS implementation
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
  stepsHorizontal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2xs)',
    flexWrap: 'wrap',
  },
  stepsVertical: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-2xs)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  itemVertical: {
    flexDirection: 'column',
  },
  step: {
    paddingTop: 'var(--space-sm)',
    paddingBottom: 'var(--space-sm)',
    paddingLeft: 'var(--space-md)',
    paddingRight: 'var(--space-md)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    minWidth: '80px',
    transitionProperty: 'all',
    transitionDuration: 'var(--duration-fast)',
    transitionTimingFunction: 'var(--ease-out)',
  },
  stepHighlight: {
    borderColor: 'var(--color-accent)',
    borderWidth: '2px',
  },
  number: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    borderRadius: '50%',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    marginBottom: 'var(--space-2xs)',
  },
  icon: {
    display: 'block',
    fontSize: '1.5em',
    marginBottom: 'var(--space-2xs)',
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
    paddingLeft: 'var(--space-xs)',
    paddingRight: 'var(--space-xs)',
  },
  arrowVertical: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 'var(--space-3xs)',
    paddingBottom: 'var(--space-3xs)',
  },
});

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
  const styles = useStyles();
  const isVertical = direction === 'vertical';
  
  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={ariaLabel || title || 'Flow diagram'}
    >
      {title && <div className={styles.title}>{title}</div>}
      <div className={isVertical ? styles.stepsVertical : styles.stepsHorizontal}>
        {steps.map((step, i) => (
          <div key={step.id} className={mergeClasses(styles.item, isVertical && styles.itemVertical)}>
            <div 
              className={mergeClasses(styles.step, highlightStep === step.id && styles.stepHighlight)}
              style={{ backgroundColor: step.color || 'var(--color-surface)' }}
            >
              {showNumbers && (
                <span className={styles.number}>{i + 1}</span>
              )}
              {step.icon && (
                <span className={styles.icon}>{step.icon}</span>
              )}
              <span className={styles.label}>{step.label}</span>
              {step.sublabel && (
                <span className={styles.sublabel}>{step.sublabel}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={mergeClasses(styles.arrow, isVertical && styles.arrowVertical)}>
                {isVertical ? '↓' : '→'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
