interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  padding?: "default" | "compact" | "none";
}

export function Card({
  children,
  onClick,
  style,
  className = "",
  padding = "default",
}: CardProps) {
  const cls = [
    "card",
    padding !== "none" && `card--${padding}`,
    onClick && "card--clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button className={cls} style={style} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
