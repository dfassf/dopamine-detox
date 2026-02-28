interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = "primary",
  loading,
  loadingText,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}
