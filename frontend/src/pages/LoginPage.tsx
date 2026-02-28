import { type FormEvent, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { AxiosError } from "axios";
import { PageHeader, FormField, Button } from "../components/ui";

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
      flushSync(() => {
        loginSuccess(data.access_token, data.user);
      });
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
      <PageHeader title="로그인" onBack variant="auth" />

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

        <FormField label="이메일">
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField label="비밀번호">
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <div style={{ flex: 1 }} />

        <div>
          <Button
            type="submit"
            disabled={!isValid}
            loading={loading}
            loadingText="로그인 중..."
          >
            로그인
          </Button>
          <div className="form-link">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
