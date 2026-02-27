import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="screen">
      <div
        className="screen-content"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: "var(--primary)",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--gray-900)",
            marginBottom: 12,
            letterSpacing: -0.5,
          }}
        >
          restrainter
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "var(--gray-500)",
            lineHeight: 1.6,
            marginBottom: 48,
          }}
        >
          눈에 보이지 않는 변화를
          <br />
          타임라인으로 보여드립니다
        </p>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn btn-primary" onClick={() => navigate("/signup")}>
            시작하기
          </button>
          <button className="btn btn-outline" onClick={() => navigate("/login")}>
            이미 계정이 있어요
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "var(--gray-400)", lineHeight: 1.5 }}>
          가입 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  );
}
