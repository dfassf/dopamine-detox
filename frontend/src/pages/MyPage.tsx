import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      <div className="app-header">
        <h1>마이페이지</h1>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Profile card */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            padding: "24px 20px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "var(--primary-dark)",
                fontWeight: 700,
              }}
            >
              {user?.nickname?.charAt(0) || "?"}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>
                {user?.nickname}
              </div>
              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <MenuItem label="내 금욕 관리" onClick={() => navigate("/timeline")} />
          <Divider />
          <MenuItem label="로그아웃" onClick={handleLogout} danger />
        </div>

        {/* App info */}
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--gray-400)",
            lineHeight: 1.6,
          }}
        >
          restrainter v0.1.0
          <br />
          눈에 보이지 않는 변화를 타임라인으로
        </div>
      </div>
    </>
  );
}

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          fontSize: 15,
          color: danger ? "var(--red)" : "var(--gray-900)",
        }}
      >
        {label}
      </span>
      {!danger && (
        <span style={{ color: "var(--gray-300)", fontSize: 16 }}>{"\u203A"}</span>
      )}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--gray-100)",
        margin: "0 20px",
      }}
    />
  );
}
