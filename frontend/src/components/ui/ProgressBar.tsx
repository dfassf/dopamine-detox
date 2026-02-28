interface ProgressBarProps {
  percent: number;
  height?: number;
}

export function ProgressBar({ percent, height = 6 }: ProgressBarProps) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className="progress-bar__fill"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
