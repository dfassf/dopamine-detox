interface EmptyStateProps {
  emoji?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {emoji && <div className="empty-state__emoji">{emoji}</div>}
      <p className="empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <button
          className="btn btn-primary"
          style={{ maxWidth: 240 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
