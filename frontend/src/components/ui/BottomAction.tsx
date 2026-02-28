interface BottomActionProps {
  children: React.ReactNode;
}

export function BottomAction({ children }: BottomActionProps) {
  return <div className="bottom-action">{children}</div>;
}
