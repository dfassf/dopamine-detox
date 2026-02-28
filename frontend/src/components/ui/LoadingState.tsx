interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "불러오는 중..." }: LoadingStateProps) {
  return <div className="loading-state">{text}</div>;
}
