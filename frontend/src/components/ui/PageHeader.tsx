import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
  onBack?: true | (() => void);
  right?: React.ReactNode;
  small?: boolean;
  variant?: "app" | "auth";
}

const ChevronLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--gray-700)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export function PageHeader({ title, onBack, right, small, variant = "app" }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (variant === "auth") {
    return (
      <div className="auth-header">
        {onBack && (
          <button className="back-btn" onClick={handleBack}>
            <ChevronLeft />
          </button>
        )}
        <h2>{title}</h2>
      </div>
    );
  }

  return (
    <div className="app-header">
      {onBack ? (
        <div className="back-header">
          <button className="back-btn" onClick={handleBack}>
            <ChevronLeft />
          </button>
          <h1 style={small ? { fontSize: 18 } : undefined}>{title}</h1>
        </div>
      ) : (
        <h1>{title}</h1>
      )}
      {right && <div className="header-right">{right}</div>}
    </div>
  );
}
