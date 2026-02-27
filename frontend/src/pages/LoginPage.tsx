import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { AxiosError } from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      loginSuccess(data.access_token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      } else {
        setError("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isValid = email && password;

  return (
    <div className="screen">
      <div className="auth-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-700)" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>로그인</h2>
      </div>

      <form
        className="screen-content"
        onSubmit={handleSubmit}
        style={{ padding: "8px 24px 32px", display: "flex", flexDirection: "column" }}
      >
        {error && (
          <div className="error-toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ flex: 1 }} />

        <div>
          <button className="btn btn-primary" type="submit" disabled={!isValid || loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <div className="form-link">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
