/**
 * Placeholder for planned interactive toys/diagrams
 * 
 * Shows a visual indicator that an interactive element is planned here.
 */

interface DiagramPlaceholderProps {
  /** ID of the planned toy from the backlog */
  toyId: string;
  /** Human-readable title */
  title: string;
  /** Brief description of what will go here */
  description?: string;
  /** Icon to display */
  icon?: string;
}

export function DiagramPlaceholder({
  toyId,
  title,
  description,
  icon = '🔧',
}: DiagramPlaceholderProps) {
  return (
    <div className="diagram-placeholder" data-toy-id={toyId}>
      <div className="diagram-placeholder__icon">{icon}</div>
      <div className="diagram-placeholder__title">{title}</div>
      {description && (
        <div className="diagram-placeholder__description">{description}</div>
      )}
    </div>
  );
}

